import dotenv from "dotenv";
import express from "express";
import connectToDatabase from "./db";

dotenv.config();

const app = express();
const port = process.env.PORT ?? "5000";

app.use(express.json());

app.get("/api/orders", (_req, res) => {
  res.json({ status: "ok" });
});

async function startServer(): Promise<void> {
  try {
    await connectToDatabase();

    app.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
