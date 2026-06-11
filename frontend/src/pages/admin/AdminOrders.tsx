import { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TablePagination from '@mui/material/TablePagination'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Alert from '@mui/material/Alert'
import Skeleton from '@mui/material/Skeleton'
import LinearProgress from '@mui/material/LinearProgress'
import BlockIcon from '@mui/icons-material/Block'
import apiFetch from '../../api/client'
import type { Order } from '../../types'

const ORDER_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
const PAGE_SIZE_OPTIONS = [10, 25, 50]

const STATUS_COLOR: Record<string, 'default' | 'warning' | 'info' | 'success' | 'error'> = {
  pending: 'default',
  processing: 'warning',
  shipped: 'info',
  delivered: 'success',
  cancelled: 'error',
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  function load(p = page, rpp = rowsPerPage) {
    setLoading(true)
    apiFetch<{ orders: Order[]; total: number }>(`/admin/orders?page=${p + 1}&limit=${rpp}`)
      .then((data) => { setOrders(data?.orders ?? []); setTotal(data?.total ?? 0) })
      .catch(() => setError('Failed to load orders'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [page, rowsPerPage]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleStatusChange(id: number, status: string) {
    try {
      await apiFetch(`/admin/orders/${id}`, { method: 'PUT', body: JSON.stringify({ status }) })
      setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status: status as Order['status'] } : o))
    } catch { setError('Update failed') }
  }

  async function handleCancel(id: number) {
    if (!confirm('Cancel this order? This cannot be undone.')) return
    try {
      await apiFetch(`/admin/orders/${id}`, { method: 'DELETE' })
      setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status: 'cancelled' as Order['status'] } : o))
    } catch { setError('Cancel failed') }
  }

  return (
    <Box>
      <Typography variant="h2" sx={{ fontSize: '1.6rem', mb: 4 }}>Orders</Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box sx={{ position: 'relative' }}>
        {loading && <LinearProgress sx={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1 }} />}
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Payment</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading
              ? Array.from({ length: rowsPerPage }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 7 }).map((__, j) => (
                      <TableCell key={j}><Skeleton height={24} /></TableCell>
                    ))}
                  </TableRow>
                ))
              : orders.map((order) => (
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
                        renderValue={(v) => (
                          <Chip label={v} size="small" color={STATUS_COLOR[v] ?? 'default'}
                            sx={{ borderRadius: 0, textTransform: 'capitalize', cursor: 'pointer' }} />
                        )}
                        sx={{ '& .MuiOutlinedInput-notchedOutline': { border: 'none' } }}
                      >
                        {ORDER_STATUSES.map((s) => (
                          <MenuItem key={s} value={s} sx={{ fontSize: '0.85rem', textTransform: 'capitalize' }}>{s}</MenuItem>
                        ))}
                      </Select>
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Cancel order">
                        <span>
                          <IconButton
                            size="small"
                            color="error"
                            disabled={order.status === 'cancelled' || order.status === 'delivered'}
                            onClick={() => handleCancel(order.id)}
                          >
                            <BlockIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
            }
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => { setRowsPerPage(Number(e.target.value)); setPage(0) }}
          rowsPerPageOptions={PAGE_SIZE_OPTIONS}
        />
      </Box>
    </Box>
  )
}
