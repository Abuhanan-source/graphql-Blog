import { useEffect, useState, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../features/auth/authSlice'
import { useApolloClient, useLazyQuery } from '@apollo/client/react'
import useDebounce from '../hooks/Usedebounce.ts'
import { LOGOUT_QUERY } from '../services/queries.ts'
import useWindowWidth from '../features/auth/useWindowWidth.ts'

function Navbar() {
  const user = useSelector((state: any) => state.auth?.user)
  const client = useApolloClient()
  const [logoutMutation] = useLazyQuery(LOGOUT_QUERY)
  const width = useWindowWidth()
  const isDesktop = width >= 908
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const mobileRef = useRef<HTMLDivElement | null>(null)
  const profileRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const handleDocClick = (e: MouseEvent) => {
      const target = e.target as Node
      if (mobileRef.current && !mobileRef.current.contains(target) && mobileOpen) setMobileOpen(false)
      if (profileRef.current && !profileRef.current.contains(target) && open) setOpen(false)
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setMobileOpen(false); setOpen(false) }
    }
    document.addEventListener('mousedown', handleDocClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleDocClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [mobileOpen, open])

  useEffect(() => {
    setMobileOpen(false)
    setOpen(false)
  }, [location.pathname])

  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearchTerm = useDebounce(searchTerm, 400)

  useEffect(() => {
    if (debouncedSearchTerm.trim() || location.pathname === '/Blogs') {
      const params = new URLSearchParams(debouncedSearchTerm ? { search: debouncedSearchTerm } : {})
      navigate({ pathname: '/Blogs', search: params.toString() }, { replace: location.pathname === '/Blogs' })
    }
  }, [debouncedSearchTerm])

  const handleLogout = async () => {
  try {
    await logoutMutation()
    dispatch(logout())
    await client.clearStore()
    navigate('/login', { replace: true })   // <-- replace: true add kiya
  } catch (error: any) {
    alert(error?.message)
  }
}

  return (
   <nav 
    ref={mobileRef}
      className="w-full fixed top-0 left-0 z-40"
      style={{
        background: 'linear-gradient(180deg, rgba(2,6,23,0.7), rgba(2,6,23,0.55))',
        backdropFilter: 'saturate(120%) blur(8px)',
        borderBottom: '1px solid rgba(255,255,255,0.04)'
      }}
   >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">

          {/* LEFT — Logo + Desktop Links */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-3">
              <div
                className="h-10 w-10 rounded-xl flex items-center justify-center text-white font-bold"
                style={{ background: 'linear-gradient(90deg,var(--primary-color),var(--secondary-color))' }}
              >
                G
              </div>
              <span className="font-semibold text-white text-lg">GraphBlog</span>
            </Link>

            {/* ✅ 908px se bada ho to show */}
            {isDesktop && (
              <div className="flex items-center gap-4">
                <Link to="/" className="text-slate-300 hover:text-white transition">Home</Link>
                <Link to="/Blogs" className="text-slate-300 hover:text-white transition">Blogs</Link>
                {user?._id && <Link to="/Create-Blog" className="text-slate-300 hover:text-white transition">Create Blogs</Link>}
                {user?._id && <Link to="/dashboard" className="text-slate-300 hover:text-white transition">Dashboard</Link>}
              </div>
            )}
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-4">

            {/* ✅ Search — 908px se bada ho to show */}
            {isDesktop && (
              <input
                aria-label="Search"
                placeholder="Search posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 py-2 rounded-full bg-slate-800/60 text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-400/30 w-48"
              />
            )}

            {/* Profile / Auth */}
            {user ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setOpen((s) => !s)}
                  className="flex items-center gap-3 rounded-full bg-slate-900/60 px-3 py-1 hover:shadow-lg transition"
                >
                  <img
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=6C5CE7&color=fff`}
                    alt="avatar"
                    className="h-9 w-9 rounded-full object-cover"
                  />
                  {isDesktop && (
                    <span className="text-slate-100 font-medium">{user.username}</span>
                  )}
                </button>

                {open && (
                  <div className="absolute right-0 mt-2 w-48 rounded-lg bg-slate-900/90 border border-slate-700/60 shadow-lg py-2 z-50">
                    <Link to="/dashboard" className="block px-4 py-2 text-sm text-slate-200 hover:bg-slate-800">Dashboard</Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-rose-400 hover:bg-slate-800"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button onClick={() => navigate('/login')} className="px-4 py-2 rounded-full border border-slate-700 text-slate-200 hover:bg-slate-800 transition">Login</button>
                <button
                  onClick={() => navigate('/signup')}
                  className="px-4 py-2 rounded-full text-white shadow"
                  style={{ background: 'linear-gradient(90deg,var(--primary-color),var(--secondary-color))' }}
                >
                  Signup
                </button>
              </div>
            )}

            {/* ✅ Hamburger — 908px se chota ho to show */}
            {!isDesktop && (
              <div>
                <button
                  onClick={() => setMobileOpen((s) => { setOpen(false); return !s })}
                  className="p-2 rounded-md text-slate-200 hover:bg-slate-800"
                >
                  {mobileOpen ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ✅ Mobile Menu */}
      {!isDesktop && mobileOpen && (
        <div
          className="px-4 pb-4 pt-2 border-t border-slate-700/40"
          style={{ background: 'rgba(2,6,23,0.95)', backdropFilter: 'blur(8px)' }}
        >
          {/* Mobile Search */}
          <div className="mb-3">
            <input
              placeholder="Search posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 rounded-full bg-slate-800/60 text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-400/30"
            />
          </div>

          <div className="flex flex-col gap-1">
            <Link to="/" className="block px-2 py-2 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition">Home</Link>
            <Link to="/Blogs" className="block px-2 py-2 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition">Blogs</Link>

            {user?._id ? (
              <>
                <Link to="/Create-Blog" className="block px-2 py-2 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition">Create Blogs</Link>
                <Link to="/dashboard" className="block px-2 py-2 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition">Dashboard</Link>
                <button
                  onClick={async () => { setMobileOpen(false); await handleLogout() }}
                  className="w-full text-left px-2 py-2 text-rose-400 hover:bg-slate-800/50 rounded-lg transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => { setMobileOpen(false); navigate('/login') }}
                  className="flex-1 px-4 py-2 rounded-full border border-slate-700 text-slate-200 hover:bg-slate-800 transition"
                >
                  Login
                </button>
                <button
                  onClick={() => { setMobileOpen(false); navigate('/signup') }}
                  className="flex-1 px-4 py-2 rounded-full text-white shadow"
                  style={{ background: 'linear-gradient(90deg,var(--primary-color),var(--secondary-color))' }}
                >
                  Signup
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar