import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { merchantRouter } from "./Routes/Merchant";
import { webhookRouter } from "./webhooks/webhookRouter";
//import { RegisterWebhook } from "./providers/Ethereum/EthereumProvider";
//import { trackTransactionByHash } from "./services/montior";
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/merchant", merchantRouter);
app.use("/api/webhook", webhookRouter);



// app.post("/api/merchant", async (req:Request, res:Response) => {
//   const result = await req.body.matchingTransactions.map(async (item:any)=>{
//     const hash = item.hash;
//     const input = item.input;
//     const address = item.to;
//     return await completeMerchantOrderTracking(hash, address, input);
//   })
//   console.log(result);
//   res.status(200).send("Hello World");
// }); 

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});