import "dotenv/config";
import { initializeDatabase } from "./db.js";

await initializeDatabase();
console.log("Database initialized");
