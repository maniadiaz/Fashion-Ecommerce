import { useState } from 'react'
import Drawer from '@mui/material/Drawer'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import TextField from '@mui/material/TextField'
import Alert from '@mui/material/Alert'
import CloseIcon from '@mui/icons-material/Close'
import apiFetch from '../api/client'
import { useAuthStore } from '../store/authStore'
import { useUiStore } from '../store/uiStore'
import type { User } from '../types'

interface LoginResponse { token: string; user: User }
interface RegisterResponse { token: string; user: User }

export default function AuthDrawer() {
  const { authOpen, closeAuth } = useUiStore()
  const login = useAuthStore((s) => s.login)

  const [tab, setTab] = useState(0)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const [signInForm, setSignInForm] = useState({ email: '', password: '' })
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', password: '' })

  function resetState() {
    setError('')
    setSignInForm({ email: '', password: '' })
    setRegisterForm({ name: '', email: '', password: '' })
  }

  function handleClose() {
    resetState()
    closeAuth()
  }

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await apiFetch<LoginResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(signInForm),
      })
      login(res.user, res.token)
      handleClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await apiFetch<RegisterResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(registerForm),
      })
      login(res.user, res.token)
      handleClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Drawer anchor="right" open={authOpen} onClose={handleClose}>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            px: 3,
            py: 2.5,
            borderBottom: '1px solid #E8E6E1',
          }}
        >
          <Typography variant="h6" sx={{ fontFamily: 'Playfair Display, serif', fontSize: '1.1rem' }}>
            My Account
          </Typography>
          <IconButton onClick={handleClose} size="small" aria-label="close">
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Tabs */}
        <Tabs
          value={tab}
          onChange={(_, v: number) => { setTab(v); setError('') }}
          sx={{ borderBottom: '1px solid #E8E6E1', px: 3 }}
        >
          <Tab label="Sign In" sx={{ fontSize: '0.8rem', letterSpacing: '0.06em' }} />
          <Tab label="Create Account" sx={{ fontSize: '0.8rem', letterSpacing: '0.06em' }} />
        </Tabs>

        <Box sx={{ flex: 1, px: 3, py: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 0 }}>
              {error}
            </Alert>
          )}

          {tab === 0 ? (
            <Box component="form" onSubmit={handleSignIn} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Email"
                type="email"
                required
                fullWidth
                value={signInForm.email}
                onChange={(e) => setSignInForm((p) => ({ ...p, email: e.target.value }))}
              />
              <TextField
                label="Password"
                type="password"
                required
                fullWidth
                value={signInForm.password}
                onChange={(e) => setSignInForm((p) => ({ ...p, password: e.target.value }))}
              />
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading}
                sx={{ py: 1.5, mt: 1 }}
              >
                {loading ? 'Signing in…' : 'Sign In'}
              </Button>
            </Box>
          ) : (
            <Box component="form" onSubmit={handleRegister} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Name"
                required
                fullWidth
                value={registerForm.name}
                onChange={(e) => setRegisterForm((p) => ({ ...p, name: e.target.value }))}
              />
              <TextField
                label="Email"
                type="email"
                required
                fullWidth
                value={registerForm.email}
                onChange={(e) => setRegisterForm((p) => ({ ...p, email: e.target.value }))}
              />
              <TextField
                label="Password"
                type="password"
                required
                fullWidth
                value={registerForm.password}
                onChange={(e) => setRegisterForm((p) => ({ ...p, password: e.target.value }))}
              />
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading}
                sx={{ py: 1.5, mt: 1 }}
              >
                {loading ? 'Creating account…' : 'Create Account'}
              </Button>
            </Box>
          )}
        </Box>
      </Box>
    </Drawer>
  )
}
