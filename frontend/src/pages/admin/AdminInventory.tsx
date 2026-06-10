import { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import Alert from '@mui/material/Alert'
import Skeleton from '@mui/material/Skeleton'
import CheckIcon from '@mui/icons-material/Check'
import apiFetch from '../../api/client'
import type { Product } from '../../types'

export default function AdminInventory() {
  const [items, setItems] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [edits, setEdits] = useState<Record<number, string>>({})
  const [saved, setSaved] = useState<Record<number, boolean>>({})

  useEffect(() => {
    apiFetch<Product[]>('/admin/inventory')
      .then(setItems)
      .catch(() => setError('Failed to load inventory'))
      .finally(() => setLoading(false))
  }, [])

  async function handleSave(id: number) {
    const stock = Number(edits[id])
    if (isNaN(stock)) return
    try {
      await apiFetch(`/admin/inventory/${id}`, { method: 'PUT', body: JSON.stringify({ stock }) })
      setItems((prev) => prev.map((p) => p.id === id ? { ...p, stock } : p))
      setEdits((p) => { const n = { ...p }; delete n[id]; return n })
      setSaved((p) => ({ ...p, [id]: true }))
      setTimeout(() => setSaved((p) => ({ ...p, [id]: false })), 1500)
    } catch {
      setError('Update failed')
    }
  }

  return (
    <Box>
      <Typography variant="h2" sx={{ fontSize: '1.6rem', mb: 4 }}>Inventory</Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} height={52} sx={{ mb: 1 }} />)
      ) : (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Product</TableCell>
              <TableCell>Current Stock</TableCell>
              <TableCell>Update Stock</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id} hover>
                <TableCell>{item.name}</TableCell>
                <TableCell
                  sx={{ color: item.stock === 0 ? 'error.main' : item.stock < 5 ? 'warning.main' : 'inherit' }}
                >
                  {item.stock}
                </TableCell>
                <TableCell>
                  <TextField
                    type="number"
                    size="small"
                    placeholder={String(item.stock)}
                    value={edits[item.id] ?? ''}
                    onChange={(e) => setEdits((p) => ({ ...p, [item.id]: e.target.value }))}
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
            ))}
          </TableBody>
        </Table>
      )}
    </Box>
  )
}
