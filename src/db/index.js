import mongoose from "mongoose";
import { DB_NAME } from "../constants";

const connectDB = async () => {
  try {

  } catch (error) {
    console.log("MONGODB Connection Error", error);
    process.exit(1);
}
};
