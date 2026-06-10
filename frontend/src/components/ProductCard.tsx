import { useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import FavoriteIcon from '@mui/icons-material/Favorite'
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined'
import { Link } from 'react-router-dom'
import type { Product } from '../types'
import { useCartStore } from '../store/cartStore'
import { useWishlistStore } from '../store/wishlistStore'

// Picsum seeds chosen for each fashion category — deterministic, always loads
const CATEGORY_FALLBACKS: Record<string, string[]> = {
  women: [
    'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&q=80',
    'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&q=80',
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80',
    'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600&q=80',
    'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600&q=80',
  ],
  men: [
    'https://images.unsplash.com/photo-1516826957135-700dedea698c?w=600&q=80',
    'https://images.unsplash.com/photo-1602810316498-ab67cf68c8e1?w=600&q=80',
    'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&q=80',
    'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=600&q=80',
    'https://images.unsplash.com/photo-1591195853828-11db59a44f43?w=600&q=80',
  ],
  accessories: [
    'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=600&q=80',
    'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&q=80',
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80',
    'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=600&q=80',
    'https://images.unsplash.com/photo-1547949003-9792a18a2601?w=600&q=80',
  ],
  default: [
    'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&q=80',
    'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&q=80',
    'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=600&q=80',
    'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&q=80',
    'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=600&q=80',
  ],
}

function getFallback(product: { id: number; category_slug?: string }, index: number): string {
  const slug = product.category_slug ?? 'default'
  const pool = CATEGORY_FALLBACKS[slug] ?? CATEGORY_FALLBACKS.default
  return pool[index % pool.length]
}

interface Props {
  product: Product
  animationDelay?: number
  index?: number
}

export default function ProductCard({ product, animationDelay = 0, index = 0 }: Props) {
  const [hovered, setHovered] = useState(false)
  const addItem = useCartStore((s) => s.addItem)
  const { toggleItem, isWished } = useWishlistStore()
  const wished = isWished(product.id)

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    addItem({
      id: Date.now(),
      product_id: product.id,
      product_name: product.name,
      price: product.price,
      quantity: 1,
      image_url: product.image_url,
    })
  }

  function handleWishlist(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    toggleItem(product.id)
  }

  const [imgError, setImgError] = useState(false)

  const primarySrc = product.image_url
    ? product.image_url.startsWith('http')
      ? product.image_url
      : `http://localhost:3001${product.image_url}`
    : null

  const imgSrc = (!primarySrc || imgError)
    ? getFallback(product, index)
    : primarySrc

  return (
    <Box
      sx={{
        opacity: 0,
        transform: 'translateY(20px)',
        animation: 'fadeInUp 0.5s ease forwards',
        animationDelay: `${animationDelay}ms`,
        '@keyframes fadeInUp': {
          to: { opacity: 1, transform: 'translateY(0)' },
        },
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image wrapper */}
      <Box
        component={Link}
        to={`/product/${product.id}`}
        sx={{
          display: 'block',
          position: 'relative',
          overflow: 'hidden',
          aspectRatio: '3/4',
          backgroundColor: '#F0EFED',
          mb: 1.5,
        }}
      >
        {/* Product image */}
        <Box
          component="img"
          src={imgSrc}
          alt={product.name}
          onError={() => setImgError(true)}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
            transform: hovered ? 'scale(1.05)' : 'scale(1)',
            transition: 'transform 600ms ease',
          }}
        />

        {/* Badge */}
        {product.badge && (
          <Box
            sx={{
              position: 'absolute',
              top: 10,
              left: 10,
              backgroundColor: '#0A0A0A',
              color: '#fff',
              fontSize: '0.58rem',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              px: 1,
              py: 0.25,
              lineHeight: 1.8,
              zIndex: 2,
            }}
          >
            {product.badge}
          </Box>
        )}

        {/* Hover action buttons — wishlist top-right, bag bottom-right */}
        <IconButton
          onClick={handleWishlist}
          aria-label="toggle wishlist"
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 3,
            width: 36,
            height: 36,
            backgroundColor: '#fff',
            borderRadius: '50%',
            color: wished ? '#E63323' : '#0A0A0A',
            boxShadow: '0 2px 8px rgba(10,10,10,0.12)',
            opacity: hovered || wished ? 1 : 0,
            transform: hovered || wished ? 'scale(1)' : 'scale(0.8)',
            transition: 'opacity 200ms ease, transform 200ms ease',
            '&:hover': { backgroundColor: wished ? '#fff' : '#E63323', color: '#fff' },
          }}
        >
          {wished
            ? <FavoriteIcon sx={{ fontSize: 16 }} />
            : <FavoriteBorderIcon sx={{ fontSize: 16 }} />}
        </IconButton>

        {/* Quick Add — slides up from bottom */}
        <Box
          onClick={handleAddToCart}
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: '#0A0A0A',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
            py: 1.25,
            fontSize: '0.78rem',
            fontFamily: 'Inter, sans-serif',
            fontWeight: 500,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            transform: hovered ? 'translateY(0)' : 'translateY(100%)',
            transition: 'transform 300ms ease',
            zIndex: 2,
            '&:hover': { backgroundColor: '#1a1a1a' },
          }}
        >
          <ShoppingBagOutlinedIcon sx={{ fontSize: 15 }} />
          Quick Add
        </Box>
      </Box>

      {/* Info below image */}
      <Box>
        {product.category_name && (
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              fontSize: '0.62rem',
              display: 'block',
              mb: 0.4,
            }}
          >
            {product.category_name}
          </Typography>
        )}
        <Typography
          component={Link}
          to={`/product/${product.id}`}
          sx={{
            display: 'block',
            color: 'text.primary',
            fontSize: '0.9rem',
            fontWeight: 500,
            textDecoration: 'none',
            mb: 0.4,
            '&:hover': { opacity: 0.7 },
          }}
        >
          {product.name}
        </Typography>
        <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: 'text.primary' }}>
          ${Number(product.price).toFixed(2)}
        </Typography>
      </Box>
    </Box>
  )
}
