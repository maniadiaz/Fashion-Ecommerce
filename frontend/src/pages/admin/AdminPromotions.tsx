import { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TablePagination from '@mui/material/TablePagination'
import IconButton from '@mui/material/IconButton'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'
import Alert from '@mui/material/Alert'
import Skeleton from '@mui/material/Skeleton'
import LinearProgress from '@mui/material/LinearProgress'
import Chip from '@mui/material/Chip'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import apiFetch from '../../api/client'
import type { Promotion } from '../../types'

interface PromotionForm {
  name: string
  description: string
  discount_pct: string
  starts_at: string
  ends_at: string
}

const EMPTY: PromotionForm = { name: '', description: '', discount_pct: '', starts_at: '', ends_at: '' }
const PAGE_SIZE_OPTIONS = [10, 25, 50]

export default function AdminPromotions() {
  const [items, setItems] = useState<Promotion[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Promotion | null>(null)
  const [form, setForm] = useState<PromotionForm>(EMPTY)
  const [saving, setSaving] = useState(false)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  function load(p = page, rpp = rowsPerPage) {
    setLoading(true)
    apiFetch<{ promotions: Promotion[]; total: number }>(`/admin/promotions?page=${p + 1}&limit=${rpp}`)
      .then((data) => { setItems(data?.promotions ?? []); setTotal(data?.total ?? 0) })
      .catch(() => setError('Failed to load'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [page, rowsPerPage]) // eslint-disable-line react-hooks/exhaustive-deps

  function openCreate() { setEditing(null); setForm(EMPTY); setOpen(true) }

  function openEdit(p: Promotion) {
    setEditing(p)
    setForm({
      name: p.name,
      description: p.description ?? '',
      discount_pct: String(p.discount_pct),
      starts_at: p.starts_at.slice(0, 16),
      ends_at: p.ends_at.slice(0, 16),
    })
    setOpen(true)
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this promotion?')) return
    try {
      await apiFetch(`/admin/promotions/${id}`, { method: 'DELETE' })
      load()
    } catch { setError('Delete failed') }
  }

  async function handleSave() {
    setSaving(true); setError('')
    try {
      const body = JSON.stringify({ ...form, discount_pct: Number(form.discount_pct) })
      if (editing) {
        await apiFetch(`/admin/promotions/${editing.id}`, { method: 'PUT', body })
      } else {
        await apiFetch('/admin/promotions', { method: 'POST', body })
      }
      setOpen(false); load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally { setSaving(false) }
  }

  function update(field: keyof PromotionForm, value: string) {
    setForm((p) => ({ ...p, [field]: value }))
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h2" sx={{ fontSize: '1.6rem' }}>Promotions</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate} size="small">Add Promotion</Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box sx={{ position: 'relative' }}>
        {loading && <LinearProgress sx={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1 }} />}
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Discount</TableCell>
              <TableCell>Starts</TableCell>
              <TableCell>Ends</TableCell>
              <TableCell>Active</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading
              ? Array.from({ length: rowsPerPage }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 6 }).map((__, j) => (
                      <TableCell key={j}><Skeleton height={24} /></TableCell>
                    ))}
                  </TableRow>
                ))
              : items.map((p) => (
                  <TableRow key={p.id} hover>
                    <TableCell>{p.name}</TableCell>
                    <TableCell>{p.discount_pct}%</TableCell>
                    <TableCell>{new Date(p.starts_at).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(p.ends_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Chip label={p.active ? 'Yes' : 'No'} color={p.active ? 'success' : 'default'} size="small" sx={{ borderRadius: 0 }} />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => openEdit(p)}><EditIcon fontSize="small" /></IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDelete(p.id)}><DeleteIcon fontSize="small" /></IconButton>
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

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth
        slotProps={{ paper: { sx: { borderRadius: 0 } } }}>
        <DialogTitle>{editing ? 'Edit Promotion' : 'New Promotion'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField label="Name" required fullWidth value={form.name} onChange={(e) => update('name', e.target.value)} />
          <TextField label="Description" multiline rows={2} fullWidth value={form.description} onChange={(e) => update('description', e.target.value)} />
          <TextField label="Discount %" required type="number" fullWidth value={form.discount_pct} onChange={(e) => update('discount_pct', e.target.value)} />
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <TextField label="Starts At" required type="datetime-local" slotProps={{ inputLabel: { shrink: true } }}
              value={form.starts_at} onChange={(e) => update('starts_at', e.target.value)} />
            <TextField label="Ends At" required type="datetime-local" slotProps={{ inputLabel: { shrink: true } }}
              value={form.ends_at} onChange={(e) => update('ends_at', e.target.value)} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
