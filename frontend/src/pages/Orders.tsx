import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Container from '@mui/material/Container'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Skeleton from '@mui/material/Skeleton'
import Alert from '@mui/material/Alert'
import Collapse from '@mui/material/Collapse'
import Divider from '@mui/material/Divider'
import Fade from '@mui/material/Fade'
import apiFetch from '../api/client'
import type { Order } from '../types'

const STATUS_COLORS: Record<string, 'default' | 'info' | 'warning' | 'success' | 'error'> = {
  pending: 'default',
  processing: 'info',
  shipped: 'warning',
  delivered: 'success',
  cancelled: 'error',
}

const STATUS_STEPS = ['pending', 'processing', 'shipped', 'delivered']

function StatusTimeline({ status }: { status: string }) {
  const current = STATUS_STEPS.indexOf(status)
  if (status === 'cancelled') return null
  return (
    <Box sx={{ display: 'flex', gap: 0, mt: 2, mb: 3 }}>
      {STATUS_STEPS.map((step, i) => (
        <Box key={step} sx={{ flex: 1, position: 'relative' }}>
          <Box
            sx={{
              height: 4,
              backgroundColor: i <= current ? '#0A0A0A' : '#E8E6E1',
              transition: 'background-color 400ms',
            }}
          />
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              mt: 0.75,
              color: i <= current ? 'text.primary' : 'text.secondary',
              textTransform: 'capitalize',
              fontSize: '0.65rem',
              letterSpacing: '0.06em',
            }}
          >
            {step}
          </Typography>
        </Box>
      ))}
    </Box>
  )
}

function OrderCard({ order, highlight }: { order: Order; highlight?: boolean }) {
  const [expanded, setExpanded] = useState(highlight ?? false)

  return (
    <Box
      sx={{
        border: '1px solid #E8E6E1',
        mb: 2,
        transition: 'border-color 300ms',
        ...(highlight && { borderColor: '#0A0A0A' }),
      }}
    >
      <Box
        onClick={() => setExpanded((p) => !p)}
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          px: 3,
          py: 2.5,
          cursor: 'pointer',
          '&:hover': { backgroundColor: '#F8F7F5' },
        }}
      >
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            Order #{order.id}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {new Date(order.created_at).toLocaleDateString()} · ${Number(order.total).toFixed(2)}
          </Typography>
        </Box>
        <Chip
          label={order.status}
          color={STATUS_COLORS[order.status] ?? 'default'}
          size="small"
          sx={{ textTransform: 'capitalize', borderRadius: 0 }}
        />
      </Box>

      <Collapse in={expanded}>
        <Box sx={{ px: 3, pb: 3 }}>
          <Divider sx={{ mb: 2 }} />
          <StatusTimeline status={order.status} />
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mb: 2 }}>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                Ship to
              </Typography>
              <Typography variant="body2">{order.shipping_name}</Typography>
              <Typography variant="body2" color="text.secondary">{order.shipping_address}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                Payment
              </Typography>
              <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                {order.payment_method} · {order.payment_status}
              </Typography>
            </Box>
          </Box>
          {order.items && (
            <Box>
              {order.items.map((item) => (
                <Box
                  key={item.id}
                  sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderTop: '1px solid #E8E6E1' }}
                >
                  <Typography variant="body2">{item.product_name} × {item.quantity}</Typography>
                  <Typography variant="body2">${(item.unit_price * item.quantity).toFixed(2)}</Typography>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </Collapse>
    </Box>
  )
}

export default function Orders() {
  const { id: highlightId } = useParams<{ id?: string }>()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    apiFetch<Order[]>('/orders')
      .then(setOrders)
      .catch(() => setError('Failed to load orders'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <Container maxWidth="md" sx={{ pt: 12, pb: 8 }}>
      <Fade in={!loading} timeout={600}>
        <Box>
          <Typography variant="h2" sx={{ fontSize: '2rem', mb: 6 }}>
            Order History
          </Typography>

          {loading && Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} variant="rectangular" height={72} sx={{ mb: 2 }} />
          ))}

          {error && <Alert severity="error">{error}</Alert>}

          {!loading && orders.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              No orders yet.
            </Typography>
          )}

          {orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              highlight={highlightId ? Number(highlightId) === order.id : false}
            />
          ))}
        </Box>
      </Fade>
    </Container>
  )
}
