import React, { useEffect, useState } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { MarqueeTicker } from './components/MarqueeTicker';
import { BestsellerSpotlight } from './components/BestsellerSpotlight';
import { ProductCatalog } from './components/ProductCatalog';
import { PrintGallery } from './components/PrintGallery';
import { ReviewsSection } from './components/ReviewsSection';
import { FAQSection } from './components/FAQSection';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { QuickViewModal } from './components/QuickViewModal';
import { StickyQuickBar } from './components/StickyQuickBar';
import { ToastNotification, ToastMessage } from './components/ToastNotification';
import { AuthModal } from './components/AuthModal';
import { AdminShoppingNotice } from './components/AdminShoppingNotice';

import { AuthProvider, useAuth } from './context/AuthContext';
import { ProductsProvider, useProducts } from './context/ProductsContext';
import { CartProvider, useCart } from './context/CartContext';
import { AuthModalProvider, useAuthModal } from './context/AuthModalContext';
import { authErrorMessage } from './context/AuthContext';
import { ApiError } from './lib/api';

import { REVIEWS } from './data/totes';
import { Product, Review } from './types';

import { CheckoutPage } from './pages/CheckoutPage';
import { OrdersPage } from './pages/OrdersPage';
import { OrderDetailPage } from './pages/OrderDetailPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage';
import { AdminProductsPage } from './pages/admin/AdminProductsPage';

interface AddToCartItem {
  id: string;
  name: string;
  variantId: string;
  variantName: string;
  colorHex: string;
  image: string;
  price: number;
}

function HomePage({
  onAddToCart,
  onQuickView,
  currency,
  formatPrice,
  reviewsList,
  onAddReview,
}: {
  onAddToCart: (item: AddToCartItem) => void;
  onQuickView: (product: Product) => void;
  currency: 'INR' | 'USD';
  formatPrice: (inr: number) => string;
  reviewsList: Review[];
  onAddReview: (review: Review) => void;
}) {
  const { products } = useProducts();

  return (
    <main>
      <Hero onAddToCart={onAddToCart} currency={currency} formatPrice={formatPrice} />
      <MarqueeTicker />
      <BestsellerSpotlight onAddToCart={onAddToCart} formatPrice={formatPrice} />
      <ProductCatalog
        products={products}
        onAddToCart={onAddToCart}
        onQuickView={onQuickView}
        formatPrice={formatPrice}
      />
      <PrintGallery
        onQuickViewByProductId={(productId) => {
          const found = products.find((p) => p.id === productId);
          if (found) onQuickView(found);
        }}
        formatPrice={formatPrice}
      />
      <ReviewsSection reviews={reviewsList} onAddReview={onAddReview} />
      <FAQSection />
    </main>
  );
}

