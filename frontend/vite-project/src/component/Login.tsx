
import { useMutation, useApolloClient } from '@apollo/client/react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUser } from '../features/auth/authSlice';
import { type MeQueryResult } from '../hooks/useCurrentUser';
import { LoginQl, ME_QUERY } from '../services/queries';

function Login() {
    

    const [submitLogin, { loading, error }] = useMutation(LoginQl);
    const client = useApolloClient();
    const dispatch = useDispatch();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const navigate = useNavigate();

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        try {
            const {data} = await submitLogin({
                variables: {
                email: formData.email,
                password: formData.password,
            },
        })

            if (data) {
                const meResult = await client.query<MeQueryResult>({ query: ME_QUERY, fetchPolicy: 'network-only' });
                if (meResult?.data?.getCurrentUser) {
                    dispatch(setUser(meResult.data.getCurrentUser));
                }
            }

            navigate('/');
        } catch (err: any) {
            alert(err.message);
        }
    };

  return (
    <div className="min-h-screen px-4 pt-24 py-10 sm:px-6 lg:px-8" style={{ background: 'var(--bg-color)' }}>
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="rounded-[36px] border border-white/6 bg-[rgba(255,255,255,0.02)] p-8 shadow-[0_30px_80px_rgba(2,6,23,0.6)] backdrop-blur-2xl sm:p-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-sm font-medium text-violet-700">
            <span className="text-base">🌟</span>
            Welcome back
          </div>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Sign in and continue your beautiful journey.
          </h1>
          <p className="mt-4 max-w-xl text-lg leading-8" style={{ color: 'var(--muted-color)' }}>
            A calm, premium experience designed to make your everyday tasks feel lighter and more inspiring.
          </p>

          <div className="mt-8 space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
              <p className="text-sm font-semibold text-slate-900">Personalized dashboard</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">Everything you need stays organized, elegant, and easy to find.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
              <p className="text-sm font-semibold text-slate-900">Secure access</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">Protected sign-in with a polished and reassuring flow.</p>
            </div>
          </div>
        </section>

        <section className="rounded-[36px] border border-white/6 bg-[rgba(255,255,255,0.02)] p-8 shadow-[0_30px_80px_rgba(2,6,23,0.6)] backdrop-blur-2xl sm:p-10">
          <div className="mb-8 text-center lg:text-left">
            <p className="text-sm font-semibold uppercase tracking-[0.3em]" style={{ color: 'var(--accent-color)' }}>Login</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">Sign in to your account</h2>
            <p className="mt-2 text-sm leading-6" style={{ color: 'var(--muted-color)' }}>Enter your details to jump back into your workspace.</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full rounded-2xl border bg-[rgba(255,255,255,0.02)] px-4 py-3 text-base text-white shadow-sm transition focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full rounded-2xl border bg-[rgba(255,255,255,0.02)] px-4 py-3 text-base text-white shadow-sm transition focus:outline-none"
              />
            </div>

            {error && <p className="text-sm font-medium text-rose-400">{error.message}</p>}

            <button
              type="submit"
              className="inline-flex w-full items-center justify-center rounded-2xl px-6 py-3 text-base font-semibold text-white shadow-lg transition"
              style={{ background: 'linear-gradient(90deg,var(--primary-color),var(--secondary-color))' }}
              disabled={loading}
            >
              Log in
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-600">
            Don&apos;t have an account?{' '}
            <Link to="/signup" className="font-semibold text-violet-700 transition hover:text-violet-900">
              Create one
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Login;
