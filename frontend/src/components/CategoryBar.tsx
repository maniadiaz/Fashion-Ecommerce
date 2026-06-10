import { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import apiFetch from '../api/client'
import type { Category } from '../types'

interface Props {
  active: string | null
  onChange: (slug: string | null) => void
}

export default function CategoryBar({ active, onChange }: Props) {
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    apiFetch<{ categories: Category[] }>('/categories')
      .then((data) => setCategories(Array.isArray(data?.categories) ? data.categories : []))
      .catch(() => null)
  }, [])

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 1,
        overflowX: 'auto',
        py: 1,
        '&::-webkit-scrollbar': { display: 'none' },
        scrollbarWidth: 'none',
      }}
    >
      {[{ slug: null, name: 'All' }, ...categories].map((cat) => {
        const slug = 'slug' in cat ? cat.slug : null
        const isActive = slug === active
        return (
          <Button
            key={slug ?? 'all'}
            onClick={() => onChange(slug)}
            disableRipple
            sx={{
              border: '1px solid #0A0A0A',
              borderRadius: 0,
              px: 2.5,
              py: 0.75,
              fontSize: '0.8rem',
              letterSpacing: '0.05em',
              flexShrink: 0,
              backgroundColor: isActive ? '#0A0A0A' : 'transparent',
              color: isActive ? '#fff' : '#0A0A0A',
              transition: 'all 200ms',
              '&:hover': {
                backgroundColor: isActive ? '#0A0A0A' : 'rgba(10,10,10,0.06)',
              },
            }}
          >
            {cat.name}
          </Button>
        )
      })}
    </Box>
  )
}
