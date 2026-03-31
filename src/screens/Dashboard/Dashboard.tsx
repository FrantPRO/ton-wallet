import {useState, useEffect} from 'react'
import {getBalance, getTransactions} from '../../network/tonClient'
import type {Transaction} from '../../network/tonClient'

interface DashboardProps {
    address: string
    onSend: () => void
    onReceive: () => void
    onTransactionsLoaded: (txs: Transaction[]) => void
}

export function Dashboard({
                              address,
                              onSend,
                              onReceive,
                              onTransactionsLoaded
                          }: DashboardProps) {
    const [balance, setBalance] = useState<string | null>(null)
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    // Load balance and transactions on mount
    useEffect(() => {
        async function load() {
            try {
                const [bal, txs] = await Promise.all([
                    getBalance(address),
                    getTransactions(address),
                ])
                setBalance(bal)
                setTransactions(txs)
                onTransactionsLoaded(txs)
            } catch (e) {
                setError('Failed to load wallet data')
            } finally {
                setLoading(false)
            }
        }

        load()
    }, [address])

    // Filter transactions by address or comment
    const filtered = transactions.filter(tx =>
        tx.fromAddress.toLowerCase().includes(search.toLowerCase()) ||
        tx.toAddress.toLowerCase().includes(search.toLowerCase()) ||
        tx.comment.toLowerCase().includes(search.toLowerCase())
    )

    if (loading) return <div>Loading wallet...</div>
    if (error) return <div style={{color: 'red'}}>{error}</div>

    return (
        <div>
            {/* Wallet address */}
            <div>
                <p>Address:</p>
                <code>{address}</code>
                <button
                    onClick={() => navigator.clipboard.writeText(address)}>Copy
                </button>
            </div>

            {/* Balance */}
            <div>
                <h2>{balance} TON</h2>
            </div>

            {/* Action buttons */}
            <div>
                <button onClick={onReceive}>Receive</button>
                <button onClick={onSend}>Send</button>
            </div>

            {/* Transaction history */}
            <div>
                <h3>Transactions</h3>
                <input
                    type="text"
                    placeholder="Search by address or comment..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
                {filtered.length === 0 && <p>No transactions yet</p>}
                {filtered.map(tx => (
                    <div key={tx.hash}>
                        <span>{tx.isIncoming ? '↓ IN' : '↑ OUT'}</span>
                        <span>{tx.isIncoming ? tx.fromAddress : tx.toAddress}</span>
                        <span>{tx.isIncoming ? '+' : '-'}{tx.amount} TON</span>
                        <span>{new Date(tx.timestamp * 1000).toLocaleString()}</span>
                        {tx.comment && <span>💬 {tx.comment}</span>}
                    </div>
                ))}
            </div>
        </div>
    )
}
