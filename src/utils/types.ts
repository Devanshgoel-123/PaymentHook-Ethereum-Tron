

export interface VerifyTraxnResult{
    verified: boolean,
    transaction: {
      hash: string,
      from: string,
      to: string,
      amount: string,
      token:string,
      status: boolean
    }
}