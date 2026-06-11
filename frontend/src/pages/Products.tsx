import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import CategoryBar from '../components/CategoryBar'
import ProductCard from '../components/ProductCard'
import PageSkeleton from '../components/PageSkeleton'
import apiFetch from '../api/client'
import type { Product } from '../types'

const PAGE_LIMIT = 12

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  const activeCategory = searchParams.get('category')

  const fetchPage = useCallback(
    async (p: number, replace: boolean) => {
      const params = new URLSearchParams({ page: String(p), limit: String(PAGE_LIMIT) })
      if (activeCategory) params.set('category', activeCategory)

      if (replace) setLoading(true)
      else setLoadingMore(true)

      try {
        const data = await apiFetch<{ products: Product[]; total: number }>(`/products?${params}`)
        const incoming = Array.isArray(data?.products) ? data.products : []
        setProducts((prev) => (replace ? incoming : [...prev, ...incoming]))
        setTotal(data?.total ?? 0)
      } catch {
        // keep existing products on error
      } finally {
        if (replace) setLoading(false)
        else setLoadingMore(false)
      }
    },
    [activeCategory]
  )

  // Reset and reload when category changes
  useEffect(() => {
    setPage(1)
    fetchPage(1, true)
  }, [activeCategory]) // eslint-disable-line react-hooks/exhaustive-deps

  function handleLoadMore() {
    const next = page + 1
    setPage(next)
    fetchPage(next, false)
  }

  function handleCategoryChange(slug: string | null) {
    if (slug) setSearchParams({ category: slug })
    else setSearchParams({})
  }

  const pageTitle = activeCategory
    ? activeCategory.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    : 'All Collections'

  const hasMore = products.length < total

  if (loading) return <PageSkeleton variant="grid" />

  return (
    <Box sx={{ pt: 12, pb: 10, backgroundColor: 'background.default', minHeight: '100vh' }}>
      <Container maxWidth="lg">
        <Box sx={{ mb: 6 }}>
          <Typography variant="h2" sx={{ fontSize: { xs: '1.75rem', md: '2.25rem' }, mb: 1 }}>
            {pageTitle}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            {`${total} piece${total !== 1 ? 's' : ''}`}
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
              <ProductCard key={product.id} product={product} animationDelay={i * 60} index={i} />
            ))
          )}
        </Box>

        {hasMore && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
            <Button
              variant="outlined"
              size="large"
              onClick={handleLoadMore}
              disabled={loadingMore}
              sx={{ px: 6, minWidth: 200 }}
            >
              {loadingMore ? <CircularProgress size={20} sx={{ color: 'inherit' }} /> : 'Load More'}
            </Button>
          </Box>
        )}

        {!hasMore && products.length > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
            <Typography variant="body2" color="text.secondary" sx={{ letterSpacing: '0.08em' }}>
              — All {total} pieces shown —
            </Typography>
          </Box>
        )}
      </Container>
    </Box>
  )
}
