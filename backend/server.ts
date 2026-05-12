import dotenv from "dotenv";
import express from "express";
import connectToDatabase from "./db";
import orderRouter from "./routes/order.route";
import reportRouter from "./routes/report.route";

dotenv.config();

const app = express();
const port = process.env.PORT ?? "5000";

app.use(express.json());

app.use("/api/orders", orderRouter);
app.use("/api/reports", reportRouter);

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
