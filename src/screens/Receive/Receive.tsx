import {QRCodeSVG} from 'qrcode.react'
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
                <div className={styles.qrContainer}>
                    <QRCodeSVG
                        value={address}
                        size={200}
                        bgColor="#242424"
                        fgColor="#ffffff"
                    />
                </div>
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
