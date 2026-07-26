import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApolloClient, useLazyQuery, useMutation } from '@apollo/client/react';
import { useDispatch } from 'react-redux';
import { type MeQueryResult } from '../hooks/useCurrentUser';
import { setUser } from '../features/auth/authSlice';
import { EmailMutation, ResendOtpMutation } from '../services/mutations'; // <-- adjust ResendOtpMutation's name if yours differs
import { ME_QUERY, CHECK_SIGNUP_STATUS } from '../services/queries'; // <-- add CHECK_SIGNUP_STATUS to queries.ts (see below)

const OTP_LENGTH = 6;
const RESEND_SECONDS = 10 * 60; // must match your backend's expiryOTP duration
const STORAGE_PREFIX = 'otp_expiry_';

interface CheckSignupStatusResult {
  checkSignupStatus: { exists: boolean; verified: boolean };
}

function Emailverification() {
  const navigate = useNavigate();
  const [verifyExcecute] = useMutation<any>(EmailMutation);
  const [resendExcecute, { loading: resending }] = useMutation<any>(ResendOtpMutation);
  const { useremail } = useParams();

  const [email, setEmail] = useState(useremail);
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const client = useApolloClient();
  const dispatch = useDispatch();

  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);

  // ---- Backend truth-check: is this email real and still unverified? ----
  // Deliberately independent of redux/`user` — that state can be stale
  // right after logout, and this route must not trust it.
  const [checkStatus, { data: statusData, loading: statusLoading, error: statusError }] =
    useLazyQuery<CheckSignupStatusResult>(CHECK_SIGNUP_STATUS, { fetchPolicy: 'network-only' });

  useEffect(() => {
    if (useremail) setEmail(useremail);
  }, [useremail]);

  useEffect(() => {
    if (email) checkStatus({ variables: { email } });
  }, [email]);

  useEffect(() => {
    if (!statusData) return;
    const { exists, verified } = statusData.checkSignupStatus;

    if (!exists) {
      // no account under this email — nothing to verify
      navigate('/signup', { replace: true });
      return;
    }
    if (verified) {
      // already verified (includes: just logged out from a verified
      // account) — this page has nothing to do here
      navigate('/login', { replace: true });
    }
  }, [statusData, navigate]);

  useEffect(() => {
    setTimeout(() => otpRefs.current[0]?.focus(), 0);
  }, []);

  const storageKey = `${STORAGE_PREFIX}${email ?? ''}`;

  // On mount: resume a timer already running (e.g. page refresh), or start
  // a fresh one — the OTP was just sent when SignUp routed the user here.
  useEffect(() => {
    if (!email) return;

    const stored = localStorage.getItem(storageKey);
    if (stored) {
      const remaining = Math.ceil((Number(stored) - Date.now()) / 1000);
      if (remaining > 0) {
        setSecondsLeft(remaining);
        return;
      }
      localStorage.removeItem(storageKey);
    }

    startTimer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email]);

  // Tick every second while the timer is running
  useEffect(() => {
    if (secondsLeft <= 0) return;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          localStorage.removeItem(storageKey);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [secondsLeft, storageKey]);

  const startTimer = () => {
    const expiry = Date.now() + RESEND_SECONDS * 1000;
    localStorage.setItem(storageKey, String(expiry));
    setSecondsLeft(RESEND_SECONDS);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  const composeCode = () => otp.join('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = composeCode();

    if (code.length !== OTP_LENGTH || !/^\d+$/.test(code)) {
      setError('Enter the complete numeric OTP');
      return;
    }
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const { data } = await verifyExcecute({
        variables: {
          email: email,
          otp: code,
        },
      });

      if (data) {
        // Auth cookie is now set by the server, fetch who we are and
        // store it in redux so Navbar/App update immediately.
        const meResult = await client.query<MeQueryResult>({ query: ME_QUERY, fetchPolicy: 'network-only' });
        if (meResult?.data?.getCurrentUser) {
          dispatch(setUser(meResult.data.getCurrentUser));
        }
      }

      alert(data?.emailVerified);
      setMessage(data?.emailVerified);
      localStorage.removeItem(storageKey);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setError('Enter email before resending');
      return;
    }
    if (secondsLeft > 0) return;

    setError(null);
    setMessage(null);

    try {
      const { data } = await resendExcecute({ variables: { email } });
      setMessage(data?.resendOtp || 'OTP resent! Please check your email.');
      startTimer();
      setOtp(Array(OTP_LENGTH).fill(''));
      otpRefs.current[0]?.focus();
    } catch (err: any) {
      setError(err?.message || 'Could not resend OTP');
    }
  };

  const handleOtpChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[index] = val.slice(-1);
    setOtp(next);
    if (val && index < OTP_LENGTH - 1) {
      otpRefs.current[index + 1]?.focus();
      otpRefs.current[index + 1]?.select();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prev = otpRefs.current[index - 1];
      prev?.focus();
      prev?.select();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      otpRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData('Text').trim().replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) return;
    const next = Array(OTP_LENGTH).fill('');
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    setOtp(next);
    const focusIndex = Math.min(pasted.length, OTP_LENGTH - 1);
    setTimeout(() => otpRefs.current[focusIndex]?.focus(), 0);
    e.preventDefault();
  };

  const containerStyle: React.CSSProperties = {
    maxWidth: 560,
    margin: '40px auto',
    padding: 28,
    borderRadius: 12,
    background: 'linear-gradient(rgb(175 136 255), rgb(251, 251, 255))',
    boxShadow: '0 6px 30px rgba(13,38,76,0.08)',
    border: '1px solid rgba(20,30,60,0.04)',
    fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial',
  };

  const otpBoxStyle: React.CSSProperties = {
    display: 'flex',
    gap: 12,
    justifyContent: 'center',
    marginTop: 18,
    marginBottom: 8,
  };

  const inputStyle: React.CSSProperties = {
    width: 56,
    height: 64,
    textAlign: 'center',
    fontSize: 22,
    borderRadius: 12,
    border: '1px solid #e6e9ef',
    transition: 'all .12s',
    background: 'rgb(126 121 138)',
    color: 'black',
    boxShadow: 'inset 0 -1px 0 rgba(0,0,0,0.05)',
  };

  const focusedStyle: React.CSSProperties = {
    borderColor: '#6c63ff',
    boxShadow: '0 8px 28px rgba(108,99,255,0.25)',
    transform: 'translateY(-2px)',
  };

  // ---- Guard states: don't show the OTP form until we know it's needed ----
  if (statusLoading || !statusData) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0f0f1a' }}>
        <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-purple-400" />
      </div>
    );
  }

  if (statusError) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0f0f1a' }}>
        <p className="text-red-400 font-semibold">Couldn't verify this page. Please try again.</p>
      </div>
    );
  }

  // At this point statusData.checkSignupStatus is either {exists:false} or
  // {exists:true, verified:true} — both already trigger a redirect in the
  // effect above. Render nothing while that redirect happens.
  if (!statusData.checkSignupStatus.exists || statusData.checkSignupStatus.verified) {
    return null;
  }

  return (
    <div style={containerStyle}>
      <h2 style={{ marginTop: '8px', color: 'Black', fontSize: '18px', fontWeight: '700' }}>Verify your email</h2>
      <p style={{ marginTop: '8px', color: 'Black', fontSize: '18px', fontWeight: '700' }}>
        Enter the {OTP_LENGTH}-digit code we sent to <strong>{email || 'your email'}</strong>
      </p>

      <form onSubmit={handleSubmit}>
        <div style={otpBoxStyle}>
          {Array.from({ length: OTP_LENGTH }).map((_, i) => (
            <input
              key={i}
              ref={(el) => {
                otpRefs.current[i] = el;
              }}
              value={otp[i]}
              onChange={(e) => handleOtpChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              onPaste={handlePaste}
              onFocus={(e) => {
                e.currentTarget.select();
                setFocusedIndex(i);
              }}
              onBlur={() => setFocusedIndex((prev) => (prev === i ? null : prev))}
              type="text"
              maxLength={1}
              aria-label={`Digit ${i + 1}`}
              style={{
                ...inputStyle,
                ...(focusedIndex === i ? focusedStyle : {}),
              }}
            />
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 }}>
          <div style={{ color: '#4b5563', fontSize: 14, fontWeight: 600 }}>
            {secondsLeft > 0 ? (
              <>
                Resend available in <span style={{ color: '#6c63ff' }}>{formatTime(secondsLeft)}</span>
              </>
            ) : (
              'Didn’t receive the code?'
            )}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="button"
              onClick={handleResend}
              disabled={resending || secondsLeft > 0}
              style={{
                padding: '10px 14px',
                borderRadius: 10,
                border: '1px solid #e6e9ef',
                background: secondsLeft > 0 ? '#2e6ece' : '#d45454',
                cursor: secondsLeft > 0 ? 'not-allowed' : 'pointer',
                opacity: secondsLeft > 0 ? 0.6 : 1,
              }}
            >
              {resending ? 'Sending...' : secondsLeft > 0 ? `Wait ${formatTime(secondsLeft)}` : 'Resend code'}
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '10px 18px',
                borderRadius: 10,
                border: 'none',
                background: '#6c63ff',
                color: '#fff',
                cursor: 'pointer',
                boxShadow: '0 6px 20px rgba(108,99,255,0.18)',
              }}
            >
              {loading ? 'Verifying...' : 'Verify'}
            </button>
          </div>
        </div>

        {message && <div style={{ color: 'green', marginTop: 16 }}>{message}</div>}
        {error && <div style={{ color: 'red', marginTop: 16 }}>{error}</div>}
      </form>
    </div>
  );
}

export default Emailverification;