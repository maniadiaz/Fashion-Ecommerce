import { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import IconButton from '@mui/material/IconButton'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'
import Alert from '@mui/material/Alert'
import Skeleton from '@mui/material/Skeleton'
import Chip from '@mui/material/Chip'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import apiFetch from '../../api/client'
import type { Coupon } from '../../types'

interface CouponForm {
  code: string
  discount_pct: string
  max_uses: string
  expires_at: string
}

const EMPTY: CouponForm = { code: '', discount_pct: '', max_uses: '', expires_at: '' }

export default function AdminCoupons() {
  const [items, setItems] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Coupon | null>(null)
  const [form, setForm] = useState<CouponForm>(EMPTY)
  const [saving, setSaving] = useState(false)

  function load() {
    setLoading(true)
    apiFetch<Coupon[]>('/admin/coupons')
      .then(setItems)
      .catch(() => setError('Failed to load'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  function openCreate() { setEditing(null); setForm(EMPTY); setOpen(true) }

  function openEdit(c: Coupon) {
    setEditing(c)
    setForm({
      code: c.code,
      discount_pct: String(c.discount_pct),
      max_uses: String(c.max_uses),
      expires_at: c.expires_at.slice(0, 16),
    })
    setOpen(true)
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this coupon?')) return
    try {
      await apiFetch(`/admin/coupons/${id}`, { method: 'DELETE' })
      load()
    } catch { setError('Delete failed') }
  }

  async function handleSave() {
    setSaving(true); setError('')
    try {
      const body = JSON.stringify({
        ...form,
        discount_pct: Number(form.discount_pct),
        max_uses: Number(form.max_uses),
      })
      if (editing) {
        await apiFetch(`/admin/coupons/${editing.id}`, { method: 'PUT', body })
      } else {
        await apiFetch('/admin/coupons', { method: 'POST', body })
      }
      setOpen(false); load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  function update(field: keyof CouponForm, value: string) {
    setForm((p) => ({ ...p, [field]: value }))
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h2" sx={{ fontSize: '1.6rem' }}>Coupons</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate} size="small">
          Add Coupon
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} height={52} sx={{ mb: 1 }} />)
      ) : (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Code</TableCell>
              <TableCell>Discount</TableCell>
              <TableCell>Uses</TableCell>
              <TableCell>Expires</TableCell>
              <TableCell>Active</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((c) => (
              <TableRow key={c.id} hover>
                <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>{c.code}</TableCell>
                <TableCell>{c.discount_pct}%</TableCell>
                <TableCell>{c.used_count} / {c.max_uses}</TableCell>
                <TableCell>{new Date(c.expires_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Chip label={c.active ? 'Yes' : 'No'} color={c.active ? 'success' : 'default'} size="small" sx={{ borderRadius: 0 }} />
                </TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => openEdit(c)}><EditIcon fontSize="small" /></IconButton>
                  <IconButton size="small" color="error" onClick={() => handleDelete(c.id)}><DeleteIcon fontSize="small" /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth
        slotProps={{ paper: { sx: { borderRadius: 0 } } }}>
        <DialogTitle>{editing ? 'Edit Coupon' : 'New Coupon'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField label="Code" required fullWidth value={form.code}
            onChange={(e) => update('code', e.target.value.toUpperCase())} />
          <TextField label="Discount %" type="number" fullWidth value={form.discount_pct}
            onChange={(e) => update('discount_pct', e.target.value)} />
          <TextField label="Max Uses" type="number" fullWidth value={form.max_uses}
            onChange={(e) => update('max_uses', e.target.value)} />
          <TextField label="Expires At" type="datetime-local" fullWidth slotProps={{ inputLabel: { shrink: true } }}
            value={form.expires_at} onChange={(e) => update('expires_at', e.target.value)} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
