import {useState} from 'react'
import {Address} from '@ton/ton'
import {sendTransaction} from '../../crypto/transactions'

interface SendProps {
    mnemonic: string[]
    address: string
    knownAddresses: string[]  // from transaction history for new address warning
    onBack: () => void
    onSuccess: () => void
}

type SendStep = 'form' | 'confirm' | 'sending' | 'success' | 'error'

export function Send({
                         mnemonic,
                         address,
                         knownAddresses,
                         onBack,
                         onSuccess
                     }: SendProps) {
    const [step, setStep] = useState<SendStep>('form')
    const [toAddress, setToAddress] = useState('')
    const [amount, setAmount] = useState('')
    const [comment, setComment] = useState('')
    const [error, setError] = useState('')
    const [showPasteConfirm, setShowPasteConfirm] = useState(false)
    const [pastedAddress, setPastedAddress] = useState('')

    // Validate address format
    function isValidAddress(addr: string): boolean {
        try {
            Address.parse(addr)
            return true
        } catch {
            return false
        }
    }

    // Check if address was seen before in transaction history
    function isNewAddress(addr: string): boolean {
        return !knownAddresses.includes(addr)
    }

    // Handle paste event — show confirmation modal
    function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
        e.preventDefault()
        const pasted = e.clipboardData.getData('text').trim()
        setPastedAddress(pasted)
        setShowPasteConfirm(true)
    }

    // User confirmed pasted address is correct
    function handlePasteConfirm() {
        setToAddress(pastedAddress)
        setShowPasteConfirm(false)
    }

    // Validate form and proceed to confirmation step
    function handleSubmit() {
        setError('')
        if (!isValidAddress(toAddress)) {
            setError('Invalid TON address')
            return
        }
        if (toAddress === address) {
            setError('Cannot send to your own address')
            return
        }
        const amountNum = parseFloat(amount)
        if (isNaN(amountNum) || amountNum <= 0) {
            setError('Invalid amount')
            return
        }
        setStep('confirm')
    }

    // Send transaction after user confirms
    async function handleConfirm() {
        setStep('sending')
        try {
            await sendTransaction({mnemonic, toAddress, amount, comment})
            setStep('success')
        } catch (e) {
            setError('Transaction failed. Please try again.')
            setStep('error')
        }
    }

    // Paste confirmation modal
    if (showPasteConfirm) {
        return (
            <div>
                <h2>⚠️ Confirm pasted address</h2>
                <p>You are about to paste this address:</p>
                <code>{pastedAddress}</code>
                <p>First 6
                    characters: <strong>{pastedAddress.slice(0, 6)}</strong></p>
                <p>Last 6 characters: <strong>{pastedAddress.slice(-6)}</strong>
                </p>
                <p>Make sure this matches the address you intended to paste.</p>
                <button onClick={handlePasteConfirm}>Yes, this is correct
                </button>
                <button onClick={() => setShowPasteConfirm(false)}>Cancel
                </button>
            </div>
        )
    }

    // Send form
    if (step === 'form') {
        return (
            <div>
                <h2>Send TON</h2>
                <div>
                    <label>Recipient address</label>
                    <input
                        type="text"
                        value={toAddress}
                        onChange={e => setToAddress(e.target.value)}
                        onPaste={handlePaste}
                        placeholder="Enter TON address"
                    />
                    {/* New address warning */}
                    {toAddress && isValidAddress(toAddress) && isNewAddress(toAddress) && (
                        <p style={{color: 'orange'}}>
                            ⚠️ You have never sent to this address before
                        </p>
                    )}
                </div>
                <div>
                    <label>Amount (TON)</label>
                    <input
                        type="number"
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                    />
                </div>
                <div>
                    <label>Comment (optional)</label>
                    <input
                        type="text"
                        value={comment}
                        onChange={e => setComment(e.target.value)}
                        placeholder="Add a comment"
                    />
                </div>
                {error && <p style={{color: 'red'}}>{error}</p>}
                <button onClick={handleSubmit}>Continue</button>
                <button onClick={onBack}>Back</button>
            </div>
        )
    }

    // Confirmation screen before sending
    if (step === 'confirm') {
        return (
            <div>
                <h2>Confirm transaction</h2>
                <p>Please verify the details before sending:</p>
                <div>
                    <p>To: <code>{toAddress}</code></p>
                    <p>Amount: <strong>{amount} TON</strong></p>
                    {comment && <p>Comment: {comment}</p>}
                    {isNewAddress(toAddress) && (
                        <p style={{color: 'orange'}}>
                            ⚠️ You have never sent to this address before.
                            Double-check it carefully.
                        </p>
                    )}
                </div>
                <button onClick={handleConfirm}>Send</button>
                <button onClick={() => setStep('form')}>Back</button>
            </div>
        )
    }

    // Sending in progress
    if (step === 'sending') {
        return <div>Sending transaction... Please wait.</div>
    }

    // Success
    if (step === 'success') {
        return (
            <div>
                <h2>✅ Transaction sent</h2>
                <p>Your transaction has been submitted to the network.</p>
                <p>It may take a few seconds to confirm.</p>
                <button onClick={onSuccess}>Back to wallet</button>
            </div>
        )
    }

    // Error
    return (
        <div>
            <h2>❌ Transaction failed</h2>
            <p style={{color: 'red'}}>{error}</p>
            <button onClick={() => setStep('form')}>Try again</button>
            <button onClick={onBack}>Back</button>
        </div>
    )
}
