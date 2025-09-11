# Payment System FAQ

This document explains how our payment monitoring system handles critical issues in simple terms.

## 1. What happens if the webhook provider is down?

### The Problem
If QuickNode (our webhook provider) goes down, we won't receive notifications about new transactions.

### How We Handle It
- **Error Handling**: Our webhook endpoints catch errors and return proper error codes
- **Logging**: All webhook failures are logged for debugging
- **Graceful Degradation**: The system continues to work, but new payments won't be detected until the provider is back up
- **Manual Recovery**: We can manually check for missed transactions using transaction hash verification

### What This Means
- Existing monitoring sessions stay active
- New payments won't be detected automatically
- Once the provider is back up, normal operation resumes
- No data is lost - we can catch up on missed transactions by simply starting the webhook from the time where it stopped. QuickNode has a parameter in the post api to start webhook

## 2. How do you prevent processing the same payment twice?

### The Problem
The same transaction could be processed multiple times, causing duplicate payments.

### How We Prevent It
- **Transaction Hash Tracking**: Each payment is linked to a unique transaction hash (`txHash`)
- **Database Constraints**: The system stores transaction hashes in the database
- **Status Checking**: Before processing, we check if a transaction hash already exists
- **Session Matching**: We only match payments to active monitoring sessions

### The Process
1. When a payment comes in, we get its transaction hash
2. We check if this hash was already processed
3. If it's new, we process it and mark it as completed
4. If it's already processed, we ignore it

### What This Means
- Each transaction is only processed once
- No duplicate payments to merchants
- Reliable payment tracking
- Database maintains a complete history

## 3. How do you handle different USDT decimals on different chains?

### The Problem
USDT has different decimal places on different blockchains:
- Ethereum: 6 decimals
- Tron: 6 decimals (same as Ethereum)

### How We Handle It
- **Configuration**: We store decimal information in `config.ts`
- **Chain-Specific Processing**: Each chain uses its correct decimal value
- **Consistent Conversion**: All amounts are converted to human-readable format using the right decimals

### The Code
```typescript
// From config.ts
export const USDT_DECIMALS = 6; // Both Ethereum and Tron use 6 decimals

// When processing amounts
const amount = ethers.formatUnits(rawAmount, USDT_DECIMALS);
```

### What This Means
- Accurate amount calculations across all chains
- No confusion between different decimal formats
- Consistent user experience
- Easy to add new chains with different decimal values

## 4. What's your strategy for expired monitoring sessions?

### The Problem
Monitoring sessions can get stuck if payments never arrive, wasting resources.

### How We Handle It
- **Automatic Cleanup**: A cleanup service runs every minute
- **5-Minute Timeout**: Sessions expire after 5 minutes if no payment is received although this time could be reduced but we have kept it just for safety
- **Status Updates**: Expired sessions are marked as "expired" instead of deleted
- **Resource Management**: Expired sessions free up monitoring resources

### The Cleanup Process
1. **Every Minute**: The cleanup service checks for old sessions
2. **Find Expired**: Looks for sessions older than 5 minutes that are still "monitoring"
3. **Mark Expired**: Changes status from "monitoring" to "expired"
4. **Log Results**: Records how many sessions were expired

### Session Statuses
- **Monitoring**: Actively waiting for payment
- **Completed**: Payment received successfully
- **Expired**: Timeout reached, no payment received

### What This Means
- No stuck sessions forever
- Automatic resource cleanup
- Historical data preserved
- System stays responsive
- Clear audit trail of all sessions

## 5. Logging and Error Tracking

### Current State
Due to time limitations, a comprehensive logging system could not be implemented in this version.

### Recommended Improvement: Telegram Bot Integration
A Telegram bot can be easily initialized to provide real-time error tracking and system monitoring:

#### Benefits of Telegram Bot Logging
- **Real-time Alerts**: Get instant notifications when errors occur
- **Easy Monitoring**: Track system health from anywhere via Telegram
- **Error Sorting**: Organize and categorize different types of errors
- **Team Collaboration**: Share error logs with team members instantly
- **Historical Tracking**: Keep a chat history of all system events

#### What the Bot Could Track
- Webhook provider failures
- Duplicate payment attempts
- Session expiration events
- Database connection issues
- Transaction processing errors
- System startup/shutdown events

#### Implementation Benefits
- **Low Cost**: Telegram bots are free to implement
- **High Reliability**: Telegram has excellent uptime
- **Easy Setup**: Simple API integration
- **Mobile Access**: Monitor system from phone
- **Searchable**: Easy to find specific error messages

### Future Enhancement
Implementing a Telegram bot would significantly improve system observability and make debugging much easier for the development team.

## Summary

Our payment system is designed to be:
- **Reliable**: Handles provider outages gracefully
- **Safe**: Prevents duplicate payments
- **Accurate**: Handles different chain formats correctly
- **Efficient**: Automatically cleans up expired sessions


