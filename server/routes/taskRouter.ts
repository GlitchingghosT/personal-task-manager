import type { NextFunction, Request, Response } from "express";
import { Router } from "express";
import { Types } from "mongoose";
import { z } from "zod";
import {
  createTask,
  deleteTask,
  getTask,
  listTasks,
  updateTask,
} from "../controllers/taskController";
import { requireAuth } from "../middleware/auth";
import { ApiError, validateBody } from "../middleware/errorHandler";
import { taskTags } from "../models/taskModel";

const router = Router();
const taskFields = {
  title: z.string().trim().min(1, "Title is required.").max(120),
  description: z.string().trim().min(1, "Description is required.").max(2000),
  tag: z.enum(taskTags, { message: "Choose urgent, important, or normal." }),
};
const createSchema = z.object(taskFields).strict();
const updateSchema = z
  .object({
    title: taskFields.title.optional(),
    description: taskFields.description.optional(),
    tag: taskFields.tag.optional(),
  })
  .strict()
  .refine((body) => Object.keys(body).length > 0, {
    message: "Submit at least one field.",
  });

function validateTaskId(req: Request, _res: Response, next: NextFunction) {
  if (!Types.ObjectId.isValid(String(req.params.id))) {
    return next(
      new ApiError(400, "VALIDATION_ERROR", "Check the submitted fields.", {
        id: "Enter a valid task ID.",
      }),
    );
  }
  return next();
}

router.use(requireAuth);
router.get("/", listTasks);
router.post("/", validateBody(createSchema), createTask);
router.get("/:id", validateTaskId, getTask);
router.patch("/:id", validateTaskId, validateBody(updateSchema), updateTask);
router.delete("/:id", validateTaskId, deleteTask);

export default router;
