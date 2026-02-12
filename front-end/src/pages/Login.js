import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginAPI, storeAuthData } from '../utils/api';
import F1StartingLights from '../components/F1StartingLights';
import './Auth.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Show loader briefly when page loads
    const timer = setTimeout(() => {
      setLoading(false);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await loginAPI(email, password);

    if (!result.success) {
      setError(result.error || 'Login failed');
      setLoading(false);
      return;
    }

    // Keep loader visible a bit longer for UX
    setTimeout(() => {
      storeAuthData(result.data.token, result.data.user);
      
      // Use backend-provided redirect URL (most reliable)
      let redirectUrl = result.data.redirect || '/dashboard';
      
      // Fallback: determine redirect based on user roles if backend doesn't provide redirect
      if (!result.data.redirect && result.data.user) {
        const user = result.data.user;
        if (user.roles && user.roles.length > 0) {
          const roles = user.roles.map(r => r.name?.toLowerCase());
          
          if (roles.includes('admin')) {
            redirectUrl = '/dashboard/admin';
          } else if (roles.includes('team')) {
            redirectUrl = '/dashboard/team';
          } else if (roles.includes('client')) {
            redirectUrl = '/dashboard/client';
          }
        }
      }
      
      navigate(redirectUrl);
    }, 1000);
  };

  return (
    <div className="auth-container">
      <F1StartingLights isLoading={loading} />
      <div className="auth-background">
        <video 
          className="video-background" 
          autoPlay 
          muted 
          loop 
          playsInline
        >
          <source src="/store/videos/bg-video.mp4" type="video/mp4" />
        </video>
        <div className="animated-gradient"></div>
      </div>

      <div className="auth-content">
        <div className="auth-card login-card">
          {/* Logo Section */}
          <div className="auth-header">
            <div className="f1-logo">🏁</div>
            <h1>F1 TANGER</h1>
            <p className="auth-subtitle">Sign in to your account</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="auth-form">
            {error && <div className="error-message">{error}</div>}

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-wrapper">
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="submit"
              className="auth-button"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Footer */}
          <div className="auth-footer">
            <p>
              Don't have an account?{' '}
              <Link to="/register" className="auth-link">
                Sign up now
              </Link>
            </p>
            <Link to="/forgot-password" className="forgot-link">
              Forgot password?
            </Link>
          </div>
        </div>

        {/* Side Decoration */}
        <div className="auth-decoration">
          <div className="racing-line"></div>
        </div>
      </div>
    </div>
  );
}

export default Login;
