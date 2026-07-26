import { Route, Routes, useLocation } from 'react-router-dom';
import './App.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Home from './component/Home';
import Login from './component/Login';
import Signup from './component/Signup';
import Blog from './component/Blog';
import BlogCreate from './component/BlogCreate';
import { useSelector } from 'react-redux';
import SpecificBlog from './component/SpecificBlog';
import useCurrentUser from './hooks/useCurrentUser';
import Navbar from './component/Navbar';
import Dashboard from './component/Dashboard';
import Emailverification from './component/Emailverification';
import UpdateBlog from './component/Update';
import Admin from './component/Admin';
import RequireAdmin from './component/Requireadmin';
import BanedUser from './component/BanedUser';

function AuthChecking() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="animate-spin rounded-full h-14 w-14 border-b-4 border-purple-400" />
    </div>
  );
}

function App() {
  const { loading: authChecking } = useCurrentUser();
  const { user }: any = useSelector<any>((state) => state.auth);

  const location = useLocation();
  const hideNavbar = ['/login', '/signup', '/Verification', '/Admin'];
  const showNavbar = !hideNavbar.includes(location.pathname);

  const isLoggedIn = !!user?._id;
  const isBanned = !!user?.Isbaned;
  const isVerified = !!user?.Status;

  // ---- Route element resolvers ------------------------------------------
  // Each category encodes one access rule so it isn't repeated (and
  // accidentally miscopied) on every <Route>.

  // Pages anyone can see (Home, Blogs list). If a *logged-in* user is
  // banned or unverified, they still get redirected to the right page —
  // but guests are never routed into the banned/verification screens.
  const publicElement = (Component: React.ComponentType) => {
    if (authChecking) return <AuthChecking />;
    if (!isLoggedIn) return <Component />;
    if (isBanned) return <BanedUser />;
    if (!isVerified) return <Emailverification />;
    return <Component />;
  };

  // Pages only a guest should see (Login, Signup). A fully-logged-in user
  // gets bounced to `loggedInElement` instead.
  const guestOnlyElement = (Component: React.ComponentType, loggedInElement: React.ReactNode) => {
    if (authChecking) return <AuthChecking />;
    if (!isLoggedIn) return <Component />;
    if (isBanned) return <BanedUser />;
    if (!isVerified) return <Emailverification />;
    return loggedInElement;
  };

  // Pages that require a full, verified, non-banned login (Dashboard,
  // Create Blog, Admin, etc). Guests are sent to Login.
  const protectedElement = (element: React.ReactNode) => {
    if (authChecking) return <AuthChecking />;
    if (!isLoggedIn) return <Login />;
    if (isBanned) return <BanedUser />;
    if (!isVerified) return <Emailverification />;
    return element;
  };

  return (
    <div>
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      {showNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={publicElement(Home)} />
        <Route path="/Blogs" element={publicElement(Blog)} />

        <Route path="/login" element={guestOnlyElement(Login, <Dashboard />)} />
        <Route path="/signup" element={guestOnlyElement(Signup, <BlogCreate />)} />

        {/* Reached mid-signup, before a cookie/session exists yet — so it
            intentionally doesn't require isLoggedIn. */}
        <Route
          path="/Verification/:useremail"
          element={
            authChecking ? (
              <AuthChecking />
            ) : isLoggedIn && !isBanned && isVerified ? (
              <Dashboard />
            ) : isBanned ? (
              <BanedUser />
            ) : (
              <Emailverification />
            )
          }
        />

        <Route path="/Blogs/:BlogId" element={protectedElement(<SpecificBlog />)} />
        <Route path="/Create-Blog" element={protectedElement(<BlogCreate />)} />
        <Route path="/dashboard" element={protectedElement(<Dashboard />)} />
        <Route path="/UpdateBlog/:BlogId" element={protectedElement(<UpdateBlog />)} />
        <Route
          path="/Admin"
          element={protectedElement(
            <RequireAdmin>
              <Admin />
            </RequireAdmin>
          )}
        />
      </Routes>
    </div>
  );
}

export default App;