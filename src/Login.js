import {useState} from 'react'
import './Login.css'
import http from './http.js'
import {saveKey} from './Storage.js'

const Login = () => {
  const [email, setEmail] = useState('')
  const [emailValid, setEmailValid] = useState(false)
  const [code, setCode] = useState('')
  const [codeValid, setCodeValid] = useState(false)
  const [codeSent, setCodeSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const validateEmail = (email) => {
    const regex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/
    return regex.test(email)
  }

  const handleEmailChange = (e) => {
    const email = e.target.value
    const valid = validateEmail(email)
    setEmail(email)
    setEmailValid(valid)
    setCodeSent(false)
    setError('')
  }

  const handleCodeChange = (e) => {
    const code = e.target.value
    const valid = code.length === 8
    setCode(code)
    setCodeValid(valid)
    setError('')
  }

  const requestLoginCode = async () => {
    if (!emailValid) return
    
    setLoading(true)
    setError('')
    
    try {
      await http.post('/codes', { email })
      setCodeSent(true)
    } catch (error) {
      console.error('Error requesting code:', error)
      setError('Failed to send code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const loginWithCode = async () => {
    if (!emailValid || !codeValid) return
    
    setLoading(true)
    setError('')
    
    try {
      const { sessionToken, userRecord } = await http.post('/sessions', {
        type: "code",
        code,
        email
      })
      
      console.log('session start', sessionToken, userRecord)
      await saveKey("jwt", sessionToken)
      await saveKey("user", JSON.stringify(userRecord))
      window.location.reload()
    } catch (error) {
      console.error('Error logging in:', error)
      setError('Invalid code. Please check your email and try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (codeSent && codeValid) {
      loginWithCode()
    } else if (emailValid) {
      requestLoginCode()
    }
  }

  return (
    <div className="login">
      <div className="login-header">
        <h1>AW Challenge</h1>
        <p>Login to access your dashboard</p>
      </div>

      <div className="login-body">
        <div className="login-form-container">
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <input
                id="emailInput"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={handleEmailChange}
                className={error && !emailValid ? "error" : ""}
                disabled={loading}
                required
              />
              <button 
                type="button"
                onClick={requestLoginCode}
                disabled={!emailValid || codeSent || loading}
                className="send-code-btn"
              >
                {loading && !codeSent ? 'Sending...' : codeSent ? 'Code Sent!' : 'Send Code'}
              </button>
            </div>

            {codeSent && (
              <>
                <div className="email-sent-message">
                  Check your email to get login code from CyberMonk
                </div>
                <div className="input-group">
                  <input
                    id="codeInput"
                    type="text"
                    placeholder="Enter 8-digit code from email"
                    value={code}
                    onChange={handleCodeChange}
                    className={error && !codeValid ? "error" : ""}
                    disabled={loading}
                    maxLength={8}
                    required
                  />
                  <button 
                    type="submit"
                    disabled={!codeValid || !emailValid || loading}
                    className="login-btn"
                  >
                    {loading ? 'Logging in...' : 'Login'}
                  </button>
                </div>
              </>
            )}

            {error && <div className="error-message">{error}</div>}
          </form>
        </div>
      </div>

      <div className="login-footer">
        <p className="policies">
          By logging in, you agree to our{' '}
          <a href="/terms" target="_blank" rel="noopener noreferrer">Terms of Service</a>
          {' '}and{' '}
          <a href="/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
        </p>
      </div>
    </div>
  )
}

export default Login