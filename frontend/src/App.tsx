import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AssistantWidget } from './components/AssistantWidget';

// Pages
import { HomePage } from './pages/HomePage';
import { CataloguePage } from './pages/CataloguePage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { WishlistPage } from './pages/WishlistPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage';
import { CustomerOrdersPage } from './pages/CustomerOrdersPage';
import { CustomerProfilePage } from './pages/CustomerProfilePage';
import { SellersPage } from './pages/SellersPage';
import { SellerDetailPage } from './pages/SellerDetailPage';
import { SellerApplyPage } from './pages/SellerApplyPage';
import { SellerDashboardPage } from './pages/SellerDashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ShippingPolicyPage } from './pages/ShippingPolicyPage';
import { ReturnPolicyPage } from './pages/ReturnPolicyPage';
import { TermsPage } from './pages/TermsPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { ContactGrievancePage } from './pages/ContactGrievancePage';
import { Loader2 } from 'lucide-react';

// Scroll to top helper on route change
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// Route protection wrappers
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-700 animate-spin mb-3" />
        <p className="text-sm text-stone-500">Checking credentials...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

const SellerRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isSeller, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-700 animate-spin mb-3" />
        <p className="text-sm text-stone-500">Verifying seller access...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isSeller) {
    return <Navigate to="/seller-apply" replace />;
  }

  return <>{children}</>;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-700 animate-spin mb-3" />
        <p className="text-sm text-stone-500">Verifying admin privileges...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// 404 Not Found Page
const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <span className="text-7xl font-serif font-black text-stone-300 mb-2">404</span>
      <h1 className="text-2xl font-serif font-bold text-stone-900 mb-3">Page Not Found</h1>
      <p className="text-stone-600 max-w-md mb-6 text-sm">
        The curated page or regional manufacturer product you are looking for does not exist or has been moved.
      </p>
      <Link
        to="/"
        className="px-6 py-2.5 bg-amber-700 text-white rounded-xl font-medium text-sm hover:bg-amber-800 transition"
      >
        Return to Homepage
      </Link>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <ScrollToTop />
            <div className="min-h-screen flex flex-col bg-[#fbf9f6] text-stone-900 selection:bg-amber-200">
              <Navbar />
              <main className="flex-1">
                <Routes>
                  {/* Public Storefront Routes */}
                  <Route path="/" element={<HomePage />} />
                  <Route path="/catalogue" element={<CataloguePage />} />
                  <Route path="/product/:slug" element={<ProductDetailPage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/wishlist" element={<WishlistPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/order-confirmed/:orderNumber" element={<OrderConfirmationPage />} />

                  {/* Indian Regulatory, Grievance & Policy Routes */}
                  <Route path="/policy/shipping" element={<ShippingPolicyPage />} />
                  <Route path="/policy/returns" element={<ReturnPolicyPage />} />
                  <Route path="/policy/terms" element={<TermsPage />} />
                  <Route path="/policy/privacy" element={<PrivacyPage />} />
                  <Route path="/contact" element={<ContactGrievancePage />} />

                {/* Regional Indian Manufacturers & Stories */}
                <Route path="/sellers" element={<SellersPage />} />
                <Route path="/sellers/:slug" element={<SellerDetailPage />} />
                <Route path="/seller-apply" element={<SellerApplyPage />} />

                {/* Authentication Routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Customer Account Routes (Protected) */}
                <Route
                  path="/orders"
                  element={
                    <ProtectedRoute>
                      <CustomerOrdersPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <CustomerProfilePage />
                    </ProtectedRoute>
                  }
                />

                <Route path="/seller" element={<Navigate to="/seller/dashboard" replace />} />
                <Route
                  path="/seller/dashboard"
                  element={
                    <SellerRoute>
                      <SellerDashboardPage />
                    </SellerRoute>
                  }
                />

                {/* Admin Control Center (Protected) */}
                <Route
                  path="/admin"
                  element={
                    <AdminRoute>
                      <AdminDashboardPage />
                    </AdminRoute>
                  }
                />

                {/* Catch-all 404 */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>
            <Footer />
            <AssistantWidget />
          </div>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
    </Router>
  );
};

export default App;
