import './Dashboard.css'

export default ({user, logout}) => {
  return <div><h1>Dashboard</h1>
  <button onClick={logout}>Logout</button>
  </div>
}