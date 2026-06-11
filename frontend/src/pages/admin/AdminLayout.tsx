import { Navigate, Outlet, NavLink } from 'react-router-dom'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Button from '@mui/material/Button'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { useAuthStore } from '../../store/authStore'

const NAV_ITEMS = [
  { to: '/admin/products', label: 'Products' },
  { to: '/admin/orders', label: 'Orders' },
  { to: '/admin/inventory', label: 'Inventory' },
  { to: '/admin/promotions', label: 'Promotions' },
  { to: '/admin/coupons', label: 'Coupons' },
]

export default function AdminLayout() {
  const isAdmin = useAuthStore((s) => s.isAdmin)
  if (!isAdmin) return <Navigate to="/" replace />

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', pt: 8 }}>
      {/* Sidebar */}
      <Box
        sx={{
          width: 220,
          flexShrink: 0,
          borderRight: '1px solid #E8E6E1',
          pt: 4,
          px: 3,
          backgroundColor: '#fff',
          position: 'sticky',
          top: 64,
          height: 'calc(100vh - 64px)',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Typography
          variant="overline"
          sx={{ letterSpacing: '0.15em', color: 'text.secondary', display: 'block', mb: 2 }}
        >
          Admin
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, flex: 1 }}>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              style={({ isActive }) => ({
                textDecoration: 'none',
                padding: '8px 12px',
                fontSize: '0.85rem',
                letterSpacing: '0.04em',
                color: isActive ? '#0A0A0A' : '#6B6B6B',
                backgroundColor: isActive ? '#F8F7F5' : 'transparent',
                fontWeight: isActive ? 600 : 400,
                display: 'block',
                transition: '150ms',
              })}
            >
              {item.label}
            </NavLink>
          ))}
        </Box>

        <Divider sx={{ my: 2 }} />
        <Button
          component={NavLink}
          to="/"
          startIcon={<ArrowBackIcon />}
          size="small"
          sx={{
            justifyContent: 'flex-start',
            color: '#6B6B6B',
            fontSize: '0.8rem',
            letterSpacing: '0.04em',
            px: 1.5,
            mb: 2,
            '&:hover': { color: '#0A0A0A', backgroundColor: '#F8F7F5' },
          }}
        >
          Back to Store
        </Button>
      </Box>

      {/* Main content */}
      <Box sx={{ flex: 1, overflowX: 'auto', p: { xs: 3, md: 5 } }}>
        <Outlet />
      </Box>
    </Box>
  )
}
