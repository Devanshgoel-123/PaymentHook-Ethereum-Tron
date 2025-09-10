import axios from "axios";
import { TEMPLATE_ID, BASE_QUICK_NODE_URL } from "../utils/constants";
/**
 * 
 * @param address 
 */
export const RegisterEthereumWebhook=async()=>{
    try{
        const url = `${BASE_QUICK_NODE_URL}/webhooks/rest/v1/webhooks/template/${TEMPLATE_ID}`
        const payload = {
            name: 'My Wallet Monitor Webhook',
            network: 'ethereum-mainnet',
            notification_email: 'devanshgoel112233@gmail.com',
            destination_attributes: {
                url: 'https://webhook.site/your-unique-url',
                compression: 'gzip',
            },
            status: 'active',
            templateArgs: {
                wallets: [
                ],
            },
        }
        const headers = {
            accept: 'application/json',
            'Content-Type': 'application/json',
            'x-api-key': 'YOUR_API_KEY', // Replace with your actual API key
        }
        const result = await axios
            .post(url, payload, { headers })
        console.log(result.data)
    }catch(err){
        console.error('Error:', err)
    }
}