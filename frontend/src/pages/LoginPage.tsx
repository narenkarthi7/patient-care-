import { FormEvent, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks';
import { clearAuthError, login } from '../store/authSlice';

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error, token } = useAppSelector((state) => state.auth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validation, setValidation] = useState('');

  if (token) return <Navigate to="/" replace />;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    dispatch(clearAuthError());
    if (!email.trim() || !password) {
      setValidation('Enter your email and password to continue.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setValidation('Enter a valid email address.');
      return;
    }
    setValidation('');
    try {
      await dispatch(login({ email: email.trim(), password })).unwrap();
      navigate('/', { replace: true });
    } catch {
      // The rejected action stores the API error in Redux.
    }
  }

  return (
    <main className="login-page">
      <section className="login-art">
        <div className="login-brand"><span className="brand-mark">+</span> careflow<span className="brand-dot">.</span></div>
        <div className="login-message">
          <span className="eyebrow light-eyebrow">A BETTER WAY TO CARE</span>
          <h1>Care that keeps<br />everything connected.</h1>
          <p>One calm place to manage patients, appointments, and billing — so your team can focus on what matters.</p>
        </div>
        <div className="art-footer"><span>✳</span> Thoughtful tools for thoughtful care.</div>
        <div className="art-circle circle-one" /><div className="art-circle circle-two" />
      </section>
      <section className="login-panel">
        <div className="login-card">
          <div className="mobile-login-brand"><span className="brand-mark">+</span> careflow<span className="brand-dot">.</span></div>
          <span className="eyebrow">WELCOME BACK</span>
          <h2>Sign in to your account</h2>
          <p className="login-subtitle">Enter your details below to access your workspace.</p>
          <form onSubmit={submit} className="login-form" noValidate>
            <label htmlFor="email">Email address</label>
            <input id="email" autoComplete="username" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@clinic.com" />
            <div className="password-label"><label htmlFor="password">Password</label></div>
            <input id="password" autoComplete="current-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" />
            {(validation || error) && <div className="alert alert-error" role="alert">{validation || error}</div>}
            <button type="submit" className="button button-primary login-submit" disabled={loading}>{loading ? 'Signing in…' : 'Sign in'} <span>→</span></button>
          </form>
          <p className="login-help">Need access? Contact your system administrator.</p>
        </div>
        <footer className="login-legal">© {new Date().getFullYear()} Careflow Health <span>Secure patient workspace</span></footer>
      </section>
    </main>
  );
}
