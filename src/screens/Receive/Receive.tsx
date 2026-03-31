import styles from './Receive.module.css'

interface ReceiveProps {
    address: string
    onBack: () => void
}

export function Receive({address, onBack}: ReceiveProps) {
    return (
        <div className={styles.container}>
            <h2>Receive TON</h2>
            <div className={styles.card}>
                <span className={styles.label}>Your wallet address</span>
                <code>{address}</code>
                <button
                    className={styles.btnPrimary}
                    onClick={() => navigator.clipboard.writeText(address)}
                >
                    Copy address
                </button>
            </div>
            <button className={styles.btnSecondary} onClick={onBack}>
                Back
            </button>
        </div>
    )
}
