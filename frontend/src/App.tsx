import React from 'react';
import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { theme } from './theme';
import MainLayout from './Components/WrapperComponents/MainLayout';
import CheckoutLayout from './Components/WrapperComponents/CheckoutLayout';
import Home from './Components/Pages/Home';
import Shop from './Components/Pages/Shop';
import ProductDetails from './Components/Pages/ProductDetails';
import Wishlist from './Components/Pages/Wishlist';
import Login from './Components/Pages/Login';
import Signup from './Components/Pages/Signup';
import OTPVerification from './Components/Pages/OTPVerification';
import OAuthCallback from './Components/Pages/OAuthCallback';
import Account from './Components/Pages/Account';
import ForgotPassword from './Components/Pages/ForgotPassword';
import ResetPassword from './Components/Pages/ResetPassword';
import Cart from './Components/SpecifiedComponents/Checkout/Cart';
import Shipping from './Components/SpecifiedComponents/Checkout/Shipping';
import Payment from './Components/SpecifiedComponents/Checkout/Payment';
import Wallet from './Components/Pages/Wallet';
import AdminDashboard from './Components/SpecifiedComponents/AdminDashboard';
import SmartAutoPay from './Components/Pages/SmartAutoPay';
import OutletHub from './Components/Pages/OutletHub';
import Rewards from './Components/Pages/Rewards';
import OrderHistory from './Components/Pages/Orderhistory';
import SeasonFestivalPage from './Components/Pages/SeasonFestivalPage';
import StyleStudio from './Components/SpecifiedComponents/Features/StyleStudio/StyleStudio';
import { CoBrowseProvider } from './Components/SpecifiedComponents/Features/CoBrowsing/CoBrowseContext';
import CoBrowseManager from './Components/SpecifiedComponents/Features/CoBrowsing/CoBrowseManager';
import CustomCursor from './Components/WrapperComponents/Common/CustomCursor';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { CheckoutProvider } from './context/CheckoutContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider as DynamicThemeProvider, useTheme } from './context/ThemeContext';
import { ScratchCardProvider } from './context/ScratchCardContext';
import { WalletProvider } from './context/WalletContext';
import { AutoPurchaseProvider } from './context/AutoPurchaseContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AetherLoader } from './Components/WrapperComponents/Common/AeatherLoader';

// Protected Route Component
const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <AetherLoader isLoading={true} onLoadingComplete={() => { }} />;
    }

    return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

// Public Route Component (redirects to account if already logged in)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated } = useAuth();
    return !isAuthenticated ? <>{children}</> : <Navigate to="/account" />;
};

const AppContent: React.FC = () => {
    const { currentTheme } = useTheme();
    const location = useLocation();
    const [isLoading, setIsLoading] = React.useState(true); // Initial loading state

    // No need for separate timer, loader handles completion
    // React.useEffect(() => {}, []); 

    // Scroll to top on route change
    React.useEffect(() => {
        window.scrollTo(0, 0);
    }, [location.pathname]);

    const authPaths = ['/login', '/signup', '/verify-otp', '/forgot-password', '/reset-password'];
    const hideCoBrowse = authPaths.some(path => location.pathname === path || location.pathname.startsWith(path + '/'));

    return (
        <Box sx={{
            minHeight: '100vh',
            background: currentTheme.backgroundGradient,
            transition: 'background 0.5s ease'
        }}>
            <AetherLoader isLoading={isLoading} onLoadingComplete={() => setIsLoading(false)} />
            <CustomCursor />
            {!hideCoBrowse && <CoBrowseManager />}
            <Routes>
                {/* Authentication Routes */}
                <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
                <Route path="/verify-otp" element={<OTPVerification />} />
                <Route path="/oauth/callback" element={<OAuthCallback />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />

                {/* Main Storefront Routes */}
                <Route path="/" element={<MainLayout />}>
                    <Route index element={<Home />} />
                    <Route path="shop" element={<Shop />} />
                    <Route path="product/:id" element={<ProductDetails />} />
                    <Route path="wishlist" element={<Wishlist />} />
                    <Route path="outlet" element={<OutletHub />} />
                    <Route path="rewards" element={<PrivateRoute><Rewards /></PrivateRoute>} />
                    <Route path="account/*" element={<PrivateRoute><Account /></PrivateRoute>} />
                    <Route path="account/orders" element={<PrivateRoute><OrderHistory /></PrivateRoute>} />
                    <Route path="wallet" element={<PrivateRoute><Wallet /></PrivateRoute>} />
                    <Route path="admin" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
                    <Route path="smart-autopay" element={<PrivateRoute><SmartAutoPay /></PrivateRoute>} />
                    <Route path="style-studio" element={<StyleStudio />} />
                    <Route path="season/:name" element={<SeasonFestivalPage type="season" />} />
                    <Route path="festival/:name" element={<SeasonFestivalPage type="festival" />} />
                </Route>

                {/* Secure Checkout Routes */}
                <Route path="/checkout" element={<CheckoutLayout />}>
                    <Route path="cart" element={<Cart />} />
                    <Route path="shipping" element={<Shipping />} />
                    <Route path="payment" element={<Payment />} />
                </Route>
            </Routes>
            <ToastContainer
                position="bottom-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="colored"
            />
        </Box>
    );
};

function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <AuthProvider>
                <WalletProvider>
                    <CartProvider>
                        <AutoPurchaseProvider>
                            <WishlistProvider>
                                <ScratchCardProvider>
                                    <CheckoutProvider>
                                        <CoBrowseProvider>
                                            <DynamicThemeProvider>
                                                <Router>
                                                    <AppContent />
                                                </Router>
                                            </DynamicThemeProvider>
                                        </CoBrowseProvider>
                                    </CheckoutProvider>
                                </ScratchCardProvider>
                            </WishlistProvider>
                        </AutoPurchaseProvider>
                    </CartProvider>
                </WalletProvider>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;
