import '@testing-library/jest-dom'
import {Buffer} from 'buffer'
import {webcrypto} from 'crypto'

// Polyfills for @ton/crypto in test environment
globalThis.Buffer = Buffer
Object.defineProperty(globalThis, 'crypto', {
    value: webcrypto,
})

// Mock localStorage for jsdom environment
const localStorageMock = (() => {
    let store: Record<string, string> = {}
    return {
        getItem: (key: string) => store[key] ?? null,
        setItem: (key: string, value: string) => {
            store[key] = value
        },
        removeItem: (key: string) => {
            delete store[key]
        },
        clear: () => {
            store = {}
        },
    }
})()

Object.defineProperty(globalThis, 'localStorage', {
    value: localStorageMock,
})
