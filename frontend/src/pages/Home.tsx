import { useEffect, useRef, useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import Skeleton from '@mui/material/Skeleton'
import Container from '@mui/material/Container'
import Rating from '@mui/material/Rating'
import TextField from '@mui/material/TextField'
import Stack from '@mui/material/Stack'
import { Link } from 'react-router-dom'
import CategoryBar from '../components/CategoryBar'
import ProductCard from '../components/ProductCard'
import apiFetch from '../api/client'
import { useIntersectionObserver } from '../hooks/useIntersectionObserver'
import type { Product } from '../types'

function AnimatedSection({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const visible = useIntersectionObserver(ref, { threshold: 0.1 })
  return (
    <Box
      ref={ref}
      sx={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(28px)',
        transition: 'opacity 0.6s ease, transform 0.6s ease',
      }}
    >
      {children}
    </Box>
  )
}

const TESTIMONIALS = [
  { name: 'Sofia M.', text: 'The quality exceeded my expectations. Every piece feels intentional.', rating: 5 },
  { name: 'James T.', text: 'Minimal, precise, timeless. VELN has redefined my wardrobe.', rating: 5 },
  { name: 'Elena R.', text: 'Exceptional craftsmanship and a seamless shopping experience.', rating: 5 },
]

export default function Home() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [email, setEmail] = useState('')

  useEffect(() => {
    const params = new URLSearchParams({ page: '1', limit: '8' })
    if (activeCategory) params.set('category', activeCategory)
    setLoading(true)
    apiFetch<{ products: Product[] }>(`/products?${params}`)
      .then((data) => setProducts(Array.isArray(data?.products) ? data.products : []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [activeCategory])

  return (
    <Box>
      {/* Hero */}
      <Box
        sx={{
          minHeight: '100vh',
          backgroundColor: '#F8F7F5',
          display: 'flex',
          alignItems: 'center',
          pt: 8,
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 45%' },
              gap: 6,
              alignItems: 'center',
            }}
          >
            <Box>
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: '3rem', md: '4.5rem' },
                  lineHeight: 1.1,
                  mb: 3,
                  letterSpacing: '-0.02em',
                }}
              >
                Dressed for
                <br />
                Every Chapter
              </Typography>
              <Typography
                variant="body1"
                sx={{ fontWeight: 300, color: 'text.secondary', mb: 4, maxWidth: 420, fontSize: '1.05rem' }}
              >
                Curated essentials that transcend seasons. Each piece designed
                with intention, crafted for longevity.
              </Typography>
              <Button
                component={Link}
                to="/products"
                variant="contained"
                size="large"
                sx={{ px: 4, py: 1.5, fontSize: '0.85rem' }}
              >
                Shop Collection
              </Button>
            </Box>
            <Box
              sx={{
                display: { xs: 'none', md: 'block' },
                height: { md: '70vh' },
                overflow: 'hidden',
              }}
            >
              <Box
                component="img"
                src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&auto=format&fit=crop"
                alt="VELN Collection"
                sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Products */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box>
          <Typography variant="h2" sx={{ fontSize: '2rem', mb: 1 }}>
            New Arrivals
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            Fresh pieces, timeless spirit
          </Typography>
          <CategoryBar active={activeCategory} onChange={setActiveCategory} />
        </Box>

        <Box
          sx={{
            mt: 4,
            display: 'grid',
            gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)' },
            gap: 2,
            minHeight: 480,
          }}
        >
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
                <Box key={i}>
                  <Skeleton
                    variant="rectangular"
                    sx={{ width: '100%', aspectRatio: '3/4', transform: 'none' }}
                  />
                  <Skeleton variant="text" sx={{ mt: 1, height: 18 }} />
                  <Skeleton variant="text" width="55%" sx={{ height: 16 }} />
                </Box>
              ))
            : products.map((product, i) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  animationDelay={i * 80}
                  index={i}
                />
              ))}
        </Box>
      </Container>

      {/* Featured Banner */}
      <AnimatedSection>
        <Box
          sx={{
            position: 'relative',
            color: '#fff',
            py: { xs: 10, md: 16 },
            textAlign: 'center',
            overflow: 'hidden',
          }}
        >
          {/* Background image */}
          <Box
            component="img"
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1400&q=80"
            alt=""
            aria-hidden
            sx={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              filter: 'brightness(0.35)',
            }}
          />
          <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
            <Typography
              variant="overline"
              sx={{ color: '#C9A96E', letterSpacing: '0.2em', display: 'block', mb: 2 }}
            >
              Featured Collection
            </Typography>
            <Typography variant="h2" sx={{ color: '#fff', fontSize: { xs: '2rem', md: '2.8rem' }, mb: 3 }}>
              The Winter Edit
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.75)', fontWeight: 300, mb: 4, maxWidth: 420, mx: 'auto' }}>
              Elevated essentials for the colder months. Refined silhouettes, premium materials.
            </Typography>
            <Button
              component={Link}
              to="/products?category=new-arrivals"
              variant="outlined"
              size="large"
              sx={{
                borderColor: '#fff',
                color: '#fff',
                px: 4,
                '&:hover': { borderColor: '#C9A96E', color: '#C9A96E', backgroundColor: 'transparent' },
              }}
            >
              Explore Edit
            </Button>
          </Container>
        </Box>
      </AnimatedSection>

      {/* Testimonials */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <AnimatedSection>
          <Typography variant="h2" sx={{ fontSize: '2rem', mb: 1, textAlign: 'center' }}>
            What Our Clients Say
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 6, textAlign: 'center' }}>
            Trusted by those who value quality
          </Typography>
          <Grid container spacing={3}>
            {TESTIMONIALS.map((t) => (
              <Grid size={{ xs: 12, md: 4 }} key={t.name}>
                <Box sx={{ border: '1px solid #E8E6E1', p: 4, height: '100%' }}>
                  <Rating value={t.rating} readOnly size="small" sx={{ mb: 2, color: '#C9A96E' }} />
                  <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary', mb: 3 }}>
                    "{t.text}"
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    — {t.name}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </AnimatedSection>
      </Container>

      {/* Newsletter */}
      <AnimatedSection>
        <Box sx={{ backgroundColor: '#F8F7F5', py: 10, borderTop: '1px solid #E8E6E1' }}>
          <Container maxWidth="sm" sx={{ textAlign: 'center' }}>
            <Typography variant="h2" sx={{ fontSize: '2rem', mb: 1 }}>
              Join the Inner Circle
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
              Early access, exclusive drops, curated edits — only for subscribers.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={0}>
              <TextField
                placeholder="your@email.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRight: { sm: 'none' },
                    borderRadius: 0,
                  },
                }}
              />
              <Button
                variant="contained"
                sx={{ px: 4, py: 1.75, flexShrink: 0, fontSize: '0.8rem' }}
                onClick={() => setEmail('')}
              >
                Subscribe
              </Button>
            </Stack>
          </Container>
        </Box>
      </AnimatedSection>

      {/* Footer */}
      <Box
        component="footer"
        sx={{ backgroundColor: '#0A0A0A', color: '#fff', py: 8 }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr 1fr', md: '2fr 1fr 1fr 1fr' },
              gap: 4,
              mb: 6,
            }}
          >
            <Box>
              <Typography
                variant="h5"
                sx={{ fontFamily: 'Playfair Display, serif', mb: 2, letterSpacing: '0.1em' }}
              >
                VELN
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.8 }}>
                Premium fashion for those who value craft, quality, and intention in every garment.
              </Typography>
            </Box>
            {[
              { title: 'Shop', links: ['New Arrivals', 'Women', 'Men', 'Accessories'] },
              { title: 'Help', links: ['Shipping', 'Returns', 'Size Guide', 'Contact'] },
              { title: 'Company', links: ['About', 'Careers', 'Press', 'Sustainability'] },
            ].map((col) => (
              <Box key={col.title}>
                <Typography
                  variant="overline"
                  sx={{ color: 'rgba(255,255,255,0.4)', letterSpacing: '0.15em', display: 'block', mb: 2 }}
                >
                  {col.title}
                </Typography>
                <Stack spacing={1.5}>
                  {col.links.map((link) => (
                    <Typography
                      key={link}
                      variant="body2"
                      sx={{
                        color: 'rgba(255,255,255,0.6)',
                        cursor: 'pointer',
                        '&:hover': { color: '#fff' },
                        transition: '150ms',
                      }}
                    >
                      {link}
                    </Typography>
                  ))}
                </Stack>
              </Box>
            ))}
          </Box>
          <Box sx={{ borderTop: '1px solid rgba(255,255,255,0.1)', pt: 3 }}>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)' }}>
              © {new Date().getFullYear()} VELN. All rights reserved.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  )
}
