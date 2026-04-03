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

interface TransactionAddressLike {
    toString(options?: {testOnly?: boolean; bounceable?: boolean}): string
}

interface TransactionValueLike {
    coins?: bigint
}

interface TransactionMessageInfo {
    type?: string
    value?: TransactionValueLike
    src?: TransactionAddressLike
    dest?: TransactionAddressLike
}

interface TransactionBodySlice {
    remainingBits: number
    loadUint(bits: number): number
    loadStringTail(): string
}

interface TransactionBodyLike {
    beginParse(): TransactionBodySlice
}

interface TransactionMessageLike {
    info?: TransactionMessageInfo
    body?: TransactionBodyLike
}

// One client instance for the entire application
const client = new TonClient({
    endpoint: 'https://testnet.toncenter.com/api/v2/jsonRPC',
    apiKey: import.meta.env.VITE_TONCENTER_API_KEY,
})

// Get a balance in TON
export async function getBalance(address: string): Promise<string> {
    try {
        const balance = await client.getBalance(Address.parse(address))
        return fromNano(balance)  // convert from nano-TON to TON
    } catch {
        throw new Error('Failed to load balance')
    }
}

// Get transaction history
export async function getTransactions(address: string): Promise<Transaction[]> {
    try {
        const txs = await client.getTransactions(Address.parse(address), {limit: 50})

        return txs.map(tx => {
            const inMessage = tx.inMessage as unknown as TransactionMessageLike | undefined
            const outMessage = Array.from(tx.outMessages.values())[0] as unknown as TransactionMessageLike | undefined
            const inInfo = inMessage?.info
            const outInfo = outMessage?.info
            const isIncoming = inInfo?.type === 'internal' && inInfo.dest?.toString() !== undefined

            // Amount: take from the incoming message if the incoming message, otherwise from the outgoing message
            const nanoAmount = isIncoming
                ? inInfo?.value?.coins ?? 0n
                : outInfo?.value?.coins ?? 0n

            const fromAddr = isIncoming
                ? inInfo?.src?.toString({
                    testOnly: true,
                    bounceable: false,
                }) ?? ''
                : address

            const toAddr = isIncoming
                ? address
                : outInfo?.dest?.toString({
                    testOnly: true,
                    bounceable: false,
                }) ?? ''

            let comment = ''
            try {
                const body = isIncoming ? inMessage?.body : outMessage?.body
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
    } catch {
        throw new Error('Failed to load transactions')
    }
}
