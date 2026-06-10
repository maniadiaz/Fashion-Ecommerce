import { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Chip from '@mui/material/Chip'
import Alert from '@mui/material/Alert'
import Skeleton from '@mui/material/Skeleton'
import apiFetch from '../../api/client'
import type { Order } from '../../types'

const ORDER_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    apiFetch<Order[]>('/admin/orders')
      .then(setOrders)
      .catch(() => setError('Failed to load orders'))
      .finally(() => setLoading(false))
  }, [])

  async function handleStatusChange(id: number, status: string) {
    try {
      await apiFetch(`/admin/orders/${id}`, { method: 'PUT', body: JSON.stringify({ status }) })
      setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status: status as Order['status'] } : o))
    } catch {
      setError('Update failed')
    }
  }

  return (
    <Box>
      <Typography variant="h2" sx={{ fontSize: '1.6rem', mb: 4 }}>Orders</Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} height={52} sx={{ mb: 1 }} />)
      ) : (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Payment</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id} hover>
                <TableCell>#{order.id}</TableCell>
                <TableCell>{order.shipping_name}</TableCell>
                <TableCell>${Number(order.total).toFixed(2)}</TableCell>
                <TableCell>
                  <Chip
                    label={order.payment_status}
                    size="small"
                    color={order.payment_status === 'paid' ? 'success' : 'default'}
                    sx={{ borderRadius: 0, textTransform: 'capitalize' }}
                  />
                </TableCell>
                <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Select
                    value={order.status}
                    size="small"
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    sx={{ fontSize: '0.8rem', '& .MuiOutlinedInput-notchedOutline': { borderRadius: 0 } }}
                  >
                    {ORDER_STATUSES.map((s) => (
                      <MenuItem key={s} value={s} sx={{ fontSize: '0.8rem', textTransform: 'capitalize' }}>
                        {s}
                      </MenuItem>
                    ))}
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Box>
  )
}
