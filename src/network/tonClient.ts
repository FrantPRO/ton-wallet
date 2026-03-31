import {TonClient, fromNano, Address} from '@ton/ton'

// Type for a transaction in history
export interface Transaction {
    hash: string
    timestamp: number        // unix timestamp
    amount: string           // in TON
    fromAddress: string
    toAddress: string
    comment: string          // optional, can be empty
    isIncoming: boolean      // incoming or outgoing
}

// One client instance for the entire application
const client = new TonClient({
    endpoint: 'https://testnet.toncenter.com/api/v2/jsonRPC',
    apiKey: import.meta.env.VITE_TONCENTER_API_KEY,
})

// Get a balance in TON
export async function getBalance(address: string): Promise<string> {
    const balance = await client.getBalance(Address.parse(address))
    return fromNano(balance)  // convert from nano-TON to TON
}

// Get transaction history
export async function getTransactions(address: string): Promise<Transaction[]> {
    const txs = await client.getTransactions(Address.parse(address), {limit: 50})

    return txs.map(tx => {
        const isIncoming = tx.inMessage?.info.type === 'internal' &&
            tx.inMessage?.info.dest?.toString() !== undefined

        // Amount: take from the incoming message if the incoming message, otherwise from the outgoing message
        const nanoAmount = isIncoming
            ? (tx.inMessage?.info as any).value?.coins ?? 0n
            : (tx.outMessages.values()[0]?.info as any)?.value?.coins ?? 0n

        const fromAddr = isIncoming
            ? (tx.inMessage?.info as any).src?.toString({
            testOnly: true,
            bounceable: false
        }) ?? ''
            : address

        const toAddr = isIncoming
            ? address
            : (tx.outMessages.values()[0]?.info as any)?.dest?.toString({
            testOnly: true,
            bounceable: false
        }) ?? ''

        let comment = ''
        try {
            const body = isIncoming ? tx.inMessage?.body : tx.outMessages.values()[0]?.body
            if (body) {
                const slice = body.beginParse()
                if (slice.remainingBits >= 32 && slice.loadUint(32) === 0) {
                    comment = slice.loadStringTail()
                }
            }
        } catch {
            // no comment – not critical
        }

        return {
            hash: tx.hash().toString('hex'),
            timestamp: tx.now,
            amount: fromNano(nanoAmount),
            fromAddress: fromAddr,
            toAddress: toAddr,
            comment,
            isIncoming,
        }
    })
}
