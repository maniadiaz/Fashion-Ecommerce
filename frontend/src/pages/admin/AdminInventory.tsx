import { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TablePagination from '@mui/material/TablePagination'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import Alert from '@mui/material/Alert'
import Skeleton from '@mui/material/Skeleton'
import LinearProgress from '@mui/material/LinearProgress'
import CheckIcon from '@mui/icons-material/Check'
import apiFetch from '../../api/client'
import type { Product } from '../../types'

const PAGE_SIZE_OPTIONS = [10, 25, 50]

export default function AdminInventory() {
  const [items, setItems] = useState<Product[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [edits, setEdits] = useState<Record<number, string>>({})
  const [saved, setSaved] = useState<Record<number, boolean>>({})
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  function load(p = page, rpp = rowsPerPage) {
    setLoading(true)
    apiFetch<{ inventory: Product[]; total: number }>(`/admin/inventory?page=${p + 1}&limit=${rpp}`)
      .then((data) => { setItems(data?.inventory ?? []); setTotal(data?.total ?? 0) })
      .catch(() => setError('Failed to load inventory'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [page, rowsPerPage]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSave(id: number) {
    const stock = Number(edits[id])
    if (isNaN(stock) || stock < 0) return
    try {
      await apiFetch(`/admin/inventory/${id}`, { method: 'PUT', body: JSON.stringify({ stock }) })
      setItems((prev) => prev.map((p) => p.id === id ? { ...p, stock } : p))
      setEdits((p) => { const n = { ...p }; delete n[id]; return n })
      setSaved((p) => ({ ...p, [id]: true }))
      setTimeout(() => setSaved((p) => ({ ...p, [id]: false })), 1500)
    } catch { setError('Update failed') }
  }

  return (
    <Box>
      <Typography variant="h2" sx={{ fontSize: '1.6rem', mb: 4 }}>Inventory</Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box sx={{ position: 'relative' }}>
        {loading && <LinearProgress sx={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1 }} />}
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Product</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Current Stock</TableCell>
              <TableCell>Update Stock</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading
              ? Array.from({ length: rowsPerPage }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 5 }).map((__, j) => (
                      <TableCell key={j}><Skeleton height={24} /></TableCell>
                    ))}
                  </TableRow>
                ))
              : items.map((item) => (
                  <TableRow key={item.id} hover>
                    <TableCell>{item.name}</TableCell>
                    <TableCell sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>{item.category_name ?? '—'}</TableCell>
                    <TableCell
                      sx={{ color: item.stock === 0 ? 'error.main' : item.stock < 5 ? 'warning.main' : 'inherit', fontWeight: item.stock < 5 ? 600 : 400 }}
                    >
                      {item.stock}
                    </TableCell>
                    <TableCell>
                      <TextField type="number" size="small" placeholder={String(item.stock)}
                        value={edits[item.id] ?? ''}
                        onChange={(e) => setEdits((p) => ({ ...p, [item.id]: e.target.value }))}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleSave(item.id) }}
                        sx={{ width: 100, '& .MuiOutlinedInput-root': { borderRadius: 0 } }}
                      />
                    </TableCell>
                    <TableCell>
                      {edits[item.id] !== undefined && (
                        <IconButton size="small" onClick={() => handleSave(item.id)} color={saved[item.id] ? 'success' : 'primary'}>
                          <CheckIcon fontSize="small" />
                        </IconButton>
                      )}
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
