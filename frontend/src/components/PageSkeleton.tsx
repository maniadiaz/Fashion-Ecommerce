import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Skeleton from '@mui/material/Skeleton'
import LinearProgress from '@mui/material/LinearProgress'

interface Props {
  variant?: 'grid' | 'detail'
}

export default function PageSkeleton({ variant = 'grid' }: Props) {
  return (
    <Box sx={{ pt: 12, pb: 8, backgroundColor: 'background.default', minHeight: '100vh' }}>
      {/* Top progress bar */}
      <LinearProgress
        sx={{
          position: 'fixed',
          top: 72,
          left: 0,
          right: 0,
          zIndex: 1200,
          height: 2,
          backgroundColor: 'rgba(10,10,10,0.08)',
          '& .MuiLinearProgress-bar': { backgroundColor: '#0A0A0A' },
        }}
      />

      <Container maxWidth="lg">
        {variant === 'grid' ? <GridSkeleton /> : <DetailSkeleton />}
      </Container>
    </Box>
  )
}

function GridSkeleton() {
  return (
    <>
      <Box sx={{ mb: 6 }}>
        <Skeleton variant="text" width={220} height={48} sx={{ mb: 1 }} />
        <Skeleton variant="text" width={80} height={20} sx={{ mb: 4 }} />
        {/* Category bar */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} variant="rectangular" width={90} height={36} />
          ))}
        </Box>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(3,1fr)', md: 'repeat(4,1fr)' },
          gap: 2,
        }}
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <Box key={i}>
            <Skeleton variant="rectangular" sx={{ width: '100%', aspectRatio: '3/4', transform: 'none' }} />
            <Skeleton variant="text" sx={{ mt: 1, height: 18 }} />
            <Skeleton variant="text" width="55%" sx={{ height: 16 }} />
          </Box>
        ))}
      </Box>
    </>
  )
}

function DetailSkeleton() {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '60% 1fr' }, gap: { xs: 4, md: 8 } }}>
      <Skeleton variant="rectangular" sx={{ width: '100%', aspectRatio: '3/4', transform: 'none' }} />
      <Box>
        <Skeleton variant="text" width="35%" height={20} sx={{ mb: 2 }} />
        <Skeleton variant="text" width="80%" height={52} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="25%" height={36} sx={{ mb: 3 }} />
        <Skeleton variant="text" width="90%" height={18} />
        <Skeleton variant="text" width="75%" height={18} sx={{ mb: 4 }} />
        <Skeleton variant="text" width="30%" height={18} sx={{ mb: 3 }} />
        <Skeleton variant="rectangular" height={56} sx={{ transform: 'none' }} />
      </Box>
    </Box>
  )
}
