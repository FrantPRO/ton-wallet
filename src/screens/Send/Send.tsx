import {useState} from 'react'
import {Address} from '@ton/ton'
import {sendTransaction} from '../../crypto/transactions'
import styles from './Send.module.css'

interface SendProps {
    mnemonic: string[]
    address: string
    knownAddresses: string[]
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

    // Validate TON address format
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

    // Paste confirmation modal — rendered on top of current step
    const pasteModal = showPasteConfirm && (
        <div className={styles.modalOverlay}>
            <div className={styles.modal}>
                <p className={styles.modalTitle}>⚠️ Confirm pasted address</p>
                <div className={styles.modalAddress}>{pastedAddress}</div>
                <div className={styles.modalChars}>
                    <span>First 6 characters: <strong>{pastedAddress.slice(0, 6)}</strong></span>
                    <span>Last 6 characters: <strong>{pastedAddress.slice(-6)}</strong></span>
                </div>
                <p style={{fontSize: '14px', color: 'var(--text-secondary)'}}>
                    Make sure this matches the address you intended to paste.
                </p>
                <div className={styles.modalActions}>
                    <button className={styles.btnSecondary}
                            onClick={() => setShowPasteConfirm(false)}>
                        Cancel
                    </button>
                    <button className={styles.btnPrimary}
                            onClick={handlePasteConfirm}>
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    )

    // Send form
    if (step === 'form') {
        return (
            <>
                {pasteModal}
                <div className={styles.container}>
                    <h2>Send TON</h2>
                    <div className={styles.field}>
                        <label className={styles.label}>Recipient
                            address</label>
                        <input
                            type="text"
                            value={toAddress}
                            onChange={e => setToAddress(e.target.value)}
                            onPaste={handlePaste}
                            placeholder="Enter TON address"
                        />
                        {toAddress && isValidAddress(toAddress) && isNewAddress(toAddress) && (
                            <p className={styles.warning}>
                                ⚠️ You have never sent to this address before
                            </p>
                        )}
                    </div>
                    <div className={styles.field}>
                        <label className={styles.label}>Amount (TON)</label>
                        <input
                            type="number"
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                        />
                    </div>
                    <div className={styles.field}>
                        <label className={styles.label}>Comment
                            (optional)</label>
                        <input
                            type="text"
                            value={comment}
                            onChange={e => setComment(e.target.value)}
                            placeholder="Add a comment"
                        />
                    </div>
                    {error && <p className={styles.error}>{error}</p>}
                    <div className={styles.actions}>
                        <button className={styles.btnPrimary}
                                onClick={handleSubmit}>
                            Continue
                        </button>
                        <button className={styles.btnSecondary}
                                onClick={onBack}>
                            Back
                        </button>
                    </div>
                </div>
            </>
        )
    }

    // Confirmation screen
    if (step === 'confirm') {
        return (
            <div className={styles.container}>
                <h2>Confirm transaction</h2>
                <div className={styles.confirmCard}>
                    <div className={styles.confirmRow}>
                        <span className={styles.confirmLabel}>To</span>
                        <span className={styles.confirmValue}>{toAddress}</span>
                    </div>
                    <div className={styles.confirmRow}>
                        <span className={styles.confirmLabel}>Amount</span>
                        <span
                            className={styles.confirmAmount}>{amount} TON</span>
                    </div>
                    {comment && (
                        <div className={styles.confirmRow}>
                            <span className={styles.confirmLabel}>Comment</span>
                            <span
                                className={styles.confirmValue}>{comment}</span>
                        </div>
                    )}
                </div>
                {isNewAddress(toAddress) && (
                    <p className={styles.warning}>
                        ⚠️ You have never sent to this address before.
                        Double-check it carefully.
                    </p>
                )}
                <div className={styles.actions}>
                    <button className={styles.btnPrimary}
                            onClick={handleConfirm}>
                        Send
                    </button>
                    <button className={styles.btnSecondary}
                            onClick={() => setStep('form')}>
                        Back
                    </button>
                </div>
            </div>
        )
    }

    // Sending in progress
    if (step === 'sending') {
        return (
            <div className={styles.statusScreen}>
                <div className={styles.statusIcon}>⏳</div>
                <h2>Sending...</h2>
                <p className={styles.statusText}>
                    Please wait while your transaction is being submitted to the
                    network.
                </p>
            </div>
        )
    }

    // Success
    if (step === 'success') {
        return (
            <div className={styles.statusScreen}>
                <div className={styles.statusIcon}>✅</div>
                <h2>Transaction sent</h2>
                <p className={styles.statusText}>
                    Your transaction has been submitted to the network.
                    It may take a few seconds to confirm.
                </p>
                <button className={styles.btnPrimary} onClick={onSuccess}>
                    Back to wallet
                </button>
            </div>
        )
    }

    // Error
    return (
        <div className={styles.statusScreen}>
            <div className={styles.statusIcon}>❌</div>
            <h2>Transaction failed</h2>
            <p className={styles.error}>{error}</p>
            <div className={styles.actions}>
                <button className={styles.btnPrimary}
                        onClick={() => setStep('form')}>
                    Try again
                </button>
                <button className={styles.btnSecondary} onClick={onBack}>
                    Back
                </button>
            </div>
        </div>
    )
}
