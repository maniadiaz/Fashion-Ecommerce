import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Container from '@mui/material/Container'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormLabel from '@mui/material/FormLabel'
import Divider from '@mui/material/Divider'
import Alert from '@mui/material/Alert'
import Grid from '@mui/material/Grid'
import apiFetch from '../api/client'
import { useCartStore } from '../store/cartStore'

interface OrderResponse { id: number }

export default function Checkout() {
  const navigate = useNavigate()
  const { items, subtotal, clearCart } = useCartStore()

  const [form, setForm] = useState({
    shipping_name: '',
    shipping_address: '',
    payment_method: 'card' as 'card' | 'transfer' | 'cash',
  })
  const [cardFields, setCardFields] = useState({ number: '', expiry: '', cvv: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function update(field: string, value: string) {
    setForm((p) => ({ ...p, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (items.length === 0) { setError('Your cart is empty'); return }
    setError('')
    setLoading(true)
    try {
      const res = await apiFetch<OrderResponse>('/orders', {
        method: 'POST',
        body: JSON.stringify({
          shipping_name: form.shipping_name,
          shipping_address: form.shipping_address,
          payment_method: form.payment_method,
        }),
      })
      clearCart()
      navigate(`/orders/${res.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Order failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxWidth="md" sx={{ pt: 12, pb: 8 }}>
      <Typography variant="h2" sx={{ fontSize: '2rem', mb: 6 }}>
        Checkout
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Grid container spacing={6} component="form" onSubmit={handleSubmit}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Typography variant="overline" sx={{ letterSpacing: '0.12em', display: 'block', mb: 3 }}>
            Shipping Information
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
              label="Full Name"
              required
              fullWidth
              value={form.shipping_name}
              onChange={(e) => update('shipping_name', e.target.value)}
            />
            <TextField
              label="Address"
              required
              fullWidth
              multiline
              rows={2}
              value={form.shipping_address}
              onChange={(e) => update('shipping_address', e.target.value)}
            />
          </Box>

          <Box sx={{ mt: 5 }}>
            <FormLabel
              component="legend"
              sx={{ color: 'text.primary', fontWeight: 600, mb: 2, fontSize: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase' }}
            >
              Payment Method
            </FormLabel>
            <RadioGroup
              value={form.payment_method}
              onChange={(e) => update('payment_method', e.target.value)}
            >
              {[
                { value: 'card', label: 'Credit Card' },
                { value: 'transfer', label: 'Bank Transfer' },
                { value: 'cash', label: 'Cash on Delivery' },
              ].map((opt) => (
                <FormControlLabel
                  key={opt.value}
                  value={opt.value}
                  control={<Radio />}
                  label={opt.label}
                  sx={{ border: '1px solid #E8E6E1', mx: 0, mb: 1, px: 2, py: 0.5 }}
                />
              ))}
            </RadioGroup>

            {form.payment_method === 'card' && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                <TextField
                  label="Card Number"
                  placeholder="•••• •••• •••• ••••"
                  fullWidth
                  value={cardFields.number}
                  onChange={(e) => setCardFields((p) => ({ ...p, number: e.target.value }))}
                />
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <TextField
                    label="Expiry"
                    placeholder="MM / YY"
                    value={cardFields.expiry}
                    onChange={(e) => setCardFields((p) => ({ ...p, expiry: e.target.value }))}
                  />
                  <TextField
                    label="CVV"
                    placeholder="•••"
                    value={cardFields.cvv}
                    onChange={(e) => setCardFields((p) => ({ ...p, cvv: e.target.value }))}
                  />
                </Box>
              </Box>
            )}
          </Box>
        </Grid>

        {/* Order summary */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Box sx={{ border: '1px solid #E8E6E1', p: 3, position: 'sticky', top: 88 }}>
            <Typography variant="overline" sx={{ letterSpacing: '0.12em', display: 'block', mb: 2 }}>
              Order Summary
            </Typography>
            {items.map((item) => (
              <Box key={item.product_id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                <Typography variant="body2" sx={{ flex: 1, mr: 2 }} noWrap>
                  {item.product_name} × {item.quantity}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  ${(item.price * item.quantity).toFixed(2)}
                </Typography>
              </Box>
            ))}
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography sx={{ fontWeight: 600 }}>Total</Typography>
              <Typography sx={{ fontWeight: 700 }}>${subtotal.toFixed(2)}</Typography>
            </Box>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={loading || items.length === 0}
              sx={{ py: 1.75, fontSize: '0.85rem' }}
            >
              {loading ? 'Placing Order…' : 'Place Order'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Container>
  )
}
