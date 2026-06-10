import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Badge from '@mui/material/Badge'
import Box from '@mui/material/Box'
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined'
import { Link, useNavigate } from 'react-router-dom'
import { useCartStore } from '../store/cartStore'
import { useAuthStore } from '../store/authStore'
import { useUiStore } from '../store/uiStore'

const NAV_LINKS = [
  { label: 'New Arrivals', to: '/products?category=new-arrivals' },
  { label: 'Collections', to: '/products' },
  { label: 'Women', to: '/products?category=women' },
  { label: 'Men', to: '/products?category=men' },
]

export default function Navbar() {
  const totalItems = useCartStore((s) => s.totalItems)
  const { user, logout } = useAuthStore()
  const { openCart, openAuth } = useUiStore()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <AppBar position="fixed">
      <Toolbar
        sx={{
          height: 72,
          px: { xs: 2, md: 4 },
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center',
        }}
      >
        {/* Logo — left */}
        <Typography
          component={Link}
          to="/"
          sx={{
            fontFamily: 'Playfair Display, serif',
            fontWeight: 700,
            fontSize: '1.5rem',
            color: 'text.primary',
            textDecoration: 'none',
            letterSpacing: '0.15em',
            justifySelf: 'start',
          }}
        >
          VELN
        </Typography>

        {/* Center nav */}
        <Box
          sx={{
            display: { xs: 'none', md: 'flex' },
            gap: 0.5,
            justifyContent: 'center',
          }}
        >
          {NAV_LINKS.map(({ label, to }) => (
            <Button
              key={label}
              component={Link}
              to={to}
              disableRipple
              sx={{
                color: 'text.primary',
                fontWeight: 400,
                fontSize: '0.82rem',
                letterSpacing: '0.04em',
                textTransform: 'none',
                px: 1.5,
                '&:hover': { backgroundColor: 'transparent', color: 'text.secondary' },
              }}
            >
              {label}
            </Button>
          ))}
        </Box>

        {/* Right actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifySelf: 'end' }}>
          {user ? (
            <>
              {user.role === 'admin' && (
                <Button
                  component={Link}
                  to="/admin/products"
                  size="small"
                  disableRipple
                  sx={{ color: 'text.secondary', fontWeight: 400, fontSize: '0.82rem', textTransform: 'none' }}
                >
                  Admin
                </Button>
              )}
              <Button
                onClick={handleLogout}
                size="small"
                disableRipple
                sx={{ color: 'text.secondary', fontWeight: 400, fontSize: '0.82rem', textTransform: 'none' }}
              >
                Sign Out
              </Button>
            </>
          ) : (
            <Button
              onClick={openAuth}
              variant="contained"
              size="small"
              sx={{ px: 2.5, py: 0.75, fontSize: '0.78rem' }}
            >
              Join
            </Button>
          )}

          <IconButton
            onClick={openCart}
            sx={{ color: 'text.primary', ml: 0.5 }}
            aria-label="open cart"
          >
            <Badge
              badgeContent={totalItems || null}
              sx={{
                '& .MuiBadge-badge': {
                  backgroundColor: '#E63323',
                  color: '#fff',
                  fontSize: '0.6rem',
                  minWidth: 17,
                  height: 17,
                },
              }}
            >
              <ShoppingBagOutlinedIcon sx={{ fontSize: 22 }} />
            </Badge>
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  )
}
