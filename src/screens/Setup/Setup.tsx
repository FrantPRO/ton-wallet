import {useState} from 'react'
import {createWallet, importWallet} from '../../crypto/wallet'
import {saveMnemonic} from '../../storage/walletStorage'
import styles from './Setup.module.css'

type SetupStep = 'choice' | 'show_mnemonic' | 'import_form'

interface SetupProps {
    onComplete: (mnemonic: string[], address: string) => void
}

export function Setup({onComplete}: SetupProps) {
    const [step, setStep] = useState<SetupStep>('choice')
    const [mnemonic, setMnemonic] = useState<string[]>([])
    const [address, setAddress] = useState('')
    const [importText, setImportText] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    // Generate new wallet and show mnemonic to user
    async function handleCreate() {
        setLoading(true)
        try {
            const wallet = await createWallet()
            setMnemonic(wallet.mnemonic)
            setAddress(wallet.address)
            setStep('show_mnemonic')
        } catch (e) {
            setError('Failed to create wallet')
        } finally {
            setLoading(false)
        }
    }

    // Validate and import wallet from mnemonic words
    async function handleImport() {
        setError('')
        const words = importText.trim().split(/\s+/)
        if (words.length !== 24) {
            setError(`Mnemonic must contain 24 words, got: ${words.length}`)
            return
        }
        setLoading(true)
        try {
            const wallet = await importWallet(words)
            saveMnemonic(wallet.mnemonic)
            onComplete(wallet.mnemonic, wallet.address)
        } catch (e) {
            setError('Invalid mnemonic')
        } finally {
            setLoading(false)
        }
    }

    // User confirmed mnemonic saved — persist and proceed to dashboard
    function handleMnemonicConfirmed() {
        saveMnemonic(mnemonic)
        onComplete(mnemonic, address)
    }

    async function handleCopyMnemonic() {
        try {
            await navigator.clipboard.writeText(mnemonic.join(' '))
        } catch {
            setError('Failed to copy mnemonic')
        }
    }

    // Step 1: choice between create and import
    if (step === 'choice') {
        return (
            <div className={styles.container}>
                <div className={styles.logo}>💎</div>
                <div>
                    <h1 className={styles.title}>TON Wallet</h1>
                    <p className={styles.subtitle}>Testnet</p>
                </div>
                <div className={styles.choiceButtons}>
                    <button className={styles.btnPrimary} onClick={handleCreate}
                            disabled={loading}>
                        {loading ? 'Creating...' : 'Create new wallet'}
                    </button>
                    <button className={styles.btnSecondary}
                            onClick={() => setStep('import_form')}>
                        Import wallet
                    </button>
                </div>
            </div>
        )
    }

    // Step 2: show generated mnemonic before proceeding
    if (step === 'show_mnemonic') {
        return (
            <div className={styles.container}>
                <h2>Save your mnemonic</h2>
                <div className={styles.mnemonicContainer}>
                    <p className={styles.warning}>
                        ⚠️ Write down these 24 words and store them in a safe
                        place.
                        Without them you will permanently lose access to your
                        wallet.
                        Never share these words with anyone.
                    </p>
                    <div className={styles.mnemonicGrid}>
                        {mnemonic.map((word, index) => (
                            <div key={index} className={styles.mnemonicWord}>
                                <span
                                    className={styles.mnemonicIndex}>{index + 1}</span>
                                {word}
                            </div>
                        ))}
                    </div>
                    <div className={styles.mnemonicActions}>
                        <button
                            className={styles.btnSecondary}
                            onClick={handleCopyMnemonic}>
                            Copy to clipboard
                        </button>
                        <button className={styles.btnPrimary}
                                onClick={handleMnemonicConfirmed}>
                            I have saved it
                        </button>
                    </div>
                    {error && <p className={styles.error}>{error}</p>}
                </div>
            </div>
        )
    }

    // Step 3: import form — paste or type mnemonic
    return (
        <div className={styles.container}>
            <h2>Import wallet</h2>
            <div className={styles.importContainer}>
                <p className={styles.subtitle}>Enter 24 mnemonic words separated
                    by spaces</p>
                <textarea
                    value={importText}
                    onChange={e => setImportText(e.target.value)}
                    placeholder="word1 word2 word3 ..."
                    rows={4}
                />
                {error && <p className={styles.error}>{error}</p>}
                <button className={styles.btnPrimary} onClick={handleImport}
                        disabled={loading}>
                    {loading ? 'Importing...' : 'Import'}
                </button>
                <button className={styles.btnSecondary}
                        onClick={() => setStep('choice')}>
                    Back
                </button>
            </div>
        </div>
    )
}
