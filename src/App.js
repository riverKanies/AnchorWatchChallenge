import './App.css';
import { useState, useEffect } from 'react';
import Login from './Login';
import Dashboard from './Dashboard';
import {getKey, dropKeys} from './Storage.js'
import http from './http.js'

function logout () {
  dropKeys()
  setTimeout(() => window.location.reload(), 300)
}

function App() {

  const [auth, setAuth] = useState(null)
  const [user, setUser] = useState(null)

  useEffect(() => {
    async function init() {
      
      // check auth
      if (!auth) {
        const jwt = await getKey("jwt")
        if (jwt) {
          //ensure session is live
          const ok = await http.get('/sessions')
          // console.log('ok', ok)
          if (ok.status === 200) {
            setAuth(jwt)
          } else {
            setTimeout(() => logout(), 300)
          }
        }
      } else {
        const userRecord = await getKey("user")
        setUser(JSON.parse(userRecord))
      }
      // done initializing
      // setInitialized(true)
    }
    init()
  }, [auth])

  return (
    <div className="App">
      {auth ?
        <div>
          <Dashboard user={user} logout={logout}/>
        </div>
      :
        <div>
          <Login />
        </div>
      }
    </div>
  );
}

export default App;
