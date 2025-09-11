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
git clone https://github.com/Devanshgoel-123/PaymentHook-Ethereum-Tron.git
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

# TronApi Key
TRON_API_KEY=your_tron_api_key
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
```

The server will start on `http://localhost:3000`

## 📚 API Documentation

### Base URL

```
http://localhost:3000/api
```

## 🔧 Configuration

### Supported Networks

| Network  | Chain ID |
| -------- | -------- | 
| Ethereum | 1        | 
| Tron     | 2        | 

### Supported Tokens

- **Ethereum**: USDT
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


## 🧪 Testing

```bash
# Run tests (when implemented)
npm test


### Environment Variables for Production

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://...
QUICK_NODE_API_KEY=...
WEBHOOK_URL=https://your-domain.com
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

---

**Built with ❤️ for the Web3 ecosystem**
