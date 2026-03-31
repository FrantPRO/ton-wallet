import {useState} from 'react'
import {createWallet, importWallet} from '../../crypto/wallet'
import {saveMnemonic} from '../../storage/walletStorage'

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

    // Step 1: choice between create and import
    if (step === 'choice') {
        return (
            <div>
                <h1>TON Wallet</h1>
                <p>Testnet</p>
                <button onClick={handleCreate} disabled={loading}>
                    {loading ? 'Creating...' : 'Create new wallet'}
                </button>
                <button onClick={() => setStep('import_form')}>
                    Import wallet
                </button>
            </div>
        )
    }

    // Step 2: show generated mnemonic before proceeding
    if (step === 'show_mnemonic') {
        return (
            <div>
                <h2>Save your mnemonic</h2>
                <p>
                    ⚠️ Write down these 24 words and store them in a safe place.
                    Without them you will permanently lose access to your
                    wallet.
                    Never share these words with anyone.
                </p>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '8px'
                }}>
                    {mnemonic.map((word, index) => (
                        <span key={index}>
              {index + 1}. {word}
            </span>
                    ))}
                </div>
                <button
                    onClick={() => navigator.clipboard.writeText(mnemonic.join(' '))}>
                    Copy to clipboard
                </button>
                <button onClick={handleMnemonicConfirmed}>
                    I have saved it, continue
                </button>
            </div>
        )
    }

    // Step 3: import form — paste or type mnemonic
    return (
        <div>
            <h2>Import wallet</h2>
            <p>Enter 24 mnemonic words separated by spaces</p>
            <textarea
                value={importText}
                onChange={e => setImportText(e.target.value)}
                placeholder="word1 word2 word3 ..."
                rows={4}
            />
            {error && <p style={{color: 'red'}}>{error}</p>}
            <button onClick={handleImport} disabled={loading}>
                {loading ? 'Importing...' : 'Import'}
            </button>
            <button onClick={() => setStep('choice')}>
                Back
            </button>
        </div>
    )
}
