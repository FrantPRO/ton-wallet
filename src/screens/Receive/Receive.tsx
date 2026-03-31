interface ReceiveProps {
    address: string
    onBack: () => void
}

export function Receive({address, onBack}: ReceiveProps) {
    return (
        <div>
            <h2>Receive TON</h2>
            <p>Share your address to receive TON</p>
            <code>{address}</code>
            <button onClick={() => navigator.clipboard.writeText(address)}>Copy address
            </button>
            <button onClick={onBack}>Back</button>
        </div>
    )
}
