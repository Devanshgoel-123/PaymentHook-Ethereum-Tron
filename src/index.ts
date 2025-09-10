import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { merchantRouter } from "./Routes/Merchant";
import { webhookRouter } from "./Routes/webhookRouter";
import { verifyRouter } from "./Routes/Verify";
import { monitorRouter } from "./Routes/Monitor";
import { INTERNAL_ERROR_CODE, SUCCESS_CODE } from "./utils/constants";
import { Request, Response } from "express";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/merchant", merchantRouter);
app.use("/api/webhook", webhookRouter);
app.use("/api/verify", verifyRouter);
app.use("/api/monitor", monitorRouter);



app.post("/api/webhooks/tron", async (req: Request, res: Response) => {
  try {
    res.status(SUCCESS_CODE).send({ message: "Tron webhook processed" });
  } catch (err) {
    console.error("Error processing Tron webhook:", err);
    res.status(INTERNAL_ERROR_CODE).send({ error: "Failed to process Tron webhook" });
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});