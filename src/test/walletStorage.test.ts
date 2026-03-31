import {describe, it, expect, beforeEach} from 'vitest'
import {saveMnemonic, loadMnemonic, clearWallet} from '../storage/walletStorage'

describe('walletStorage', () => {
    // Clear localStorage before each test
    beforeEach(() => {
        localStorage.clear()
    })

    it('saves and loads mnemonic correctly', () => {
        const mnemonic = ['word1', 'word2', 'word3']
        saveMnemonic(mnemonic)
        expect(loadMnemonic()).toEqual(mnemonic)
    })

    it('returns null when no mnemonic saved', () => {
        expect(loadMnemonic()).toBeNull()
    })

    it('throws when saving empty mnemonic', () => {
        expect(() => saveMnemonic([])).toThrow('Mnemonic cannot be empty')
    })

    it('clears mnemonic from storage', () => {
        saveMnemonic(['word1', 'word2'])
        clearWallet()
        expect(loadMnemonic()).toBeNull()
    })
})
