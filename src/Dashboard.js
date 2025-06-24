import './Dashboard.css'
import { useState } from 'react'

const Dashboard = ({user, logout}) => {
  const [address, setAddress] = useState("1wiz18xYmhRX6xStj2b9t1rwWX4GKUgpv")
  const [addressTxs, setAddressTxs] = useState(null)
  const [loading, setLoading] = useState(false)

  async function getAddressTxs() {
    setLoading(true)
    try {
      const res = await fetch(`https://mempool.space/api/address/${address}/txs`)
      const data = await res.json()
      setAddressTxs(data)
    } catch (error) {
      console.error('Error fetching transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  // Helper function to format date
  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleString()
  }

  // Helper function to format amount in BTC
  const formatAmount = (satoshi) => {
    return (satoshi / 100000000).toFixed(8) + ' BTC'
  }

  // Helper function to calculate net amount for address
  const calculateNetAmount = (tx) => {
    let netAmount = 0
    
    // Check if address is in outputs (receiving)
    const outputs = tx.vout || []
    outputs.forEach(output => {
      if (output.scriptpubkey_address === address) {
        netAmount += output.value
      }
    })
    
    // Check if address is in inputs (sending)
    const inputs = tx.vin || []
    inputs.forEach(input => {
      if (input.prevout && input.prevout.scriptpubkey_address === address) {
        netAmount -= input.prevout.value
      }
    })
    
    return netAmount
  }

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <div className="controls">
        <button onClick={logout}>Logout</button>
        <button onClick={getAddressTxs} disabled={loading}>
          {loading ? 'Loading...' : 'Get Address Txs'}
        </button>
      </div>

      {addressTxs && (
        <div className="transactions-section">
          <h2>Transactions for {address}</h2>
          <div className="table-container">
            <table className="transactions-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Transaction ID</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Fee</th>
                  <th>Status</th>
                  <th>Block Height</th>
                </tr>
              </thead>
              <tbody>
                {addressTxs.map((tx, index) => {
                  const netAmount = calculateNetAmount(tx)
                  const isReceiving = netAmount > 0
                  const isSending = netAmount < 0
                  
                  return (
                    <tr key={tx.txid || index}>
                      <td>
                        {tx.status?.block_time ? formatDate(tx.status.block_time) : 'Pending'}
                      </td>
                      <td className="txid">
                        <a 
                          href={`https://mempool.space/tx/${tx.txid}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          {tx.txid.substring(0, 8)}...{tx.txid.substring(tx.txid.length - 8)}
                        </a>
                      </td>
                      <td>
                        <span className={`type-badge ${isReceiving ? 'receiving' : isSending ? 'sending' : 'neutral'}`}>
                          {isReceiving ? 'Received' : isSending ? 'Sent' : 'Unknown'}
                        </span>
                      </td>
                      <td className={`amount ${isReceiving ? 'positive' : isSending ? 'negative' : ''}`}>
                        {isReceiving ? '+' : isSending ? '-' : ''}{formatAmount(Math.abs(netAmount))}
                      </td>
                      <td>{formatAmount(tx.fee || 0)}</td>
                      <td>
                        <span className={`status-badge ${tx.status?.confirmed ? 'confirmed' : 'pending'}`}>
                          {tx.status?.confirmed ? 'Confirmed' : 'Pending'}
                        </span>
                      </td>
                      <td>{tx.status?.block_height || '-'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard