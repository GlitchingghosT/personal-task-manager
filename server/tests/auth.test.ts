import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import jwt from "jsonwebtoken";
import request from "supertest";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

process.env.JWT_SECRET = "test-only-secret-that-is-at-least-32-characters";
process.env.CLIENT_ORIGIN = "http://localhost:5173";
process.env.NODE_ENV = "test";

import app from "../app";
import User from "../models/userModel";

const validTestPassword = ["strong", "password"].join("-");
const invalidTestPassword = ["wrong", "password"].join("-");

let mongo: MongoMemoryServer;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
});

afterEach(async () => {
  await mongoose.connection.db?.dropDatabase();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

const validUser = {
  name: "Emmanuel",
  email: "Emmanuel@Example.com",
  password: validTestPassword,
};

describe("service health", () => {
  it("reports readiness without authentication", async () => {
    const response = await request(app).get("/api/health").expect(200);
    expect(response.body).toEqual({ status: "ok" });
  });
});

describe("authentication contract", () => {
  it("rejects passwords that exceed bcrypt's 72-byte input limit", async () => {
    const overlongPassword = "é".repeat(37);

    for (const endpoint of ["register", "login"] as const) {
      const body = endpoint === "register"
        ? { name: "Byte Boundary", email: "bytes@example.com", password: overlongPassword }
        : { email: "bytes@example.com", password: overlongPassword };
      const response = await request(app).post(`/api/auth/${endpoint}`).send(body);

      expect(response.status).toBe(400);
      expect(response.body.error).toMatchObject({
        code: "VALIDATION_ERROR",
        fields: { password: expect.any(String) },
      });
    }
  });

  it("registers a normalized user, hashes the password, and returns a token", async () => {
    const response = await request(app).post("/api/auth/register").send(validUser);

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      user: { name: "Emmanuel", email: "emmanuel@example.com" },
    });
    expect(response.body.user.id).toMatch(/^[a-f\d]{24}$/);
    expect(response.body.user).not.toHaveProperty("password");
    expect(response.body.token).toEqual(expect.any(String));

    const stored = await User.findOne({ email: "emmanuel@example.com" }).select("+password");
    expect(stored?.password).not.toBe(validUser.password);
    expect(stored?.password).toMatch(/^\$2[aby]\$/);
  });

  it.each([
    [{ email: "bad", password: "short", name: "x" }, ["name", "email", "password"]],
    [{ ...validUser, extra: true }, ["extra"]],
  ])("rejects invalid registration input", async (body, invalidFields) => {
    const response = await request(app).post("/api/auth/register").send(body);

    expect(response.status).toBe(400);
    expect(response.body.error).toMatchObject({
      code: "VALIDATION_ERROR",
      message: "Check the submitted fields.",
    });
    for (const field of invalidFields) {
      expect(response.body.error.fields).toHaveProperty(field);
    }
  });

  it("returns conflict for a duplicate normalized email", async () => {
    await request(app).post("/api/auth/register").send(validUser).expect(201);
    const response = await request(app)
      .post("/api/auth/register")
      .send({ ...validUser, email: "emmanuel@example.com" });

    expect(response.status).toBe(409);
    expect(response.body).toEqual({
      error: { code: "CONFLICT", message: "An account with that email already exists." },
    });
  });

  it("validates login input and rejects unknown fields", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({ email: "not-an-email", password: "short", admin: true });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
    expect(response.body.error.fields).toEqual(
      expect.objectContaining({ email: expect.any(String), password: expect.any(String), admin: expect.any(String) }),
    );
  });

  it("logs in with normalized email without exposing which credential was wrong", async () => {
    await request(app).post("/api/auth/register").send(validUser).expect(201);

    const success = await request(app)
      .post("/api/auth/login")
      .send({ email: "EMMANUEL@example.com", password: validUser.password });
    expect(success.status).toBe(200);
    expect(success.body.user.email).toBe("emmanuel@example.com");
    expect(success.body.token).toEqual(expect.any(String));

    const failure = await request(app)
      .post("/api/auth/login")
      .send({ email: "missing@example.com", password: invalidTestPassword });
    expect(failure.status).toBe(401);
    expect(failure.body).toEqual({
      error: { code: "UNAUTHENTICATED", message: "Invalid email or password." },
    });
  });

  it("requires a valid bearer token and returns the current user", async () => {
    const registration = await request(app).post("/api/auth/register").send(validUser).expect(201);

    const missing = await request(app).get("/api/auth/me");
    expect(missing.status).toBe(401);
    expect(missing.body.error.code).toBe("UNAUTHENTICATED");

    const invalid = await request(app)
      .get("/api/auth/me")
      .set("Authorization", "Bearer invalid-token");
    expect(invalid.status).toBe(401);
    expect(invalid.body.error.code).toBe("UNAUTHENTICATED");

    const current = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${registration.body.token}`);
    expect(current.status).toBe(200);
    expect(current.body).toEqual({ user: registration.body.user });
  });

  it("rejects expired tokens, unexpected algorithms, and deleted users", async () => {
    const registration = await request(app).post("/api/auth/register").send(validUser).expect(201);
    const subject = registration.body.user.id as string;
    const secret = process.env.JWT_SECRET as string;
    const claims = { issuer: "taskduty-api", audience: "taskduty-web" };
    const expired = jwt.sign({ sub: subject }, secret, {
      ...claims,
      algorithm: "HS256",
      expiresIn: -1,
    });
    const wrongAlgorithm = jwt.sign({ sub: subject }, secret, {
      ...claims,
      algorithm: "HS384",
      expiresIn: "1h",
    });

    for (const token of [expired, wrongAlgorithm]) {
      const response = await request(app).get("/api/auth/me").set("Authorization", `Bearer ${token}`);
      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe("UNAUTHENTICATED");
    }

    await User.deleteOne({ _id: subject });
    const deletedUser = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${registration.body.token}`);
    expect(deletedUser.status).toBe(401);
    expect(deletedUser.body.error.code).toBe("UNAUTHENTICATED");
  });
});