function AppShell() {
  const { user, logout } = useAuth();
  const { addItem, itemCount } = useCart();
  const { openAuthModal } = useAuthModal();

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [reviewsList, setReviewsList] = useState<Review[]>(REVIEWS);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [pendingSection, setPendingSection] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const showToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const INR_TO_USD_RATE = 0.012;
  const formatPrice = (inrPrice: number): string => {
    if (currency === 'USD') {
      const usd = Math.round(inrPrice * INR_TO_USD_RATE * 100) / 100;
      return `$${usd}`;
    }
    return `₹${inrPrice.toLocaleString('en-IN')}`;
  };

  const handleToggleCurrency = () => {
    setCurrency((prev) => {
      const next = prev === 'INR' ? 'USD' : 'INR';
      showToast({
        title: `Currency Switched to ${next}`,
        subtitle: next === 'USD' ? 'Approximate USD Rates Applied' : 'Domestic INR Rates Applied',
        type: 'info',
      });
      return next;
    });
  };

  // Admin accounts are blocked from the customer side by the API. Offer the way
  // out rather than the rejection.
  const isAdmin = user?.role === 'ADMIN';

  const switchToCustomerAccount = async () => {
    await logout();
    openAuthModal();
  };

  const showAdminCannotShopToast = () => {
    showToast({
      title: "Admin accounts can't place orders",
      subtitle: 'Sign in with a customer account to shop',
      type: 'notice',
      action: { label: 'Switch account', onClick: switchToCustomerAccount },
    });
  };

  const addToCartNow = async (item: AddToCartItem) => {
    try {
      await addItem(item.variantId, 1, {
        name: item.name,
        image: item.image,
        price: item.price,
        colorHex: item.colorHex,
        colorLabel: item.variantName,
      });
      showToast({
        title: `${item.name} added to cart`,
        subtitle: `${item.variantName} • ${formatPrice(item.price)}`,
        type: 'cart',
      });
    } catch (err) {
      // 403 here means the role guard turned it down, which for a signed-in
      // user only happens on an admin account. "Access denied" tells them
      // nothing they can act on.
      if (err instanceof ApiError && err.status === 403) {
        showAdminCannotShopToast();
        return;
      }
      showToast({
        title: 'Could not add to cart',
        subtitle: authErrorMessage(err),
        type: 'info',
      });
    }
  };

  const handleAddToCart = (item: AddToCartItem) => {
    if (!user) {
      openAuthModal(() => addToCartNow(item));
      return;
    }
    if (isAdmin) {
      showAdminCannotShopToast();
      return;
    }
    addToCartNow(item);
  };

  // The logo and every nav link point at a section of the home page. Scrolling
  // to an id only works while that page is mounted, so on /checkout, /orders or
  // /admin they silently did nothing - including the logo, leaving no way back
  // to the shop but the browser's back button. Go home first when we are not
  // already there, then scroll once it has rendered.
  const handleNavigate = (sectionId: string) => {
    if (location.pathname !== '/') {
      setPendingSection(sectionId);
      navigate('/');
      return;
    }
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!pendingSection || location.pathname !== '/') return;
    // One frame after the route renders, so the target exists to scroll to.
    const id = requestAnimationFrame(() => {
      document.getElementById(pendingSection)?.scrollIntoView({ behavior: 'smooth' });
      setPendingSection(null);
    });
    return () => cancelAnimationFrame(id);
  }, [pendingSection, location.pathname]);

  const handleAddReview = (newReview: Review) => {
    setReviewsList([newReview, ...reviewsList]);
    showToast({
      title: 'Review Published Successfully',
      subtitle: `Thank you for sharing your experience!`,
      type: 'success',
    });
  };

  return (
    <div className="min-h-screen bg-[#F7F2E8] text-[#0B1420] selection:bg-[#0B1420] selection:text-[#F7F2E8]">
      <ToastNotification toasts={toasts} onDismiss={dismissToast} onOpenCart={() => setIsCartOpen(true)} />

      {isAdmin && <AdminShoppingNotice onSwitchAccount={switchToCustomerAccount} />}

      <Navbar
        cartCount={itemCount}
        onOpenCart={() => setIsCartOpen(true)}
        currency={currency}
        onToggleCurrency={handleToggleCurrency}
        onNavigate={handleNavigate}
        user={user}
        onOpenAuth={() => openAuthModal()}
        onLogout={logout}
      />

      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              onAddToCart={handleAddToCart}
              onQuickView={setQuickViewProduct}
              currency={currency}
              formatPrice={formatPrice}
              reviewsList={reviewsList}
              onAddReview={handleAddReview}
            />
          }
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/checkout" element={<CheckoutPage formatPrice={formatPrice} />} />
        <Route path="/orders" element={<OrdersPage formatPrice={formatPrice} />} />
        <Route path="/orders/:orderId" element={<OrderDetailPage formatPrice={formatPrice} />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="products" element={<AdminProductsPage />} />
        </Route>
      </Routes>

      <Footer />

      <StickyQuickBar onAddToCart={handleAddToCart} formatPrice={formatPrice} />

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} currency={currency} formatPrice={formatPrice} />

      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={handleAddToCart}
        formatPrice={formatPrice}
      />

      <AuthModal />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ProductsProvider>
        <AuthModalProvider>
          <CartProvider>
            <AppShell />
          </CartProvider>
        </AuthModalProvider>
      </ProductsProvider>
    </AuthProvider>
  );
}
