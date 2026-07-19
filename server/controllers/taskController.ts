import type { Request, Response } from "express";
import Task from "../models/taskModel";
import { ApiError } from "../middleware/errorHandler";

function taskResponse(task: {
  _id: unknown;
  title: string;
  description: string;
  tag: string;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: String(task._id),
    title: task.title,
    description: task.description,
    tag: task.tag,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  };
}

export async function createTask(req: Request, res: Response) {
  const task = await Task.create({ owner: req.userId, ...req.body });
  return res.status(201).json({ task: taskResponse(task) });
}

export async function listTasks(req: Request, res: Response) {
  const tasks = await Task.find({ owner: req.userId }).sort({ createdAt: -1, _id: -1 }).limit(500);
  return res.json({ tasks: tasks.map(taskResponse) });
}

export async function getTask(req: Request, res: Response) {
  const task = await Task.findOne({ _id: req.params.id, owner: req.userId });
  if (!task) throw new ApiError(404, "NOT_FOUND", "Task not found.");
  return res.json({ task: taskResponse(task) });
}

export async function updateTask(req: Request, res: Response) {
  const task = await Task.findOneAndUpdate(
    { _id: req.params.id, owner: req.userId },
    { $set: req.body },
    { returnDocument: "after", runValidators: true },
  );
  if (!task) throw new ApiError(404, "NOT_FOUND", "Task not found.");
  return res.json({ task: taskResponse(task) });
}

export async function deleteTask(req: Request, res: Response) {
  const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.userId });
  if (!task) throw new ApiError(404, "NOT_FOUND", "Task not found.");
  return res.status(204).send();
}
