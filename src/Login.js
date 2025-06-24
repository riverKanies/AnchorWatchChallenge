import {useState} from 'react'
import './Login.css'
import http from './http.js'
import {saveKey} from './Storage.js'

async function loginWithCode() {
  const email = document.getElementById("emailInput").value
  const code = document.getElementById("codeInput").value
  const {sessionToken, userRecord} = await http.post('/sessions', {type: "code", code, email})
  console.log('session start', sessionToken, userRecord)
  await saveKey("jwt", sessionToken)
  await saveKey("user", JSON.stringify(userRecord))
  window.location.reload()
}

function validateEmail(email) {
  const regex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/
  return regex.test(email)
}

const Login = () => {

  const [email, setEmail] = useState('')
  const [emailValid, setEmailValid] = useState(false)
  const [code, setCode] = useState('')
  const [codeValid, setCodeValid] = useState(false)
  const [codeSent, setCodeSent] = useState(false)

  const changeEmail = (e) => {
    const email = e.target.value
    const valid = validateEmail(email)
    setEmail(email)
    setEmailValid(valid)
    setCodeSent(false)
  }

  const changeCode = (e) => {
    const code = e.target.value
    const valid = code.length === 8
    setCode(code)
    setCodeValid(valid)
  }

  const requestLoginCode = () => {
    const email = document.getElementById("emailInput").value
    console.log("req code for", email)
    http.post('/codes', {email})
    setCodeSent(true)
  }

  return <>
    <div className='login-header'>
      <div className='login-subtitle'>AW Challenge</div>
      <div className='login-title'>Login</div>
    </div>
    <div className='login-body'></div>
    <div className='login-footer'>
          <div className='code-login-container'>
            <input id="emailInput" type="email" placeholder='email' onChange={changeEmail} value={email} />
            <button onClick={requestLoginCode} disabled={!emailValid || codeSent}>
              Send Code
              {codeSent && <div>Sent!</div>}
            </button>
            <br/>
            <input id="codeInput" placeholder='code (from email)' onChange={changeCode} value={code} />
            <button onClick={loginWithCode} disabled={!codeValid || !emailValid}>Login</button>
          </div>
      

    </div>
  </>
}

export default Login