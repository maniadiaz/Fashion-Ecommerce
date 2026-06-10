import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import CategoryBar from '../components/CategoryBar'
import ProductCard from '../components/ProductCard'
import PageSkeleton from '../components/PageSkeleton'
import apiFetch from '../api/client'
import type { Product } from '../types'

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  const activeCategory = searchParams.get('category')

  function handleCategoryChange(slug: string | null) {
    if (slug) {
      setSearchParams({ category: slug })
    } else {
      setSearchParams({})
    }
  }

  useEffect(() => {
    const params = activeCategory ? `?category=${activeCategory}` : ''
    setLoading(true)
    apiFetch<{ products: Product[] }>(`/products${params}`)
      .then((data) => setProducts(Array.isArray(data?.products) ? data.products : []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [activeCategory])

  const pageTitle = activeCategory
    ? activeCategory
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')
    : 'All Collections'

  if (loading) return <PageSkeleton variant="grid" />

  return (
    <Box sx={{ pt: 12, pb: 10, backgroundColor: 'background.default', minHeight: '100vh' }}>
      <Container maxWidth="lg">
        <Box sx={{ mb: 6 }}>
          <Typography variant="h2" sx={{ fontSize: { xs: '1.75rem', md: '2.25rem' }, mb: 1 }}>
            {pageTitle}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            {`${products.length} piece${products.length !== 1 ? 's' : ''}`}
          </Typography>
          <CategoryBar active={activeCategory} onChange={handleCategoryChange} />
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)' },
            gap: 2,
            minHeight: 480,
          }}
        >
          {products.length === 0 ? (
            <Box
              sx={{
                gridColumn: '1 / -1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 300,
              }}
            >
              <Typography variant="body2" color="text.secondary">
                No products found in this category.
              </Typography>
            </Box>
          ) : (
            products.map((product, i) => (
              <ProductCard
                key={product.id}
                product={product}
                animationDelay={i * 60}
                index={i}
              />
            ))
          )}
        </Box>
      </Container>
    </Box>
  )
}
