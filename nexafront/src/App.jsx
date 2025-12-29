import React from 'react';
import { createBrowserRouter, RouterProvider, createRoutesFromElements, Route, Navigate } from 'react-router-dom';
import Layout from './components/layouts/Layout';
import LandingPage from './pages/LandingPage';
import SellerRegister from './pages/SellerRegister';
import SellerLogin from './pages/SellerLogin';
import SellerVerifyEmail from './pages/SellerVerifyEmail';
import SellerDashboard from './pages/SellerDashboard';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/common/ProtectedRoute';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import SellerOrders from './pages/SellerOrders';
import CustomerRegister from './pages/CustomerRegister';
import CustomerLogin from './pages/CustomerLogin';
import ForgotPassword from './pages/ForgotPassword';
import CustomerProfile from './pages/CustomerProfile';
import CustomerAddresses from './pages/CustomerAddresses';
import VerifyOtp from './pages/VerifyOtp';
import ProductDetail from './pages/ProductDetail';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />}>
      <Route index element={<LandingPage />} />

      {/* Product Routes */}
      <Route path="products/:id" element={<ProductDetail />} />

      {/* Seller Routes */}
      <Route path="seller/register" element={<SellerRegister />} />
      <Route path="seller/verify" element={<SellerVerifyEmail />} />
      <Route path="seller/login" element={<SellerLogin />} />
      <Route
        path="seller/dashboard"
        element={
          <ProtectedRoute allowedRoles={['seller']}>
            <SellerDashboard />
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route path="admin/login" element={<AdminLogin />} />
      <Route
        path="admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* Customer Routes (require auth only) */}
      {/* Public customer auth */}
      <Route path="customer/register" element={<CustomerRegister />} />
      <Route path="customer/login" element={<CustomerLogin />} />
      <Route path="customer/forgot-password" element={<ForgotPassword />} />
      <Route path="customer/verify-email" element={<VerifyOtp mode="email" />} />
      <Route path="customer/verify-mobile" element={<VerifyOtp mode="mobile" />} />

      {/* Short aliases for customer auth */}
      <Route path="login" element={<Navigate to="/customer/login" replace />} />
      <Route path="register" element={<Navigate to="/customer/register" replace />} />

      {/* Private customer */}
      <Route
        path="cart"
        element={
          <ProtectedRoute>
            <Cart />
          </ProtectedRoute>
        }
      />
      <Route
        path="checkout"
        element={
          <ProtectedRoute>
            <Checkout />
          </ProtectedRoute>
        }
      />
      <Route
        path="orders"
        element={
          <ProtectedRoute>
            <Orders />
          </ProtectedRoute>
        }
      />
      <Route
        path="orders/:orderId"
        element={
          <ProtectedRoute>
            <OrderDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="customer/profile"
        element={
          <ProtectedRoute>
            <CustomerProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="customer/addresses"
        element={
          <ProtectedRoute>
            <CustomerAddresses />
          </ProtectedRoute>
        }
      />

      {/* Seller Orders */}
      <Route
        path="seller/orders"
        element={
          <ProtectedRoute allowedRoles={['seller']}>
            <SellerOrders />
          </ProtectedRoute>
        }
      />
    </Route>
  )
);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
