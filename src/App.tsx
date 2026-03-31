import {useState, useEffect} from 'react'
import {loadMnemonic} from './storage/walletStorage'
import {deriveAddress} from './crypto/wallet'
import {Setup} from './screens/Setup/Setup'
import {Dashboard} from './screens/Dashboard/Dashboard'
import {Receive} from './screens/Receive/Receive'
import {Send} from './screens/Send/Send'
import type {Transaction} from './network/tonClient'

type Screen = 'setup' | 'dashboard' | 'send' | 'receive'

function App() {
    const [screen, setScreen] = useState<Screen>('setup')
    const [mnemonic, setMnemonic] = useState<string[]>([])
    const [address, setAddress] = useState('')
    const [loading, setLoading] = useState(true)
    // Transactions stored here to share known addresses with Send screen
    const [transactions, setTransactions] = useState<Transaction[]>([])

    // Restore wallet from localStorage on startup
    useEffect(() => {
        async function restore() {
            const savedMnemonic = loadMnemonic()
            if (savedMnemonic) {
                const savedAddress = await deriveAddress(savedMnemonic)
                setMnemonic(savedMnemonic)
                setAddress(savedAddress)
                setScreen('dashboard')
            }
            setLoading(false)
        }

        restore()
    }, [])

    // Called when Setup completes (create or import)
    function handleSetupComplete(newMnemonic: string[], newAddress: string) {
        setMnemonic(newMnemonic)
        setAddress(newAddress)
        setScreen('dashboard')
    }

    // Extract unique known addresses from transaction history
    const knownAddresses = [
        ...new Set(transactions.map(tx => tx.toAddress))
    ]

    if (loading) {
        return <div>Loading...</div>
    }

    return (
        <div>
            {screen === 'setup' && (
                <Setup onComplete={handleSetupComplete}/>
            )}
            {screen === 'dashboard' && (
                <Dashboard
                    address={address}
                    onSend={() => setScreen('send')}
                    onReceive={() => setScreen('receive')}
                    onTransactionsLoaded={setTransactions}
                />
            )}
            {screen === 'send' && (
                <Send
                    mnemonic={mnemonic}
                    address={address}
                    knownAddresses={knownAddresses}
                    onBack={() => setScreen('dashboard')}
                    onSuccess={() => setScreen('dashboard')}
                />
            )}
            {screen === 'receive' && (
                <Receive
                    address={address}
                    onBack={() => setScreen('dashboard')}
                />
            )}
        </div>
    )
}

export default App
