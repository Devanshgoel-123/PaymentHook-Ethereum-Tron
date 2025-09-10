# PaymentHook Ethereum-Tron

A blockchain payment monitoring and verification service that tracks transactions on Ethereum and Tron networks, providing real-time webhook notifications and payment verification for merchants.

## 🚀 Features

- **Multi-Chain Support**: Monitor payments on Ethereum and Tron networks
- **Real-time Webhooks**: Instant notifications when payments are received
- **Payment Verification**: Verify transaction amounts and status
- **Merchant Integration**: Easy API integration for e-commerce platforms
- **Database Tracking**: Persistent monitoring sessions with PostgreSQL
- **QuickNode Integration**: Leverages QuickNode for reliable blockchain data

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Web Client    │    │   PaymentHook    │    │   Blockchain    │
│                 │◄──►│     Server       │◄──►│   Networks      │
│                 │    │                  │    │ (ETH/TRON)      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌──────────────────┐
                       │   PostgreSQL     │
                       │   Database       │
                       └──────────────────┘
```

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Blockchain**: Ethers.js for Ethereum, QuickNode API
- **Webhooks**: Real-time transaction monitoring
- **Infrastructure**: Neon Database (serverless PostgreSQL)

## 📋 Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- QuickNode API key
- Environment variables configured

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd PaymentHook-Ethereum-Tron
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=3000

# Database Configuration
DATABASE_URL=postgresql://username:password@host:port/database

# QuickNode Configuration
QUICK_NODE_API_KEY=your_quicknode_api_key

# Webhook Configuration
WEBHOOK_URL=https://your-domain.com/api/webhooks
```

### 4. Database Setup

```bash
# Generate database migrations
npx drizzle-kit generate

# Apply migrations
npx drizzle-kit migrate
```

### 5. Start the Server

```bash
# Development mode
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:3000`

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Endpoints

#### Merchant Routes (`/api/merchant`)

##### Verify Transaction
```http
POST /api/merchant/verifyTransaction
```

**Request Body:**
```json
{
  "hash": "0x...",
  "address": "0x...",
  "amount": "100.50",
  "token": "USDC"
}
```

**Response:**
```json
{
  "verified": true,
  "transaction": {
    "hash": "0x...",
    "from": "0x...",
    "to": "0x...",
    "amount": "100.50",
    "token": "USDC",
    "status": "confirmed"
  }
}
```

#### Webhook Routes (`/api/webhook`)

##### Ethereum Webhook
```http
POST /api/webhooks/ethereum
```

##### Tron Webhook
```http
POST /api/webhooks/tron
```

#### Verification Routes (`/api/verify`)

##### Verify Payment
```http
POST /api/verify/payment
```

**Request Body:**
```json
{
  "sessionId": 123,
  "expectedAmount": "100.50",
  "token": "USDC"
}
```

#### Monitoring Routes (`/api/monitor`)

##### Create Monitoring Session
```http
POST /api/monitor/session
```

**Request Body:**
```json
{
  "address": "0x...",
  "amount": "100.50",
  "token": "USDC",
  "chainId": 1
}
```

## 🔧 Configuration

### Supported Networks

| Network | Chain ID | Confirmations Required |
|---------|----------|----------------------|
| Ethereum | 1 | 20 |
| Tron | 2 | 10 |

### Supported Tokens

- **Ethereum**: USDC, USDT, ETH
- **Tron**: USDT (TRC20)

### Webhook Configuration

The service integrates with QuickNode webhooks to monitor wallet addresses:

```typescript
// Webhook template configuration
{
  name: "My Wallet Monitor Webhook",
  network: "ethereum-mainnet",
  destination_attributes: {
    url: "https://your-domain.com/api/webhooks/ethereum",
    compression: "gzip"
  },
  templateArgs: {
    wallets: ["0x..."] // Addresses to monitor
  }
}
```

## 🗄️ Database Schema

### Monitoring Sessions

```sql
CREATE TABLE monitoring_sessions (
  id SERIAL PRIMARY KEY,
  address VARCHAR(255) NOT NULL,
  amount VARCHAR(255) NOT NULL,
  receivedAmount VARCHAR(255) NOT NULL,
  token VARCHAR(255) NOT NULL,
  txHash VARCHAR(255) DEFAULT '',
  chainId INTEGER NOT NULL,
  status VARCHAR(255) NOT NULL DEFAULT 'pending',
  createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
  updatedAt TIMESTAMP NOT NULL DEFAULT NOW()
);
```

## 🔄 Workflow

1. **Merchant Setup**: Merchant creates a monitoring session for a specific address and amount
2. **Webhook Registration**: System registers webhook with QuickNode to monitor the address
3. **Transaction Detection**: When a transaction occurs, webhook is triggered
4. **Verification**: System verifies the transaction amount and updates the session
5. **Notification**: Merchant receives confirmation of payment completion

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Test webhook endpoints
curl -X POST http://localhost:3000/api/webhooks/ethereum \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

## 🚀 Deployment

### Environment Variables for Production

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://...
QUICK_NODE_API_KEY=...
WEBHOOK_URL=https://your-domain.com
```

### Docker Deployment (Optional)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 📝 Development

### Project Structure

```
src/
├── db/                 # Database schema and connection
├── providers/          # Service providers for different chains
├── Routes/             # Express route handlers
├── services/           # Business logic services
├── utils/              # Utility functions and constants
└── webhooks/           # Webhook handling logic
```

### Adding New Chains

1. Create a new provider in `src/providers/`
2. Add chain constants in `src/utils/constants.ts`
3. Update webhook handlers in `src/webhooks/`
4. Add new routes in `src/Routes/`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Contact: devanshgoel112233@gmail.com

## 🔮 Roadmap

- [ ] Add support for more blockchain networks
- [ ] Implement payment retry mechanisms
- [ ] Add comprehensive logging and monitoring
- [ ] Create admin dashboard
- [ ] Add rate limiting and security enhancements
- [ ] Implement automated testing suite

---

**Built with ❤️ for the Web3 ecosystem**
