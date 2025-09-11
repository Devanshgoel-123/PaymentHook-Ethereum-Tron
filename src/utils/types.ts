/**
 * Transaction info
 */
interface TransactionInfo {
    hash: string,
    from?: string,
    to: string,
    amount: string,
    token:string,
    status:string
}

/**
 * Payment match
 */
interface PaymentMatch {
    expected: string,
    received: string,
    matches: boolean
}

/**
 * Verify a transaction result
 */
export interface VerifyTraxnResult{
    verified: boolean,
    transaction: TransactionInfo
}

/**
 * Verify a payment result
 */
export interface VerifyPaymentResult {
  verified: boolean;
  transaction: TransactionInfo;
  payment_match: PaymentMatch;
}


export interface TransactionDataTron {
    "0": string;   // from address
    "1": string;   // to address
    "2": string;   // value as string
    from: string;  // from address
    to: string;    // to address
    value: string; // value as string
  }