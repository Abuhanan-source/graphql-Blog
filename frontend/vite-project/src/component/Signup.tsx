
import { useMutation } from '@apollo/client/react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { userSignup } from '../services/mutations';

function Signup() {
  

  const [submitSignup, { loading, error }] = useMutation(userSignup);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      await submitSignup({
        variables: {
          username: formData.username,
          email: formData.email,
          password: formData.password,
        },
      });

      navigate(`/Verification/${formData.email}`);
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen px-4 pt-24 py-10 sm:px-6 lg:px-8" style={{ background: 'var(--bg-color)' }}>
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-[36px] border border-white/6 bg-[rgba(255,255,255,0.02)] p-8 shadow-[0_30px_80px_rgba(2,6,23,0.6)] backdrop-blur-2xl sm:p-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-sm font-medium text-violet-700">
            <span className="text-base">✨</span>
            Join the community
          </div>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Open your account in a more beautiful way.
          </h1>
          <p className="mt-4 max-w-xl text-lg leading-8" style={{ color: 'var(--muted-color)' }}>
            Create a workspace that feels premium, calm, and effortlessly modern from the first step.
          </p>

          <div className="mt-8 space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
              <p className="text-sm font-semibold text-slate-900">Fast onboarding</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">A smooth and friendly signup that feels clear and effortless.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
              <p className="text-sm font-semibold text-slate-900">Premium experience</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">Rounded surfaces, refined spacing, and polished interactions throughout.</p>
            </div>
          </div>
        </section>

        <section className="rounded-[36px] border border-white/6 bg-[rgba(255,255,255,0.02)] p-8 shadow-[0_30px_80px_rgba(2,6,23,0.6)] backdrop-blur-2xl sm:p-10">
          <div className="mb-8 text-center lg:text-left">
            <p className="text-sm font-semibold uppercase tracking-[0.3em]" style={{ color: 'var(--accent-color)' }}>Signup</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">Create your account</h2>
            <p className="mt-2 text-sm leading-6" style={{ color: 'var(--muted-color)' }}>Start fresh with a refined experience and a space built for your goals.</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label htmlFor="username" className="block text-sm font-medium text-slate-700">Name</label>
              <input
                id="username"
                name="username"
                type="text"
                placeholder="Your full name"
                value={formData.username}
                onChange={handleChange}
                required
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900 shadow-sm transition focus:border-violet-400 focus:outline-none focus:ring-4 focus:ring-violet-100"
              />
            </div>

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
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900 shadow-sm transition focus:border-violet-400 focus:outline-none focus:ring-4 focus:ring-violet-100"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Create a strong password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900 shadow-sm transition focus:border-violet-400 focus:outline-none focus:ring-4 focus:ring-violet-100"
              />
            </div>

            <button
              type="submit"
              className="inline-flex w-full items-center justify-center rounded-2xl px-6 py-3 text-base font-semibold text-white shadow-lg transition"
              style={{ background: 'linear-gradient(90deg,var(--primary-color),var(--secondary-color))' }}
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>

            {error && <p className="text-sm font-medium text-rose-600">{error.message}</p>}
          </form>

          <div className="mt-6 text-center text-sm text-slate-600">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-violet-700 transition hover:text-violet-900">
              Log in
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Signup;