describe("per-user task contract", () => {
  async function registerUser(email: string, name = "Task User") {
    const response = await request(app)
      .post("/api/auth/register")
      .send({ name, email, password: validTestPassword })
      .expect(201);
    return response.body.token as string;
  }

  const authorization = (token: string) => ({ Authorization: `Bearer ${token}` });
  const validTask = {
    title: "Finish API integration",
    description: "Connect the task screens to the protected endpoints.",
    tag: "important",
  };

  it("requires authentication for task routes", async () => {
    const response = await request(app).get("/api/tasks");
    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe("UNAUTHENTICATED");
  });

  it("validates create input and rejects unknown fields", async () => {
    const token = await registerUser("validation@example.com");
    const response = await request(app)
      .post("/api/tasks")
      .set(authorization(token))
      .send({ title: "", description: "", tag: "other", owner: "attacker" });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
    expect(response.body.error.fields).toEqual(
      expect.objectContaining({
        title: expect.any(String),
        description: expect.any(String),
        tag: expect.any(String),
        owner: expect.any(String),
      }),
    );
  });

  it("creates, lists newest first, gets, updates, and deletes tasks", async () => {
    const token = await registerUser("crud@example.com");
    const first = await request(app)
      .post("/api/tasks")
      .set(authorization(token))
      .send(validTask)
      .expect(201);

    expect(first.body.task).toMatchObject(validTask);
    expect(first.body.task.id).toMatch(/^[a-f\d]{24}$/);
    expect(first.body.task).toEqual(
      expect.objectContaining({ createdAt: expect.any(String), updatedAt: expect.any(String) }),
    );
    expect(first.body.task).not.toHaveProperty("owner");
    expect(first.body.task).not.toHaveProperty("_id");

    const second = await request(app)
      .post("/api/tasks")
      .set(authorization(token))
      .send({ ...validTask, title: "Second task", tag: "urgent" })
      .expect(201);

    const list = await request(app).get("/api/tasks").set(authorization(token)).expect(200);
    expect(list.body.tasks.map((task: { id: string }) => task.id)).toEqual([
      second.body.task.id,
      first.body.task.id,
    ]);

    const fetched = await request(app)
      .get(`/api/tasks/${first.body.task.id}`)
      .set(authorization(token))
      .expect(200);
    expect(fetched.body).toEqual({ task: first.body.task });

    const updated = await request(app)
      .patch(`/api/tasks/${first.body.task.id}`)
      .set(authorization(token))
      .send({ title: "Updated title", tag: "normal" })
      .expect(200);
    expect(updated.body.task).toMatchObject({
      id: first.body.task.id,
      title: "Updated title",
      description: validTask.description,
      tag: "normal",
    });

    await request(app)
      .delete(`/api/tasks/${first.body.task.id}`)
      .set(authorization(token))
      .expect(204)
      .expect("");
    const missing = await request(app)
      .get(`/api/tasks/${first.body.task.id}`)
      .set(authorization(token));
    expect(missing.status).toBe(404);
    expect(missing.body.error.code).toBe("NOT_FOUND");
  });

  it("rejects empty patches and unknown update fields", async () => {
    const token = await registerUser("patch@example.com");
    const created = await request(app)
      .post("/api/tasks")
      .set(authorization(token))
      .send(validTask)
      .expect(201);

    for (const body of [{}, { completed: true }]) {
      const response = await request(app)
        .patch(`/api/tasks/${created.body.task.id}`)
        .set(authorization(token))
        .send(body);
      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe("VALIDATION_ERROR");
    }
  });

  it("returns a structured validation error for invalid object IDs", async () => {
    const token = await registerUser("ids@example.com");
    for (const method of ["get", "patch", "delete"] as const) {
      const call = request(app)[method]("/api/tasks/not-an-object-id").set(authorization(token));
      if (method === "patch") call.send({ title: "Valid title" });
      const response = await call;
      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe("VALIDATION_ERROR");
      expect(response.body.error.fields).toHaveProperty("id");
    }
  });

  it("isolates task lists and hides another user's task as not found", async () => {
    const ownerToken = await registerUser("owner@example.com", "Owner User");
    const otherToken = await registerUser("other@example.com", "Other User");
    const created = await request(app)
      .post("/api/tasks")
      .set(authorization(ownerToken))
      .send(validTask)
      .expect(201);
    const id = created.body.task.id;

    const otherList = await request(app).get("/api/tasks").set(authorization(otherToken)).expect(200);
    expect(otherList.body).toEqual({ tasks: [] });

    for (const method of ["get", "patch", "delete"] as const) {
      const call = request(app)[method](`/api/tasks/${id}`).set(authorization(otherToken));
      if (method === "patch") call.send({ title: "Stolen" });
      const response = await call;
      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        error: { code: "NOT_FOUND", message: "Task not found." },
      });
    }

    await request(app).get(`/api/tasks/${id}`).set(authorization(ownerToken)).expect(200);
  });
});

describe("rate-limit contract", () => {
  it("returns a structured JSON error after too many authentication attempts", async () => {
    let response;
    for (let attempt = 0; attempt < 101; attempt += 1) {
      response = await request(app)
        .post("/api/auth/login")
        .send({ email: "limited@example.com", password: invalidTestPassword });
    }

    expect(response?.status).toBe(429);
    expect(response?.headers["content-type"]).toContain("application/json");
    expect(response?.body).toEqual({
      error: {
        code: "RATE_LIMITED",
        message: "Too many authentication attempts. Try again later.",
      },
    });
  });
});
