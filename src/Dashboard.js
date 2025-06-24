import './Dashboard.css'
import { useState, useEffect } from 'react'
import { getKey, saveKey } from './CloudStorage.js'

const Dashboard = ({user, logout}) => {
  const [address, setAddress] = useState("") // 1NDyJtNTjmwk5xPNhjgAMu4HDHigtobu1s
  const [addressTxs, setAddressTxs] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [favorites, setFavorites] = useState([])
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [allTransactions, setAllTransactions] = useState([])
  const [loadingMore, setLoadingMore] = useState(false)
  const transactionsPerPage = 25

  // Load favorites from localStorage on component mount
  useEffect(() => {
    async function loadFavorites() {
      if (!user) return
      try {
        const favoritesData = await getKey(`${user.id}-favorites`)
        if (favoritesData) {
          setFavorites(JSON.parse(favoritesData))
        }
      } catch (error) {
        console.error('Error loading favorites:', error)
      }
    }
    
    loadFavorites()
  }, [user])

  // Update displayed transactions when currentPage or allTransactions changes
  useEffect(() => {
    if (allTransactions.length > 0) {
      const startIndex = 0
      const endIndex = (currentPage * transactionsPerPage)
      setAddressTxs(allTransactions.slice(startIndex, endIndex))
    }
  }, [currentPage, allTransactions])

  const toggleFavorite = async (txid) => {
    if (!user) return
    
    const newFavorites = favorites.includes(txid)
      ? favorites.filter(id => id !== txid)
      : [...favorites, txid]
    
    setFavorites(newFavorites)
    
    try {
      await saveKey(`${user.id}-favorites`, JSON.stringify(newFavorites))
    } catch (error) {
      console.error('Error saving favorites:', error)
    }
  }

  const isFavorite = (txid) => {
    return favorites.includes(txid)
  }

  async function getAddressTxs(afterTxid = null) {
    if (!address.trim()) {
      setError("Please enter a valid Bitcoin address")
      return
    }

    if (afterTxid === null) {
      // Initial load
      setLoading(true)
      setError("")
      setAllTransactions([])
      setCurrentPage(1)
    } else {
      // Loading more
      setLoadingMore(true)
    }
    
    try {
      let url = `https://mempool.space/api/address/${address}/txs`
      if (afterTxid) {
        url += `?after_txid=${afterTxid}`
      }
      
      const res = await fetch(url)
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }
      
      const data = await res.json()
      
      if (afterTxid === null) {
        // Initial load
        setAllTransactions(data)
        setHasMore(data.length >= transactionsPerPage)
      } else {
        // Loading more
        const newTransactions = [...allTransactions, ...data]
        setAllTransactions(newTransactions)
        setHasMore(data.length >= transactionsPerPage)
      }
    } catch (error) {
      console.error('Error fetching transactions:', error)
      setError("Failed to fetch transactions. Please check the address and try again.")
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const loadMoreTransactions = async () => {
    if (!allTransactions.length) return
    
    const lastTx = allTransactions[allTransactions.length - 1]
    await getAddressTxs(lastTx.txid)
    setCurrentPage(prev => prev + 1)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    getAddressTxs()
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
      <div className="controls">
        <h1>Dashboard</h1>
        <button onClick={logout}>Logout</button>
      </div>

      <div className="address-input-section">
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter Bitcoin address"
              className={error ? "error" : ""}
              disabled={loading}
            />
            <button type="submit" disabled={loading || !address.trim()}>
              {loading ? 'Loading...' : 'Get Transactions'}
            </button>
          </div>
          {error && <div className="error-message">{error}</div>}
        </form>
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
                  <th>Favorite</th>
                </tr>
              </thead>
              <tbody>
                {addressTxs.map((tx, index) => {
                  const netAmount = calculateNetAmount(tx)
                  const isReceiving = netAmount > 0
                  const isSending = netAmount < 0
                  const favorite = isFavorite(tx.txid)
                  
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
                      <td>
                        <button
                          className={`favorite-btn ${favorite ? 'favorited' : ''}`}
                          onClick={() => toggleFavorite(tx.txid)}
                          title={favorite ? 'Remove from favorites' : 'Add to favorites'}
                        >
                          {favorite ? '★' : '☆'}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Controls */}
          <div className="pagination-controls">
            <div className="pagination-info">
            </div>
            {hasMore && (
              <button 
                className="load-more-btn"
                onClick={loadMoreTransactions}
                disabled={loadingMore}
              >
                {loadingMore ? 'Loading...' : 'Load More Transactions'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard