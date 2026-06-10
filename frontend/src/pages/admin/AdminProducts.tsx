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
import type { Product } from '../../types'

interface ProductFormData {
  name: string
  description: string
  price: string
  stock: string
  badge: string
  category_id: string
}

const EMPTY_FORM: ProductFormData = { name: '', description: '', price: '', stock: '', badge: '', category_id: '' }

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [form, setForm] = useState<ProductFormData>(EMPTY_FORM)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)

  function load() {
    setLoading(true)
    apiFetch<Product[]>('/products?all=true')
      .then(setProducts)
      .catch(() => setError('Failed to load products'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  function openCreate() {
    setEditing(null)
    setForm(EMPTY_FORM)
    setImageFile(null)
    setOpen(true)
  }

  function openEdit(product: Product) {
    setEditing(product)
    setForm({
      name: product.name,
      description: product.description,
      price: String(product.price),
      stock: String(product.stock),
      badge: product.badge ?? '',
      category_id: String(product.category_id),
    })
    setImageFile(null)
    setOpen(true)
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this product?')) return
    try {
      await apiFetch(`/products/${id}`, { method: 'DELETE' })
      load()
    } catch {
      setError('Delete failed')
    }
  }

  async function handleSave() {
    setSaving(true)
    setError('')
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v) })
      if (imageFile) fd.append('image', imageFile)

      if (editing) {
        await apiFetch(`/products/${editing.id}`, { method: 'PUT', body: fd })
      } else {
        await apiFetch('/products', { method: 'POST', body: fd })
      }
      setOpen(false)
      load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h2" sx={{ fontSize: '1.6rem' }}>Products</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate} size="small">
          Add Product
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} height={52} sx={{ mb: 1 }} />)
      ) : (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Stock</TableCell>
              <TableCell>Badge</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((p) => (
              <TableRow key={p.id} hover>
                <TableCell>{p.name}</TableCell>
                <TableCell>${Number(p.price).toFixed(2)}</TableCell>
                <TableCell>{p.stock}</TableCell>
                <TableCell>{p.badge && <Chip label={p.badge} size="small" sx={{ borderRadius: 0 }} />}</TableCell>
                <TableCell>
                  <Chip
                    label={p.active ? 'Active' : 'Inactive'}
                    color={p.active ? 'success' : 'default'}
                    size="small"
                    sx={{ borderRadius: 0 }}
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => openEdit(p)}><EditIcon fontSize="small" /></IconButton>
                  <IconButton size="small" color="error" onClick={() => handleDelete(p.id)}><DeleteIcon fontSize="small" /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth
        slotProps={{ paper: { sx: { borderRadius: 0 } } }}>
        <DialogTitle sx={{ fontFamily: 'Playfair Display, serif' }}>
          {editing ? 'Edit Product' : 'New Product'}
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField label="Name" required fullWidth value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
          <TextField label="Description" multiline rows={3} fullWidth value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <TextField label="Price" type="number" value={form.price}
              onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))} />
            <TextField label="Stock" type="number" value={form.stock}
              onChange={(e) => setForm((p) => ({ ...p, stock: e.target.value }))} />
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <TextField label="Badge" value={form.badge}
              onChange={(e) => setForm((p) => ({ ...p, badge: e.target.value }))} />
            <TextField label="Category ID" type="number" value={form.category_id}
              onChange={(e) => setForm((p) => ({ ...p, category_id: e.target.value }))} />
          </Box>
          <Button component="label" variant="outlined" size="small" sx={{ alignSelf: 'flex-start' }}>
            {imageFile ? imageFile.name : 'Upload Image'}
            <input type="file" accept="image/*" hidden onChange={(e) => setImageFile(e.target.files?.[0] ?? null)} />
          </Button>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
