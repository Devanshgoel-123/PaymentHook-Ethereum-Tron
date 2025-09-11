import { TronWeb } from "tronweb";
import { config } from "dotenv";
import ethers from "ethers";
import { convertValuetoHumanFormat } from "./montior";
config();
/**
 * Register a webhook client for Tron
 * @returns TronWeb client
 */
export const registerWebhookClientTron = () => {
    const API_KEY=process.env.TRON_API_KEY;
    if(!API_KEY){
        throw new Error("TRON_API_KEY is not set");
    }
    const tronWeb = new TronWeb({
        fullHost: 'https://api.trongrid.io',
        headers: { 'TRON-PRO-API-KEY': API_KEY },
      });
    return tronWeb;
};


/**
 * Process the event result
 * @param event 
 * @returns 
 */
export const processEventResult=(event:any)=>{
  try{
    const from=event["0"];
    const to=event["1"];
    const value=parseFloat(event["2"]);
    const valueInHumanFormat = convertValuetoHumanFormat(value)
    return {
      from,
      to,
      valueInHumanFormat
    }
  }catch(err){
    console.error("Error processing event result",err);
    return null;
  }
}



// const TRANSFER_ABI = [
//   "event Transfer(address indexed from, address indexed to, uint256 value)"
// ];

// // Assume you have tronWeb and txHash
// export const extractTransferDetails = async (txHash:string, tronWeb:TronWeb) => {
//   const info = await tronWeb.trx.getTransactionInfo(txHash);
//   const rawTx = await tronWeb.trx.getTransaction(txHash);  // For 'from'

//   if (info.receipt.result !== 'SUCCESS') {
//     throw new Error('Transaction failed');
//   }

//   const fromHex = rawTx?.raw_data?.contract[0]?.parameter.value.owner_address;
//   if(!fromHex){
//     throw new Error('Invalid transaction');
//   }
//   const from = tronWeb.address.fromHex(fromHex);
//   const hash = info.id;

//   // Decode log for 'to' and 'amount' (assume single Transfer log)
//   const log = info.log[0];
//   if(!log){
//     throw new Error('Invalid transaction');
//   }
//   console.log(log, from, hash);
//   const iface = new ethers.Interface(TRANSFER_ABI);
//  console.log(iface);
//   const parsedLog = iface.parseLog({
//     topics: log.topics.map(t => '0x' + t),  // Add 0x if missing
//     data: '0x' + log.data
//   });

//   let to, amount;
//   if (parsedLog && parsedLog.name === 'Transfer') {
//     to = tronWeb.address.fromHex(parsedLog.args.to);  // Convert to Base58
//     amount = ethers.formatUnits(parsedLog.args.value, 6).toString();  // USDT: 6 decimals
//   } else {
//     // Fallback: Slice data for non-standard log (your case)
//     const dataHex = '0x' + log.data;
//     const amountWei = (dataHex.slice(0, 66)).toString();  // First 32 bytes after 0x
//     amount = ethers.formatUnits(amountWei, 6).toString();  // '10'
//     // 'to' from topics[2] if available: tronWeb.address.fromHex('0x' + log.topics[2].slice(26)); // Last 20 bytes
//     to = 'TXSjGe7jtfHwiTFxxfER8PKVz9vc1N8u2x';  // From your initial query (decoded)
//   }

//   // Token symbol: Hardcode or call contract
//   const tokenContractHex = info.contract_address;
//   const tokenSymbol = 'USDT';  // Or await tronWeb.trx.callConstantContract(... 'symbol()')

//   return {
//     verified: true,
//     transaction: {
//       hash,
//       from,
//       to,
//       amount,  // e.g., '10'
//       token: tokenSymbol,
//       status: 'completed'
//     }
//   };
// };

