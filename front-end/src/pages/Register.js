import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerAPI, storeAuthData } from '../utils/api';
import F1StartingLights from '../components/F1StartingLights';
import './Auth.css';

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    cin: '',
    password: '',
    password_confirmation: '',
  });
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate passwords match
    if (formData.password !== formData.password_confirmation) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    const result = await registerAPI(formData);

    if (!result.success) {
      setError(result.error || 'Registration failed');
      setLoading(false);
      return;
    }

    // Keep loader visible a bit longer for UX
    setTimeout(() => {
      storeAuthData(result.data.token, result.data.user);
      // Use backend-provided redirect URL
      const redirectUrl = result.data.redirect || '/dashboard';
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
        <div className="auth-card register-card">
          {/* Logo Section */}
          <div className="auth-header">
            <div className="f1-logo">🏁</div>
            <h1>F1 TANGER</h1>
            <p className="auth-subtitle">Create your racing account</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="auth-form">
            {error && <div className="error-message">{error}</div>}

            <div className="container-fluid p-0">
              <div className="row g-3">
                <div className="col-lg-6 col-md-12">
                  <div className="form-group">
                    <label htmlFor="name">Full Name</label>
                    <div className="input-wrapper">
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter your full name"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>

                <div className="col-lg-6 col-md-12">
                  <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <div className="input-wrapper">
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter your email"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>

                <div className="col-lg-6 col-md-12">
                  <div className="form-group">
                    <label htmlFor="phone">Phone Number</label>
                    <div className="input-wrapper">
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Enter your phone number"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>

                <div className="col-lg-6 col-md-12">
                  <div className="form-group">
                    <label htmlFor="cin">CIN / ID Number</label>
                    <div className="input-wrapper">
                      <input
                        type="text"
                        id="cin"
                        name="cin"
                        value={formData.cin}
                        onChange={handleChange}
                        placeholder="Enter your CIN or ID number"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>

                <div className="col-lg-6 col-md-12">
                  <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <div className="input-wrapper">
                      <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Create a password (min 8 characters)"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>

                <div className="col-lg-6 col-md-12">
                  <div className="form-group">
                    <label htmlFor="password_confirmation">Confirm Password</label>
                    <div className="input-wrapper">
                      <input
                        type="password"
                        id="password_confirmation"
                        name="password_confirmation"
                        value={formData.password_confirmation}
                        onChange={handleChange}
                        placeholder="Confirm your password"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="auth-button"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          {/* Footer */}
          <div className="auth-footer">
            <p>
              Already have an account?{' '}
              <Link to="/login" className="auth-link">
                Sign in here
              </Link>
            </p>
            <p className="terms">
              By registering, you agree to our{' '}
              <Link to="/terms" className="forgot-link">
                Terms & Conditions
              </Link>
            </p>
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

export default Register;
