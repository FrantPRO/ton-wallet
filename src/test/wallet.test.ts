// @vitest-environment node
import {describe, it, expect, vi} from 'vitest'

// Mock @ton/crypto
vi.mock('@ton/crypto', () => ({
    mnemonicNew: vi.fn(async () => Array.from({length: 24}, (_, i) => `word${i + 1}`)),
    mnemonicToPrivateKey: vi.fn(async () => ({
        publicKey: new Uint8Array(32).fill(1),
        secretKey: new Uint8Array(64).fill(2),
    })),
}))

// Mock @ton/ton to avoid Buffer issues in test environment
vi.mock('@ton/ton', () => ({
    WalletContractV4: {
        create: vi.fn(() => ({
            address: {
                toString: vi.fn(() => '0QABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstu'),
            },
        })),
    },
}))

import {createWallet, importWallet, deriveAddress} from '../crypto/wallet'

describe('wallet', () => {
    it('creates wallet with 24-word mnemonic', async () => {
        const wallet = await createWallet()
        expect(wallet.mnemonic).toHaveLength(24)
        expect(wallet.address).toBeTruthy()
    })

    it('generates valid TON testnet address', async () => {
        const wallet = await createWallet()
        expect(wallet.address).toMatch(/^0Q/)
    })

    it('imports wallet and returns same mnemonic', async () => {
        const mnemonic = Array.from({length: 24}, (_, i) => `word${i + 1}`)
        const imported = await importWallet(mnemonic)
        expect(imported.mnemonic).toEqual(mnemonic)
        expect(imported.address).toBeTruthy()
    })

    it('derives same address from same mnemonic twice', async () => {
        const mnemonic = Array.from({length: 24}, (_, i) => `word${i + 1}`)
        const address1 = await deriveAddress(mnemonic)
        const address2 = await deriveAddress(mnemonic)
        expect(address1).toBe(address2)
    })
})
