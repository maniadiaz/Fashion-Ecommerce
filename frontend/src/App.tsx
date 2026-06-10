import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { type ReactNode } from 'react'
import Box from '@mui/material/Box'
import Navbar from './components/Navbar'
import CartDrawer from './components/CartDrawer'
import AuthDrawer from './components/AuthDrawer'
import Home from './pages/Home'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import Checkout from './pages/Checkout'
import Orders from './pages/Orders'
import AdminLayout from './pages/admin/AdminLayout'
import AdminProducts from './pages/admin/AdminProducts'
import AdminOrders from './pages/admin/AdminOrders'
import AdminInventory from './pages/admin/AdminInventory'
import AdminPromotions from './pages/admin/AdminPromotions'
import AdminCoupons from './pages/admin/AdminCoupons'
import { useAuthStore } from './store/authStore'
import RouteProgress from './components/RouteProgress'

function ProtectedRoute({ children }: { children: ReactNode }) {
  const token = useAuthStore((s) => s.token)
  return token ? <>{children}</> : <Navigate to="/" replace />
}

function AppShell({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      <Box component="main" sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
        {children}
      </Box>
      <CartDrawer />
      <AuthDrawer />
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <RouteProgress />
      <Routes>
        <Route
          path="/"
          element={
            <AppShell>
              <Home />
            </AppShell>
          }
        />
        <Route
          path="/products"
          element={
            <AppShell>
              <Products />
            </AppShell>
          }
        />
        <Route
          path="/product/:id"
          element={
            <AppShell>
              <ProductDetail />
            </AppShell>
          }
        />
        <Route
          path="/checkout"
          element={
            <AppShell>
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            </AppShell>
          }
        />
        <Route
          path="/orders"
          element={
            <AppShell>
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            </AppShell>
          }
        />
        <Route
          path="/orders/:id"
          element={
            <AppShell>
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            </AppShell>
          }
        />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/products" replace />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="inventory" element={<AdminInventory />} />
          <Route path="promotions" element={<AdminPromotions />} />
          <Route path="coupons" element={<AdminCoupons />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
