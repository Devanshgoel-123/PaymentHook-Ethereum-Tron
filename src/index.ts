import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { webhookRouter } from "./Routes/webhookRouter";
import { verifyRouter } from "./Routes/Verify";
import { monitorRouter } from "./Routes/Monitor";
import { cleanupRouter } from "./Routes/Cleanup";
import { EthereumProvider } from "./providers/Ethereum/EthereumProvider";
import { TronProvider } from "./providers/Tron/TronProvider";
import { cleanupService } from "./services/cleanupService";

dotenv.config();

const ValidateEnvironmentVariables = () => {
  if (!process.env.QUICK_NODE_API_KEY) {
    throw new Error("QUICK_NODE_API_KEY is not set");
  }
  if (!process.env.PORT) {
    throw new Error("PORT is not set");
  }
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }
  if(!process.env.BACKEND_URL){
    throw new Error("BACKEND_URL is not set");
  }
  if(!process.env.TRON_API_KEY){
    throw new Error("TRON_API_KEY is not set");
  }
};

const app = express();

export const ethereumProvider = new EthereumProvider();
export const tronProvider = new TronProvider();

app.use(cors());
app.use(express.json());

app.use("/api/webhook", webhookRouter);
app.use("/api/verify", verifyRouter);
app.use("/api/monitor", monitorRouter);
app.use("/api/cleanup", cleanupRouter);


app.listen(process.env.PORT, async () => {
  try {
    ValidateEnvironmentVariables();
    // Start the cleanup service for expired monitoring sessions
    cleanupService.start();
    console.log(`Server is running on port ${process.env.PORT}`);
  } catch (err) {
    console.error("Error validating environment variables:", err);
    process.exit(1);
  }
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Received SIGINT. Gracefully shutting down...');
  await ethereumProvider.PauseWebhook();
  await tronProvider.PauseWebhook();
  cleanupService.stop();
  process.exit(0);
});


process.on('SIGTERM', async () => {
  console.log('Received SIGTERM. Gracefully shutting down...');
  await ethereumProvider.PauseWebhook();
  await tronProvider.PauseWebhook();
  cleanupService.stop();
  process.exit(0);
});

