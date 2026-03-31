import {mnemonicToPrivateKey} from '@ton/crypto'
import {
    WalletContractV4,
    internal,
    toNano,
    TonClient,
    Address,
    comment as makeComment
} from '@ton/ton'

const client = new TonClient({
    endpoint: 'https://testnet.toncenter.com/api/v2/jsonRPC',
    apiKey: import.meta.env.VITE_TONCENTER_API_KEY,
})

interface SendParams {
    mnemonic: string[]
    toAddress: string
    amount: string  // in TON
    comment?: string
}

export async function sendTransaction({
                                          mnemonic,
                                          toAddress,
                                          amount,
                                          comment
                                      }: SendParams): Promise<void> {
    // Derive keys from mnemonic
    const keyPair = await mnemonicToPrivateKey(mnemonic)

    // Recreate wallet contract
    const wallet = WalletContractV4.create({
        publicKey: keyPair.publicKey,
        workchain: 0,
    })

    // Open wallet contract via client
    const contract = client.open(wallet)

    // Get current seqno to prevent replay attacks
    const seqno = await contract.getSeqno()

    // Send transfer
    await contract.sendTransfer({
        secretKey: keyPair.secretKey,
        seqno,
        messages: [
            internal({
                to: Address.parse(toAddress),
                value: toNano(amount),
                bounce: false,
                // Use comment helper to create message body
                body: comment ? makeComment(comment) : undefined,
            }),
        ],
    })
}
