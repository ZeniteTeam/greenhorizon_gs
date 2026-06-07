import { useState } from 'react';
import { Mail, Lock } from 'lucide-react';
import { Button } from '../../../components/Button';
import { Input } from '../../../components/Input';
import { Logo } from '../../../components/Logo';
import type { NavRoute } from '../../../types';

interface LoginScreenProps {
  navigate: (route: NavRoute) => void;
}

export function LoginScreen({ navigate }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    navigate('analysis');
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center"
      style={{ background: 'var(--surface-dark)', padding: '24px' }}
    >
      {/* Subtle radial glow behind card */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: '30%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 600,
          height: 600,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(25,123,39,0.18) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div className="gh-reveal" style={{ position: 'relative', width: '100%', maxWidth: 440 }}>
        {/* Logo */}
        <div className="flex justify-center" style={{ marginBottom: 28 }}>
          <Logo tone="onDark" size={26} />
        </div>

        {/* Card */}
        <div
          style={{
            background: 'var(--white)',
            borderRadius: 'var(--radius-lg)',
            padding: '40px',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          {/* Heading */}
          <div style={{ marginBottom: 28 }}>
            <h1
              className="mt-2"
              style={{
                fontFamily: 'var(--font-sans)',
                fontWeight: 'var(--fw-bold)',
                fontSize: 28,
                color: 'var(--green-900)',
                letterSpacing: 'var(--ls-tight)',
              }}
            >
              Acesse sua conta
            </h1>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="login-email"
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontWeight: 'var(--fw-medium)',
                  fontSize: 13,
                  color: 'var(--text-heading)',
                }}
              >
                E-mail
              </label>
              <Input
                id="login-email"
                type="email"
                placeholder="seu@email.com"
                icon={<Mail size={18} />}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="login-password"
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontWeight: 'var(--fw-medium)',
                    fontSize: 13,
                    color: 'var(--text-heading)',
                  }}
                >
                  Senha
                </label>
                <a
                  href="#"
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontWeight: 'var(--fw-medium)',
                    fontSize: 13,
                    color: 'var(--text-brand)',
                  }}
                >
                  Esqueci minha senha
                </a>
              </div>
              <Input
                id="login-password"
                type="password"
                placeholder="••••••••"
                icon={<Lock size={18} />}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              fullWidth
              style={{ marginTop: 4 }}
            >
              Entrar
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3" style={{ margin: '20px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
            <span
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 12,
                color: 'var(--text-muted)',
              }}
            >
              ou
            </span>
            <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
          </div>

          {/* Create account */}
          <Button variant="secondary" size="md" fullWidth>
            Criar uma conta
          </Button>
        </div>

        {/* Footer */}
        <p
          className="text-center"
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 12,
            color: 'rgba(255,255,255,0.40)',
            marginTop: 24,
          }}
        >
          © 2026 Green Horizon · Tecnologia de análise de solo acessível para todos
        </p>
      </div>
    </div>
  );
}

export default LoginScreen;
