import './Dashboard.css'
import { useState } from 'react'


const Dashboard = ({user, logout}) => {
  const [address, setAddress] = useState("1wiz18xYmhRX6xStj2b9t1rwWX4GKUgpv")
  const [addressTxs, setAddressTxs] = useState(null)

  async function getAddressTxs() {
    //curl -sSL "https://mempool.space/api/address/1wiz18xYmhRX6xStj2b9t1rwWX4GKUgpv/txs"
    const res = await fetch(`https://mempool.space/api/address/${address}/txs`)
    const data = await res.json()
    console.log(JSON.stringify(data[0]))
    setAddressTxs(data)
  }

  return <div><h1>Dashboard</h1>
  <button onClick={logout}>Logout</button>
  <button onClick={getAddressTxs}>Get Address Txs</button>
  </div>
}

export default Dashboard