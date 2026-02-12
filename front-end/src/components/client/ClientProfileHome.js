import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../utils/api';
import '../../styles/ClientDashboard.css';

function ClientProfileHome({ user, setUser }) {
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    cin: '',
  });

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
  });

  useEffect(() => {
    const fetchClientData = async () => {
      const res = await apiRequest('/client', 'GET');
      if (res.success) {
        setFormData((prev) => ({
          ...prev,
          phone: res.data.phone_nbr || '',
          cin: res.data.cin || '',
        }));
      }
    };

    fetchClientData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const res = await apiRequest('/client/profile', 'PUT', formData);

    if (res.success) {
      setUser((prev) => ({
        ...prev,
        ...res.data,
      }));
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError(res.error || 'Failed to update profile');
      setTimeout(() => setError(''), 3000);
    }
    setLoading(false);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const res = await apiRequest('/client/change-password', 'POST', passwordData);

    if (res.success) {
      setSuccess('Password changed successfully!');
      setPasswordData({ current_password: '', new_password: '', new_password_confirmation: '' });
      setShowPasswordForm(false);
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError(res.error || 'Failed to change password');
      setTimeout(() => setError(''), 3000);
    }
    setLoading(false);
  };

  return (
    <div className="dashboard-home">
      <div className="page-header">
        <h1>👤 My Profile</h1>
        <p>Manage your account information and security settings</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="profile-grid">
        {/* Profile Information Card */}
        <div className="profile-card">
          <div className="card-header">
            <h3>📋 Profile Information</h3>
            {!isEditing && (
              <button className="btn-primary" onClick={() => setIsEditing(true)}>
                Edit
              </button>
            )}
          </div>

          <div className="card-content">
            {!isEditing ? (
              <div className="profile-info">
                <div className="info-row">
                  <span className="info-label">Full Name</span>
                  <span className="info-value">{user?.name || 'N/A'}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Email</span>
                  <span className="info-value">{user?.email || 'N/A'}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Phone</span>
                  <span className="info-value">{formData.phone || 'N/A'}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">CIN/ID Number</span>
                  <span className="info-value">{formData.cin || 'N/A'}</span>
                </div>
              </div>
            ) : (
              <form onSubmit={handleProfileSubmit} className="profile-form">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label>CIN/ID Number</label>
                  <input
                    type="text"
                    name="cin"
                    value={formData.cin}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setIsEditing(false)}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Security Card */}
        <div className="profile-card">
          <div className="card-header">
            <h3>🔐 Security</h3>
            {!showPasswordForm && (
              <button className="btn-primary" onClick={() => setShowPasswordForm(true)}>
                Change Password
              </button>
            )}
          </div>

          <div className="card-content">
            {!showPasswordForm ? (
              <div className="security-info">
                <div className="info-row">
                  <span className="info-label">Password Status</span>
                  <span className="info-value status-active">✓ Active</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Last Updated</span>
                  <span className="info-value">Recently</span>
                </div>
              </div>
            ) : (
              <form onSubmit={handlePasswordSubmit} className="password-form">
                <div className="form-group">
                  <label>Current Password</label>
                  <input
                    type="password"
                    name="current_password"
                    value={passwordData.current_password}
                    onChange={handlePasswordChange}
                    placeholder="Enter current password"
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label>New Password</label>
                  <input
                    type="password"
                    name="new_password"
                    value={passwordData.new_password}
                    onChange={handlePasswordChange}
                    placeholder="Enter new password"
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label>Confirm New Password</label>
                  <input
                    type="password"
                    name="new_password_confirmation"
                    value={passwordData.new_password_confirmation}
                    onChange={handlePasswordChange}
                    placeholder="Confirm new password"
                    disabled={loading}
                  />
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? 'Updating...' : 'Update Password'}
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setShowPasswordForm(false)}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ClientProfileHome;
