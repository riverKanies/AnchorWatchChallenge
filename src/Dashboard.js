import './Dashboard.css'

const Dashboard = ({user, logout}) => {
  return <div><h1>Dashboard</h1>
  <button onClick={logout}>Logout</button>
  </div>
}

export default Dashboard