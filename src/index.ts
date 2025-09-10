import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { webhookRouter } from "./Routes/webhookRouter";
import { verifyRouter } from "./Routes/Verify";
import { monitorRouter } from "./Routes/Monitor";
import { EthereumProvider } from "./providers/Ethereum/EthereumProvider";
import { trackTransactionByHash } from "./services/verify";

dotenv.config();

const ValidateEnvironmentVariables = () => {
  if(!process.env.QUICK_NODE_API_KEY){
    throw new Error("QUICK_NODE_API_KEY is not set");
  }
  if(!process.env.PORT){
    throw new Error("PORT is not set");
  }
  if(!process.env.DATABASE_URL){
    throw new Error("DATABASE_URL is not set");
  }
  // if(!process.env.BACKEND_URL){
  //   throw new Error("BACKEND_URL is not set");
  // }
  
}

const app = express();

export const ethereumProvider = new EthereumProvider();


app.use(cors());
app.use(express.json());


app.use("/api/webhook", webhookRouter);
app.use("/api/verify", verifyRouter);
app.use("/api/monitor", monitorRouter);


trackTransactionByHash("0xdc3504685dedba632acb4092592ed60e92425780e30740b06f89c0e21bd0513f")

app.listen(process.env.PORT, () => {
  try{
    ValidateEnvironmentVariables();
    console.log(`Server is running on port ${process.env.PORT}`);
  }catch(err){
    console.error("Error validating environment variables:", err);
    process.exit(1);
  }
});