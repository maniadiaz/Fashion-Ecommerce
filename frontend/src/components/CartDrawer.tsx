import Drawer from '@mui/material/Drawer'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import CloseIcon from '@mui/icons-material/Close'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import { useNavigate } from 'react-router-dom'
import { useCartStore } from '../store/cartStore'
import { useUiStore } from '../store/uiStore'

export default function CartDrawer() {
  const { cartOpen, closeCart } = useUiStore()
  const { items, subtotal, removeItem, updateQuantity } = useCartStore()
  const navigate = useNavigate()

  function handleCheckout() {
    closeCart()
    navigate('/checkout')
  }

  return (
    <Drawer
      anchor="right"
      open={cartOpen}
      onClose={closeCart}
      slotProps={{ paper: { sx: { width: { xs: '100vw', sm: 400 }, maxWidth: '100vw', overflowX: 'hidden' } } }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflowX: 'hidden' }}>

        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            px: 3,
            py: 2.5,
            borderBottom: '1px solid #E8E6E1',
            flexShrink: 0,
          }}
        >
          <Typography
            sx={{ fontFamily: 'Playfair Display, serif', fontSize: '1.25rem', fontWeight: 600 }}
          >
            Shopping Cart
          </Typography>
          <IconButton onClick={closeCart} size="small" aria-label="close cart" sx={{ color: 'text.primary' }}>
            <CloseIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>

        {/* Items list */}
        <Box sx={{ flex: 1, overflowY: 'auto', px: 3 }}>
          {items.length === 0 ? (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <Typography variant="body2" color="text.secondary">
                Your cart is empty
              </Typography>
            </Box>
          ) : (
            items.map((item) => (
              <Box
                key={item.product_id}
                sx={{
                  display: 'flex',
                  gap: 2,
                  py: 2.5,
                  borderBottom: '1px solid rgba(10,10,10,0.08)',
                }}
              >
                {/* Image */}
                <Box
                  component="img"
                  src={
                    !item.image_url
                      ? 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=200&q=80'
                      : item.image_url.startsWith('http')
                        ? item.image_url
                        : `http://localhost:3001${item.image_url}`
                  }
                  alt={item.product_name}
                  sx={{
                    width: 80,
                    height: 100,
                    objectFit: 'cover',
                    flexShrink: 0,
                    backgroundColor: '#F0EFED',
                  }}
                />

                {/* Details */}
                <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                  <Typography
                    sx={{ fontSize: '0.875rem', fontWeight: 500, mb: 0.5, lineHeight: 1.4 }}
                    noWrap
                  >
                    {item.product_name}
                  </Typography>
                  <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, mb: 'auto' }}>
                    ${Number(item.price).toFixed(2)}
                  </Typography>

                  {/* Controls */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 1.5 }}>
                    <IconButton
                      size="small"
                      onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                      sx={{
                        border: '1px solid #0A0A0A',
                        borderRadius: 0,
                        width: 28,
                        height: 28,
                        '&:hover': { backgroundColor: '#0A0A0A', color: '#fff' },
                      }}
                    >
                      <RemoveIcon sx={{ fontSize: 12 }} />
                    </IconButton>
                    <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, minWidth: 24, textAlign: 'center' }}>
                      {item.quantity}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                      sx={{
                        border: '1px solid #0A0A0A',
                        borderRadius: 0,
                        width: 28,
                        height: 28,
                        '&:hover': { backgroundColor: '#0A0A0A', color: '#fff' },
                      }}
                    >
                      <AddIcon sx={{ fontSize: 12 }} />
                    </IconButton>
                    <Typography
                      onClick={() => removeItem(item.product_id)}
                      sx={{
                        ml: 'auto',
                        fontSize: '0.75rem',
                        color: 'text.secondary',
                        cursor: 'pointer',
                        textDecoration: 'underline',
                        '&:hover': { color: '#E63323' },
                      }}
                    >
                      Remove
                    </Typography>
                  </Box>
                </Box>
              </Box>
            ))
          )}
        </Box>

        {/* Footer — always visible */}
        <Box
          sx={{
            flexShrink: 0,
            borderTop: '1px solid rgba(10,10,10,0.08)',
            px: 3,
            py: 3,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
            <Typography sx={{ fontSize: '1rem', fontWeight: 600 }}>Subtotal</Typography>
            <Typography sx={{ fontSize: '1rem', fontWeight: 600 }}>
              ${subtotal.toFixed(2)}
            </Typography>
          </Box>
          <Button
            variant="contained"
            fullWidth
            onClick={handleCheckout}
            disabled={items.length === 0}
            sx={{ py: 1.75, fontSize: '0.82rem' }}
          >
            Checkout
          </Button>
        </Box>
      </Box>
    </Drawer>
  )
}
