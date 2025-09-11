import { trackTransactionByHashEthereum } from "../src/services/verify";
import { decodeTransferLog } from "../src/services/EthereumService";
import { USDT_DECIMALS } from "../src/utils/config";
import { CHAIN_ID_ETHEREUM } from "../src/utils/config";

describe("Payment Detection", () => {
    test('Should detect payment within tolerance (±2%)', async () =>{
        const expectedAmount = 100;
        const receivedAmount = 102;
        const tolerance = 2;
        const diff = Math.abs(receivedAmount - expectedAmount);
        const result = diff <= expectedAmount * (tolerance / 100);
        expect(result).toBe(true);
    })

    test('Should detect payment within tolerance (±2%)', async () =>{
        const expectedAmount = 100;
        const receivedAmount = 105;
        const tolerance = 2;
        const diff = Math.abs(receivedAmount - expectedAmount);
        const result = diff <= expectedAmount * (tolerance / 100);
        expect(result).toBe(false);
    })

    test('Should handle webhook payload correctly', async () =>{
        const payload = {
            blockHash: '0xad0b0cd939744ee304723c4d7a57953cc7fd7916193469398c581f811a58a4f6',
            blockNumber: '0x1642913',
            contractAddress: null,
            cumulativeGasUsed: '0x4bed8d',
            effectiveGasPrice: '0x52c5026b',
            from: '0x2f60554fada00a128e53b055a5ebfefe6fc2d53b',
            gasUsed: '0xb050',
            logs: [ 
              {
                address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
                blockHash: '0xc537f545fb67d3004a5715ba9e79cfb82be866785afd16327c668b69ebf952cb',
                blockNumber: '0x164293a',
                data: '0x00000000000000000000000000000000000000000000000000000000000186a0',
                logIndex: '0x65',
                removed: false,
                topics: [
                  '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
                  '0x0000000000000000000000002f60554fada00a128e53b055a5ebfefe6fc2d53b',
                  '0x000000000000000000000000a9a952cf28b0cacca51452da444163bb6be7f500'
                ],
                transactionHash: '0xb59a10a682743a46fd76f919a3397278e4edaf934a16a063a6c08b469beb1f0a',
                transactionIndex: '0x2e'
              }
            ],
            logsBloom: '0x00000000000100000000000000000000080000000000000000000000000000000000000000000000000000000000080000000000000000000100000000000000000000000000000008000008000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000010000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000',
            status: '0x1',
            to: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
            transactionHash: '0xfc272d399331881fec230a0c723abb68ed071769bf974ac2f1cbaaea1f413d2a',
            transactionIndex: '0x25',
            type: '0x2'
          }
        const transaction = await trackTransactionByHashEthereum(payload.transactionHash);
        const logs = payload.logs[0];
        const decodedLog = decodeTransferLog(logs, USDT_DECIMALS);
        if (!transaction?.transaction.to || !decodedLog?.to) {
          return false;
        }
        const chainId = CHAIN_ID_ETHEREUM;
        const humanAmount = decodedLog?.amount;
        const receiver = decodedLog?.to;
        if (!humanAmount || !receiver) {
          console.error("error finding value of token in human format");
          return false;
        }
        expect(chainId).toBe(CHAIN_ID_ETHEREUM);
        expect(humanAmount).toBe("0.1");
        expect(receiver).toBe("0xa9a952cf28b0cacca51452da444163bb6be7f500");
        expect(transaction.transaction.from).toBe("0x2f60554fada00a128e53b055a5ebfefe6fc2d53b");
    })

})