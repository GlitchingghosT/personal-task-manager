import mongoose, { Schema, Types } from "mongoose";

export const taskTags = ["urgent", "important", "normal"] as const;

const taskSchema = new Schema(
  {
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, minlength: 1, maxlength: 120, trim: true },
    description: { type: String, required: true, minlength: 1, maxlength: 2000, trim: true },
    tag: { type: String, required: true, enum: taskTags },
  },
  { timestamps: true },
);

taskSchema.index({ owner: 1, createdAt: -1 });

export interface TaskShape {
  _id: Types.ObjectId;
  owner: Types.ObjectId;
  title: string;
  description: string;
  tag: (typeof taskTags)[number];
  createdAt: Date;
  updatedAt: Date;
}

export default mongoose.model("Task", taskSchema);
