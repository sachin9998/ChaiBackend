import mongoose, { Schema } from "mongoose";

const userSchema = new Schema({});

const User = mongoose.model("User", userSchema);
