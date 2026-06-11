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
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormHelperText from '@mui/material/FormHelperText'
import Alert from '@mui/material/Alert'
import Skeleton from '@mui/material/Skeleton'
import LinearProgress from '@mui/material/LinearProgress'
import Chip from '@mui/material/Chip'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import apiFetch from '../../api/client'
import type { Product, Category } from '../../types'

interface ProductFormData {
  name: string
  description: string
  price: string
  stock: string
  badge: string
  category_id: string
}

interface FormErrors {
  name?: string
  description?: string
  price?: string
  stock?: string
  category_id?: string
}

const EMPTY_FORM: ProductFormData = { name: '', description: '', price: '', stock: '', badge: '', category_id: '' }
const PAGE_SIZE_OPTIONS = [10, 25, 50]

function validate(form: ProductFormData): FormErrors {
  const e: FormErrors = {}
  if (!form.name.trim()) e.name = 'Name is required'
  if (!form.description.trim()) e.description = 'Description is required'
  if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0) e.price = 'Enter a valid price'
  if (!form.stock || isNaN(Number(form.stock)) || Number(form.stock) < 0) e.stock = 'Enter a valid stock'
  if (!form.category_id) e.category_id = 'Category is required'
  return e
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [total, setTotal] = useState(0)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [form, setForm] = useState<ProductFormData>(EMPTY_FORM)
  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  function load(p = page, rpp = rowsPerPage) {
    setLoading(true)
    Promise.all([
      apiFetch<{ products: Product[]; total: number }>(`/products?all=true&page=${p + 1}&limit=${rpp}`),
      apiFetch<{ categories: Category[] }>('/categories'),
    ])
      .then(([pd, cd]) => {
        setProducts(pd?.products ?? [])
        setTotal(pd?.total ?? 0)
        setCategories(cd?.categories ?? [])
      })
      .catch(() => setError('Failed to load data'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [page, rowsPerPage]) // eslint-disable-line react-hooks/exhaustive-deps

  function openCreate() {
    setEditing(null); setForm(EMPTY_FORM); setFormErrors({}); setImageFile(null); setOpen(true)
  }

  function openEdit(product: Product) {
    setEditing(product)
    setForm({
      name: product.name,
      description: product.description ?? '',
      price: String(product.price),
      stock: String(product.stock),
      badge: product.badge ?? '',
      category_id: String(product.category_id),
    })
    setFormErrors({}); setImageFile(null); setOpen(true)
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this product?')) return
    try {
      await apiFetch(`/products/${id}`, { method: 'DELETE' })
      load()
    } catch { setError('Delete failed') }
  }

  async function handleSave() {
    const errors = validate(form)
    if (Object.keys(errors).length > 0) { setFormErrors(errors); return }
    setSaving(true); setError('')
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => { if (v !== '') fd.append(k, v) })
      if (imageFile) fd.append('image', imageFile)
      if (editing) {
        await apiFetch(`/products/${editing.id}`, { method: 'PUT', body: fd })
      } else {
        await apiFetch('/products', { method: 'POST', body: fd })
      }
      setOpen(false); load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally { setSaving(false) }
  }

  function field(key: keyof ProductFormData, value: string) {
    setForm((p) => ({ ...p, [key]: value }))
    setFormErrors((p) => ({ ...p, [key]: undefined }))
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

      <Box sx={{ position: 'relative' }}>
        {loading && <LinearProgress sx={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1 }} />}
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Stock</TableCell>
              <TableCell>Badge</TableCell>
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
              : products.map((p) => (
                  <TableRow key={p.id} hover>
                    <TableCell>{p.name}</TableCell>
                    <TableCell sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>{p.category_name ?? '—'}</TableCell>
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
        <DialogTitle sx={{ fontFamily: 'Playfair Display, serif' }}>
          {editing ? 'Edit Product' : 'New Product'}
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField label="Name" required fullWidth value={form.name}
            error={!!formErrors.name} helperText={formErrors.name}
            onChange={(e) => field('name', e.target.value)} />
          <TextField label="Description" required multiline rows={3} fullWidth value={form.description}
            error={!!formErrors.description} helperText={formErrors.description}
            onChange={(e) => field('description', e.target.value)} />
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <TextField label="Price" required type="number" value={form.price}
              error={!!formErrors.price} helperText={formErrors.price}
              onChange={(e) => field('price', e.target.value)} />
            <TextField label="Stock" required type="number" value={form.stock}
              error={!!formErrors.stock} helperText={formErrors.stock}
              onChange={(e) => field('stock', e.target.value)} />
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <TextField label="Badge" value={form.badge} placeholder="new, sale, limited…"
              onChange={(e) => field('badge', e.target.value)} />
            <FormControl required error={!!formErrors.category_id}>
              <InputLabel>Category</InputLabel>
              <Select value={form.category_id} label="Category"
                onChange={(e) => field('category_id', String(e.target.value))}
                sx={{ '& .MuiOutlinedInput-notchedOutline': { borderRadius: 0 } }}>
                {categories.map((c) => (
                  <MenuItem key={c.id} value={String(c.id)}>{c.name}</MenuItem>
                ))}
              </Select>
              {formErrors.category_id && <FormHelperText>{formErrors.category_id}</FormHelperText>}
            </FormControl>
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
