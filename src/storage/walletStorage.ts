const STORAGE_KEY = 'ton_wallet_mnemonic'

export function saveMnemonic(mnemonic: string[]): void {
    if (mnemonic.length === 0) {
        throw new Error('Mnemonic cannot be empty')
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mnemonic))
}

export function loadMnemonic(): string[] | null {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === null) return null

    try {
        const parsed = JSON.parse(raw) as unknown
        if (!Array.isArray(parsed) || !parsed.every(word => typeof word === 'string')) {
            return null
        }

        return parsed
    } catch {
        return null
    }
}

export function clearWallet(): void {
    localStorage.removeItem(STORAGE_KEY)
}
