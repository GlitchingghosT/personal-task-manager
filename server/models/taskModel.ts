import mongoose, { Document, Schema } from "mongoose"

export interface TaskInterface extends Document {
    title: string;
    description: string;
    tag: string;
}

const taskSchema = new Schema<TaskInterface>({
    title: { type: String, required: true },
    description: { type: String, required: true },
    tag: { type: String, required: true },
});

export default mongoose.model<TaskInterface>("Task", taskSchema);