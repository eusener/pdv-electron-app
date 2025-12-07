export interface PaymentRequest {
    amount: number;
    paymentMethod: 'credit' | 'debit' | 'pix';
    taxSplit?: {
        ibs: number;
        cbs: number;
    };
}

export interface PaymentResponse {
    success: boolean;
    transactionId: string;
    message: string;
    authorizationCode?: string;
}

export class TefService {
    async processPayment(request: PaymentRequest): Promise<PaymentResponse> {
        console.log('💳 TEF: Starting Transaction...');
        console.log(`💰 Amount: R$ ${request.amount.toFixed(2)}`);

        if (request.taxSplit) {
            console.log('⚖️  SPLIT PAYMENT DETECTED (Reforma Tributária)');
            console.log(`   IBS: R$ ${request.taxSplit.ibs.toFixed(2)} -> Destined to Council/State Account`);
            console.log(`   CBS: R$ ${request.taxSplit.cbs.toFixed(2)} -> Destined to Federal Account`);
        } else {
            console.log('ℹ️  No Tax Split info provided.');
        }

        // Simulate Hardware Interaction
        await new Promise(resolve => setTimeout(resolve, 1500));

        return {
            success: true,
            transactionId: Math.random().toString(36).substring(7).toUpperCase(),
            message: 'APPROVED',
            authorizationCode: '123456'
        };
    }
}
