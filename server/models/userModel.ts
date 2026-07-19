import mongoose, { InferSchemaType, Schema } from "mongoose";

const userSchema = new Schema(
  {
    name: { type: String, required: true, minlength: 2, maxlength: 80, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
    },
    password: { type: String, required: true, select: false },
  },
  { timestamps: true },
);

export type UserDocument = InferSchemaType<typeof userSchema>;

export default mongoose.model("User", userSchema);
