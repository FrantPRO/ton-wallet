import {useState, useEffect} from 'react'
import {getBalance, getTransactions} from '../../network/tonClient'
import type {Transaction} from '../../network/tonClient'
import styles from './Dashboard.module.css'

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
    if (error) return <div style={{color: 'var(--error)'}}>{error}</div>

    return (
        <div className={styles.container}>
            {/* Address */}
            <div className={styles.addressBlock}>
                <span className={styles.addressLabel}>Wallet address</span>
                <div className={styles.addressRow}>
                    <code>{address}</code>
                    <button
                        className={styles.btnCopy}
                        onClick={() => navigator.clipboard.writeText(address)}>Copy
                    </button>
                </div>
            </div>

            {/* Balance */}
            <div className={styles.balanceBlock}>
                <span className={styles.balanceAmount}>{balance}</span>
                <span className={styles.balanceCurrency}>TON</span>
            </div>

            {/* Actions */}
            <div className={styles.actions}>
                <button className={styles.btnReceive}
                        onClick={onReceive}>Receive
                </button>
                <button className={styles.btnSend} onClick={onSend}>Send
                </button>
            </div>

            {/* Transactions */}
            <div className={styles.txSection}>
                <h3 className={styles.txTitle}>Transactions</h3>
                <input
                    type="text"
                    placeholder="Search by address or comment..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
                {filtered.length === 0 && (
                    <p className={styles.txEmpty}>No transactions yet</p>
                )}
                {filtered.map(tx => (
                    <div key={tx.hash} className={styles.txItem}>
                        <div className={styles.txHeader}>
              <span className={tx.isIncoming ? styles.txIn : styles.txOut}>
                {tx.isIncoming ? '↓ IN' : '↑ OUT'}
              </span>
                            <span className={styles.txAmount}>
                {tx.isIncoming ? '+' : '-'}{tx.amount} TON
              </span>
                        </div>
                        <span className={styles.txAddress}>
              {tx.isIncoming ? tx.fromAddress : tx.toAddress}
            </span>
                        <div className={styles.txMeta}>
              <span className={styles.txDate}>
                {new Date(tx.timestamp * 1000).toLocaleString()}
              </span>
                            {tx.comment && (
                                <span
                                    className={styles.txComment}>💬 {tx.comment}</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
