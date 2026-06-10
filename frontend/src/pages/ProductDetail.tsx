import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Container from '@mui/material/Container'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Alert from '@mui/material/Alert'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import FavoriteIcon from '@mui/icons-material/Favorite'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { Link } from 'react-router-dom'
import apiFetch from '../api/client'
import { useCartStore } from '../store/cartStore'
import { useWishlistStore } from '../store/wishlistStore'
import PageSkeleton from '../components/PageSkeleton'
import type { Product } from '../types'

const DETAIL_FALLBACK = 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&q=80'

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [added, setAdded] = useState(false)
  const [imgError, setImgError] = useState(false)

  const addItem = useCartStore((s) => s.addItem)
  const { toggleItem, isWished } = useWishlistStore()

  useEffect(() => {
    if (!id) return
    apiFetch<{ product: Product }>(`/products/${id}`)
      .then((data) => setProduct(data?.product ?? null))
      .catch(() => setError('Product not found'))
      .finally(() => setLoading(false))
  }, [id])

  function handleAddToCart() {
    if (!product) return
    addItem({
      id: Date.now(),
      product_id: product.id,
      product_name: product.name,
      price: product.price,
      quantity: 1,
      image_url: product.image_url,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  if (loading) return <PageSkeleton variant="detail" />

  if (error || !product) {
    return (
      <Container maxWidth="lg" sx={{ pt: 12, pb: 8 }}>
        <Alert severity="error">{error || 'Product not found'}</Alert>
        <Button onClick={() => navigate('/')} sx={{ mt: 2 }} startIcon={<ArrowBackIcon />}>
          Back to home
        </Button>
      </Container>
    )
  }

  const wished = isWished(product.id)

  return (
    <Container maxWidth="lg" sx={{ pt: 12, pb: 8 }}>
      <Breadcrumbs sx={{ mb: 3, fontSize: '0.8rem' }}>
        <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>Home</Link>
        <Typography variant="body2" color="text.primary">{product.name}</Typography>
      </Breadcrumbs>

      <Box
        sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '60% 1fr' }, gap: { xs: 4, md: 8 } }}
      >
        {/* Image */}
        <Box sx={{ position: 'relative', overflow: 'hidden', aspectRatio: '3/4' }}>
          {product.badge && (
            <Box
              sx={{
                position: 'absolute',
                top: 16,
                left: 16,
                zIndex: 1,
                backgroundColor: '#C9A96E',
                color: '#fff',
                fontSize: '0.65rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                px: 1.5,
                py: 0.5,
              }}
            >
              {product.badge}
            </Box>
          )}
          <Box
            component="img"
            src={
              imgError || !product.image_url
                ? DETAIL_FALLBACK
                : product.image_url.startsWith('http')
                  ? product.image_url
                  : `http://localhost:3001${product.image_url}`
            }
            alt={product.name}
            onError={() => setImgError(true)}
            sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </Box>

        {/* Details */}
        <Box>
          {product.category_name && (
            <Typography
              variant="overline"
              sx={{ color: 'text.secondary', letterSpacing: '0.12em', display: 'block', mb: 1 }}
            >
              {product.category_name}
            </Typography>
          )}
          <Typography variant="h2" sx={{ fontSize: { xs: '1.8rem', md: '2.2rem' }, mb: 2 }}>
            {product.name}
          </Typography>
          <Typography variant="h5" sx={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, mb: 3 }}>
            ${Number(product.price).toFixed(2)}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8, mb: 4 }}>
            {product.description}
          </Typography>

          <Typography
            variant="caption"
            sx={{ color: product.stock > 0 ? 'success.main' : 'error.main', display: 'block', mb: 3 }}
          >
            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
          </Typography>

          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Button
              variant="contained"
              size="large"
              fullWidth
              disabled={product.stock === 0 || added}
              onClick={handleAddToCart}
              sx={{ py: 1.75, fontSize: '0.85rem' }}
            >
              {added ? 'Added to Cart' : 'Add to Cart'}
            </Button>
            <IconButton
              onClick={() => toggleItem(product.id)}
              sx={{
                border: '1px solid #E8E6E1',
                color: wished ? '#E63323' : 'text.secondary',
                width: 56,
                height: 56,
                flexShrink: 0,
              }}
              aria-label="toggle wishlist"
            >
              {wished ? <FavoriteIcon /> : <FavoriteBorderIcon />}
            </IconButton>
          </Box>
        </Box>
      </Box>
    </Container>
  )
}
