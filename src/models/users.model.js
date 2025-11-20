import { model, Schema } from "mongoose";

const userSchema = new Schema(
  {
    fullname: { type: String, required: true },
    birthDate: { type: Date, required: true },
    gmail: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin", "user"], default: "user" },
    status: { type: String, enum: ["active", "blocked"], default: "active" },
  },
  { timestamps: true }
);

const Users = model("Users", userSchema);
export default Users;
