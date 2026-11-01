import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLogin, useRegister } from '../hooks/useAuth'
import { setAuth } from '../utils/auth'
import './login.css'

const DEMO_ACCOUNTS = [
  {
    label: 'Company owner',
    email: 'owner@shiftly.com',
    password: 'Owner@12345',
    detail: 'Full workspace access',
  },
  {
    label: 'HR admin',
    email: 'hr@shiftly.com',
    password: 'Hr@123456',
    detail: 'People operations and payroll access',
  },
  {
    label: 'Manager',
    email: 'manager@shiftly.com',
    password: 'Manager@12345',
    detail: 'Team attendance, leave and projects',
  },
  {
    label: 'Employee',
    email: 'employee@shiftly.com',
    password: 'Employee@12345',
    detail: 'Self-service attendance and leave',
  },
  {
    label: 'Super admin',
    email: 'developer@shiftly.com',
    password: 'Developer@12345',
    detail: 'Platform-wide administration',
  },
]

const EMPTY_SIGNUP = {
  name: '',
  companyName: '',
  email: '',
  phone: '',
  password: '',
}

function Login() {
  const navigate = useNavigate()
  const [mode, setMode] = useState('login')
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [signupData, setSignupData] = useState(EMPTY_SIGNUP)
  const [error, setError] = useState('')

  const handleSuccess = (data) => {
    if (data.success) {
      setAuth(data.data.accessToken, data.data.user)
      navigate('/', { replace: true })
    }
  }

  const loginMutation = useLogin({
    onSuccess: handleSuccess,
    onError: (err) => {
      setError(err.response?.data?.message || 'Login failed. Please try again.')
    },
  })

  const registerMutation = useRegister({
    onSuccess: handleSuccess,
    onError: (err) => {
      setError(
        err.response?.data?.message || 'Could not create your account. Please try again.'
      )
    },
  })

  const switchMode = (nextMode) => {
    setMode(nextMode)
    setError('')
  }

  const handleLoginChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value })
    setError('')
  }

  const handleSignupChange = (event) => {
    setSignupData({ ...signupData, [event.target.name]: event.target.value })
    setError('')
  }

  const handleLoginSubmit = (event) => {
    event.preventDefault()
    setError('')
    loginMutation.mutate(formData)
  }

  const handleSignupSubmit = (event) => {
    event.preventDefault()
    setError('')
    registerMutation.mutate(signupData)
  }

  const fillDemo = (account) => {
    setMode('login')
    setError('')
    setFormData({ email: account.email, password: account.password })
  }

  const isBusy = loginMutation.isPending || registerMutation.isPending

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-brand">
            <span className="login-brand-mark">S</span>
            <span>shiftly</span>
          </div>
          <h1>{mode === 'login' ? 'Welcome back' : 'Create your workspace'}</h1>
          <p>
            {mode === 'login'
              ? 'Sign in to your account to continue'
              : 'Start managing attendance, teams and payroll in minutes'}
          </p>
        </div>

        <div className="login-tabs" role="tablist" aria-label="Authentication mode">
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'login'}
            className={mode === 'login' ? 'login-tab active' : 'login-tab'}
            onClick={() => switchMode('login')}
          >
            Sign in
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'signup'}
            className={mode === 'signup' ? 'login-tab active' : 'login-tab'}
            onClick={() => switchMode('signup')}
          >
            Sign up
          </button>
        </div>

        {error && <div className="login-error">{error}</div>}

        {mode === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleLoginChange}
                placeholder="you@company.com"
                autoComplete="email"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleLoginChange}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />
            </div>

            <button type="submit" className="login-button" disabled={isBusy}>
              {loginMutation.isPending ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignupSubmit} className="login-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Full name</label>
                <input
                  id="name"
                  name="name"
                  value={signupData.name}
                  onChange={handleSignupChange}
                  placeholder="Rahul Sharma"
                  autoComplete="name"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="companyName">Company</label>
                <input
                  id="companyName"
                  name="companyName"
                  value={signupData.companyName}
                  onChange={handleSignupChange}
                  placeholder="Bright Tech"
                  autoComplete="organization"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="signup-email">Work email</label>
              <input
                type="email"
                id="signup-email"
                name="email"
                value={signupData.email}
                onChange={handleSignupChange}
                placeholder="you@company.com"
                autoComplete="email"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="phone">Phone</label>
                <input
                  id="phone"
                  name="phone"
                  value={signupData.phone}
                  onChange={handleSignupChange}
                  placeholder="+91 98765 43210"
                  autoComplete="tel"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="signup-password">Password</label>
                <input
                  type="password"
                  id="signup-password"
                  name="password"
                  value={signupData.password}
                  onChange={handleSignupChange}
                  placeholder="Min. 6 characters"
                  autoComplete="new-password"
                  minLength={6}
                  required
                />
              </div>
            </div>

            <button type="submit" className="login-button" disabled={isBusy}>
              {registerMutation.isPending ? 'Creating account...' : 'Create account'}
            </button>
          </form>
        )}

        <div className="demo-box">
          <p>Demo accounts</p>
          {DEMO_ACCOUNTS.map((account) => (
            <button
              key={account.email}
              type="button"
              className="demo-account"
              onClick={() => fillDemo(account)}
            >
              <span>
                <strong>{account.label}</strong>
                <small>{account.email}</small>
              </span>
              <em>{account.detail}</em>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Login
