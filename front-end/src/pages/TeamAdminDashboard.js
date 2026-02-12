import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import '../styles/AdminDashboard.css';

function TeamAdminDashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [activeSearch, setActiveSearch] = useState(searchParams.get('search') || '');
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page')) || 1);
  const [totalPages, setTotalPages] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTeamId, setEditingTeamId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingTeamId, setDeletingTeamId] = useState(null);
  const [deletingTeamName, setDeletingTeamName] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    country: '',
    base_location: '',
    team_principal: '',
    chassis: '',
    engine_supplier: '',
    founded_date: '',
    logo: null,
    email: '',
    password: '',
    total_points: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const hasFetched = useRef(false);

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchTeams(1, activeSearch);
    }
  }, []);

  useEffect(() => {
    fetchTeams(currentPage, activeSearch);
  }, [currentPage, activeSearch]);

  const fetchTeams = useCallback(async (page, search = '') => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

      let url = `${apiUrl}/teams/admin/paginated?page=${page}`;
      if (search.trim()) {
        url += `&search=${encodeURIComponent(search)}`;
      }

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to fetch teams');

      const data = await response.json();
      setTeams(data.data || []);
      setTotalPages(data.last_page || 1);
      
      // Reset to page 1 if search term changes
      if (search.trim() && currentPage !== 1) {
        setCurrentPage(1);
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  const handleSearch = (value) => {
    setSearchTerm(value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      const search = e.target.value;
      setActiveSearch(search);
      setCurrentPage(1);
      // Update URL with search query
      if (search.trim()) {
        navigate(`/admin/teams?search=${encodeURIComponent(search)}&page=1`);
      } else {
        navigate(`/admin/teams`);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    
    if (type === 'file') {
      setFormData(prev => ({
        ...prev,
        [name]: files[0] || null
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error for this field when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Team name is required';
    if (!formData.country.trim()) errors.country = 'Country is required';
    if (!formData.base_location.trim()) errors.base_location = 'Base location is required';
    if (!formData.team_principal.trim()) errors.team_principal = 'Team principal is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    if (!formData.password.trim()) errors.password = 'Password is required';
    if (!formData.logo) errors.logo = 'Logo image is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddTeam = async () => {
    if (!validateForm()) return;

    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('country', formData.country);
      formDataToSend.append('base_location', formData.base_location);
      formDataToSend.append('team_principal', formData.team_principal);
      formDataToSend.append('chassis', formData.chassis);
      formDataToSend.append('engine_supplier', formData.engine_supplier);
      formDataToSend.append('founded_date', formData.founded_date);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('password', formData.password);
      if (formData.logo) {
        formDataToSend.append('logo', formData.logo);
      }

      const response = await fetch(`${apiUrl}/admin/teams/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.errors ? JSON.stringify(errorData.errors) : 'Failed to add team');
      }

      // Reset form and close modal
      setFormData({
        name: '',
        country: '',
        base_location: '',
        team_principal: '',
        chassis: '',
        engine_supplier: '',
        founded_date: '',
        logo: null,
        email: '',
        password: ''
      });
      setFormErrors({});
      setShowAddModal(false);

      // Refresh teams list
      fetchTeams(1, activeSearch);
    } catch (error) {
      console.error('Error adding team:', error);
      setFormErrors({ submit: error.message });
    }
  };

  const closeModal = () => {
    setShowAddModal(false);
    setFormData({
      name: '',
      country: '',
      base_location: '',
      team_principal: '',
      chassis: '',
      engine_supplier: '',
      founded_date: '',
      logo: null,
      email: '',
      password: ''
    });
    setFormErrors({});
  };

  const openEditModal = async (teamId) => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

      const response = await fetch(`${apiUrl}/admin/teams/edit/${teamId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to fetch team');

      const data = await response.json();
      const team = data.team;

      setFormData({
        name: team.name || '',
        country: team.country || '',
        base_location: team.base_location || '',
        team_principal: team.team_principal || '',
        chassis: team.chassis || '',
        engine_supplier: team.engine_supplier || '',
        founded_date: team.founded_date ? team.founded_date.split('T')[0] : '',
        logo: null,
        email: '',
        password: '',
        total_points: team.total_points || ''
      });
      setEditingTeamId(teamId);
      setShowEditModal(true);
      setFormErrors({});
    } catch (error) {
      console.error('Error fetching team:', error);
      setFormErrors({ submit: error.message });
    }
  };

  const handleUpdateTeam = async () => {
    if (!formData.name.trim() || !formData.country.trim() || !formData.base_location.trim() || !formData.team_principal.trim()) {
      setFormErrors({
        name: formData.name.trim() ? '' : 'Team name is required',
        country: formData.country.trim() ? '' : 'Country is required',
        base_location: formData.base_location.trim() ? '' : 'Base location is required',
        team_principal: formData.team_principal.trim() ? '' : 'Team principal is required'
      });
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('country', formData.country);
      formDataToSend.append('base_location', formData.base_location);
      formDataToSend.append('team_principal', formData.team_principal);
      formDataToSend.append('chassis', formData.chassis);
      formDataToSend.append('engine_supplier', formData.engine_supplier);
      formDataToSend.append('founded_date', formData.founded_date);
      if (formData.total_points) {
        formDataToSend.append('total_points', formData.total_points);
      }
      if (formData.logo) {
        formDataToSend.append('logo', formData.logo);
      }
      if (formData.password) {
        formDataToSend.append('password', formData.password);
        formDataToSend.append('password_confirmation', formData.password);
      }

      const response = await fetch(`${apiUrl}/admin/teams/update/${editingTeamId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.errors ? JSON.stringify(errorData.errors) : 'Failed to update team');
      }

      // Reset and close modal
      setFormData({
        name: '',
        country: '',
        base_location: '',
        team_principal: '',
        chassis: '',
        engine_supplier: '',
        founded_date: '',
        logo: null,
        email: '',
        password: ''
      });
      setFormErrors({});
      setShowEditModal(false);
      setEditingTeamId(null);

      // Refresh teams list
      fetchTeams(currentPage, activeSearch);
    } catch (error) {
      console.error('Error updating team:', error);
      setFormErrors({ submit: error.message });
    }
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingTeamId(null);
    setFormData({
      name: '',
      country: '',
      base_location: '',
      team_principal: '',
      chassis: '',
      engine_supplier: '',
      founded_date: '',
      logo: null,
      email: '',
      password: '',
      total_points: ''
    });
    setFormErrors({});
  };

  const openDeleteConfirm = (teamId, teamName) => {
    setDeletingTeamId(teamId);
    setDeletingTeamName(teamName);
    setShowDeleteConfirm(true);
  };

  const closeDeleteConfirm = () => {
    setShowDeleteConfirm(false);
    setDeletingTeamId(null);
    setDeletingTeamName('');
  };

  const handleDeleteTeam = async () => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

      const response = await fetch(`${apiUrl}/admin/teams/delete/${deletingTeamId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete team');
      }

      // Close modal and refresh teams list
      setShowDeleteConfirm(false);
      setDeletingTeamId(null);
      setDeletingTeamName('');
      
      // Refresh teams list
      fetchTeams(currentPage, activeSearch);
    } catch (error) {
      console.error('Error deleting team:', error);
      alert('Error: ' + error.message);
    }
  };

  const filteredTeams = teams;

  if (loading) return (
    <div className="page-content">
      <div className="loader">
        <div className="f1-wheel"></div>
      </div>
    </div>
  );

  return (
    <div className="page-content">
      <div style={{ width: '100%' }}>
        <h2 style={{ marginBottom: '20px' }}>🏁 Team Management</h2>

        {/* Search Bar */}
        <div style={{
          marginBottom: '30px',
          display: 'flex',
          gap: '10px'
        }}>
          <input
            type="text"
            placeholder="Search teams... (Press Enter to search)"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            onKeyPress={handleKeyPress}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid rgba(232, 62, 140, 0.3)',
              background: 'rgba(15, 14, 30, 0.5)',
              color: '#fff',
              fontSize: '14px'
            }}
          />
          <button
            onClick={() => setShowAddModal(true)}
            style={{
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #e83e8c 0%, #c1316e 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              transition: 'all 0.3s ease'
            }}>
            + Add Team
          </button>
        </div>

        {/* Teams Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '20px'
        }}>
          {filteredTeams.length > 0 ? (
            filteredTeams.map((team) => (
              <div
                key={team.id}
                style={{
                  background: 'rgba(15, 14, 30, 0.6)',
                  border: '1px solid rgba(232, 62, 140, 0.2)',
                  borderRadius: '12px',
                  padding: '20px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  hover: {
                    background: 'rgba(232, 62, 140, 0.1)',
                    borderColor: 'rgba(232, 62, 140, 0.5)'
                  }
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(232, 62, 140, 0.1)';
                  e.currentTarget.style.borderColor = 'rgba(232, 62, 140, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(15, 14, 30, 0.6)';
                  e.currentTarget.style.borderColor = 'rgba(232, 62, 140, 0.2)';
                }}
              >
                <div style={{ marginBottom: '15px' }}>
                  <h3 style={{
                    color: '#e83e8c',
                    fontSize: '18px',
                    fontWeight: '600',
                    margin: '0 0 8px 0'
                  }}>
                    {team.name}
                  </h3>
                  <p style={{
                    color: '#7c8fa0',
                    fontSize: '13px',
                    margin: 0
                  }}>
                    Founded: {team.founded_date ? new Date(team.founded_date).getFullYear() : 'N/A'}
                  </p>
                </div>

                <div style={{
                  display: 'flex',
                  gap: '8px',
                  marginBottom: '15px'
                }}>
                  <span style={{
                    display: 'inline-block',
                    padding: '4px 10px',
                    background: 'rgba(232, 62, 140, 0.2)',
                    color: '#e83e8c',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}>
                    {team.drivers_count || 0} Drivers
                  </span>
                  <span style={{
                    display: 'inline-block',
                    padding: '4px 10px',
                    background: 'rgba(100, 200, 255, 0.2)',
                    color: '#64c8ff',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}>
                    {team.total_points || 0} Pts
                  </span>
                </div>

                <div style={{
                  display: 'flex',
                  gap: '10px'
                }}>
                  <button 
                    onClick={() => openEditModal(team.id)}
                    style={{
                      flex: 1,
                      padding: '8px',
                      background: 'rgba(232, 62, 140, 0.2)',
                      color: '#e83e8c',
                      border: '1px solid rgba(232, 62, 140, 0.3)',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '600',
                      transition: 'all 0.2s ease'
                    }}>
                    Edit
                  </button>
                  <button 
                    onClick={() => openDeleteConfirm(team.id, team.name)}
                    style={{
                      flex: 1,
                      padding: '8px',
                      background: 'rgba(255, 107, 107, 0.2)',
                      color: '#ff6b6b',
                      border: '1px solid rgba(255, 107, 107, 0.3)',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '600',
                      transition: 'all 0.2s ease'
                    }}>
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div style={{
              gridColumn: '1 / -1',
              textAlign: 'center',
              padding: '40px',
              color: '#7c8fa0'
            }}>
              <p>No teams found</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '10px',
          marginTop: '30px',
          alignItems: 'center'
        }}>
          <button
            onClick={() => {
              const newPage = Math.max(1, currentPage - 1);
              setCurrentPage(newPage);
              const query = activeSearch ? `?search=${encodeURIComponent(activeSearch)}&page=${newPage}` : `?page=${newPage}`;
              navigate(`/admin/teams${query}`);
            }}
            disabled={currentPage === 1}
            style={{
              padding: '10px 16px',
              background: currentPage === 1 ? 'rgba(232, 62, 140, 0.2)' : 'linear-gradient(135deg, #e83e8c 0%, #c1316e 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              opacity: currentPage === 1 ? 0.5 : 1,
              fontWeight: '600'
            }}
          >
            ← Previous
          </button>

          <div style={{
            display: 'flex',
            gap: '8px',
            alignItems: 'center'
          }}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => {
                  setCurrentPage(page);
                  const query = activeSearch ? `?search=${encodeURIComponent(activeSearch)}&page=${page}` : `?page=${page}`;
                  navigate(`/admin/teams${query}`);
                }}
                style={{
                  padding: '8px 12px',
                  background: currentPage === page ? 'linear-gradient(135deg, #e83e8c 0%, #c1316e 100%)' : 'rgba(232, 62, 140, 0.2)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '12px'
                }}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              const newPage = Math.min(totalPages, currentPage + 1);
              setCurrentPage(newPage);
              const query = activeSearch ? `?search=${encodeURIComponent(activeSearch)}&page=${newPage}` : `?page=${newPage}`;
              navigate(`/admin/teams${query}`);
            }}
            disabled={currentPage === totalPages}
            style={{
              padding: '10px 16px',
              background: currentPage === totalPages ? 'rgba(232, 62, 140, 0.2)' : 'linear-gradient(135deg, #e83e8c 0%, #c1316e 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              opacity: currentPage === totalPages ? 0.5 : 1,
              fontWeight: '600'
            }}
          >
            Next →
          </button>
        </div>

        {/* Add Team Modal */}
        {showAddModal && (
          <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}>
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content" style={{ backgroundColor: 'rgba(15, 14, 30, 0.95)', border: '1px solid rgba(232, 62, 140, 0.3)' }}>
                <div className="modal-header" style={{ borderBottom: '1px solid rgba(232, 62, 140, 0.3)' }}>
                  <h5 className="modal-title" style={{ color: '#e83e8c', fontWeight: '600', fontSize: '20px' }}>➕ Add New Team</h5>
                  <button 
                    type="button" 
                    className="btn-close" 
                    style={{ filter: 'invert(1)' }}
                    onClick={closeModal}
                  ></button>
                </div>
                <div className="modal-body" style={{ padding: '30px' }}>
                  {formErrors.submit && (
                    <div className="alert alert-danger" role="alert">
                      {formErrors.submit}
                    </div>
                  )}
                  
                  <div className="row g-4">
                    {/* Name */}
                    <div className="col-md-6">
                      <input
                        type="text"
                        className={`form-control form-control-lg ${formErrors.name ? 'is-invalid' : ''}`}
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Team Name"
                        style={{
                          backgroundColor: 'rgba(15, 14, 30, 0.5)',
                          borderColor: formErrors.name ? '#ff6b6b' : 'rgba(232, 62, 140, 0.3)',
                          color: '#fff',
                          fontSize: '15px'
                        }}
                      />
                      {formErrors.name && <div className="invalid-feedback d-block" style={{ color: '#ff6b6b', fontSize: '13px', marginTop: '5px' }}>{formErrors.name}</div>}
                    </div>

                    {/* Country */}
                    <div className="col-md-6">
                      <input
                        type="text"
                        className={`form-control form-control-lg ${formErrors.country ? 'is-invalid' : ''}`}
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        placeholder="Country"
                        style={{
                          backgroundColor: 'rgba(15, 14, 30, 0.5)',
                          borderColor: formErrors.country ? '#ff6b6b' : 'rgba(232, 62, 140, 0.3)',
                          color: '#fff',
                          fontSize: '15px'
                        }}
                      />
                      {formErrors.country && <div className="invalid-feedback d-block" style={{ color: '#ff6b6b', fontSize: '13px', marginTop: '5px' }}>{formErrors.country}</div>}
                    </div>

                    {/* Base Location */}
                    <div className="col-md-6">
                      <input
                        type="text"
                        className={`form-control form-control-lg ${formErrors.base_location ? 'is-invalid' : ''}`}
                        name="base_location"
                        value={formData.base_location}
                        onChange={handleInputChange}
                        placeholder="Base Location"
                        style={{
                          backgroundColor: 'rgba(15, 14, 30, 0.5)',
                          borderColor: formErrors.base_location ? '#ff6b6b' : 'rgba(232, 62, 140, 0.3)',
                          color: '#fff',
                          fontSize: '15px'
                        }}
                      />
                      {formErrors.base_location && <div className="invalid-feedback d-block" style={{ color: '#ff6b6b', fontSize: '13px', marginTop: '5px' }}>{formErrors.base_location}</div>}
                    </div>

                    {/* Team Principal */}
                    <div className="col-md-6">
                      <input
                        type="text"
                        className={`form-control form-control-lg ${formErrors.team_principal ? 'is-invalid' : ''}`}
                        name="team_principal"
                        value={formData.team_principal}
                        onChange={handleInputChange}
                        placeholder="Team Principal"
                        style={{
                          backgroundColor: 'rgba(15, 14, 30, 0.5)',
                          borderColor: formErrors.team_principal ? '#ff6b6b' : 'rgba(232, 62, 140, 0.3)',
                          color: '#fff',
                          fontSize: '15px'
                        }}
                      />
                      {formErrors.team_principal && <div className="invalid-feedback d-block" style={{ color: '#ff6b6b', fontSize: '13px', marginTop: '5px' }}>{formErrors.team_principal}</div>}
                    </div>

                    {/* Chassis */}
                    <div className="col-md-6">
                      <input
                        type="text"
                        className="form-control form-control-lg"
                        name="chassis"
                        value={formData.chassis}
                        onChange={handleInputChange}
                        placeholder="Chassis"
                        style={{
                          backgroundColor: 'rgba(15, 14, 30, 0.5)',
                          borderColor: 'rgba(232, 62, 140, 0.3)',
                          color: '#fff',
                          fontSize: '15px'
                        }}
                      />
                    </div>

                    {/* Engine Supplier */}
                    <div className="col-md-6">
                      <input
                        type="text"
                        className="form-control form-control-lg"
                        name="engine_supplier"
                        value={formData.engine_supplier}
                        onChange={handleInputChange}
                        placeholder="Engine Supplier"
                        style={{
                          backgroundColor: 'rgba(15, 14, 30, 0.5)',
                          borderColor: 'rgba(232, 62, 140, 0.3)',
                          color: '#fff',
                          fontSize: '15px'
                        }}
                      />
                    </div>

                    {/* Founded Date */}
                    <div className="col-md-6">
                      <input
                        type="date"
                        className="form-control form-control-lg"
                        name="founded_date"
                        value={formData.founded_date}
                        onChange={handleInputChange}
                        placeholder="Founded Date"
                        style={{
                          backgroundColor: 'rgba(15, 14, 30, 0.5)',
                          borderColor: 'rgba(232, 62, 140, 0.3)',
                          color: '#fff',
                          fontSize: '15px'
                        }}
                      />
                    </div>

                    {/* Logo Image */}
                    <div className="col-md-6">
                      <input
                        type="file"
                        className="form-control form-control-lg"
                        name="logo"
                        onChange={handleInputChange}
                        accept="image/*"
                        placeholder="Logo Image"
                        style={{
                          backgroundColor: 'rgba(15, 14, 30, 0.5)',
                          borderColor: formErrors.logo ? '#ff6b6b' : 'rgba(232, 62, 140, 0.3)',
                          color: '#fff',
                          fontSize: '15px'
                        }}
                      />
                      {formErrors.logo && <div className="invalid-feedback d-block" style={{ color: '#ff6b6b', fontSize: '13px', marginTop: '5px' }}>{formErrors.logo}</div>}
                    </div>

                    {/* Email */}
                    <div className="col-md-6">
                      <input
                        type="email"
                        className={`form-control form-control-lg ${formErrors.email ? 'is-invalid' : ''}`}
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Email"
                        style={{
                          backgroundColor: 'rgba(15, 14, 30, 0.5)',
                          borderColor: formErrors.email ? '#ff6b6b' : 'rgba(232, 62, 140, 0.3)',
                          color: '#fff',
                          fontSize: '15px'
                        }}
                      />
                      {formErrors.email && <div className="invalid-feedback d-block" style={{ color: '#ff6b6b', fontSize: '13px', marginTop: '5px' }}>{formErrors.email}</div>}
                    </div>

                    {/* Password */}
                    <div className="col-md-6">
                      <input
                        type="password"
                        className={`form-control form-control-lg ${formErrors.password ? 'is-invalid' : ''}`}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Password"
                        style={{
                          backgroundColor: 'rgba(15, 14, 30, 0.5)',
                          borderColor: formErrors.password ? '#ff6b6b' : 'rgba(232, 62, 140, 0.3)',
                          color: '#fff',
                          fontSize: '15px'
                        }}
                      />
                      {formErrors.password && <div className="invalid-feedback d-block" style={{ color: '#ff6b6b', fontSize: '13px', marginTop: '5px' }}>{formErrors.password}</div>}
                    </div>
                  </div>
                </div>
                <div className="modal-footer" style={{ borderTop: '1px solid rgba(232, 62, 140, 0.3)', padding: '20px 30px' }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-lg"
                    onClick={closeModal}
                    style={{
                      backgroundColor: 'rgba(232, 62, 140, 0.2)',
                      borderColor: 'rgba(232, 62, 140, 0.3)',
                      color: '#e83e8c',
                      fontWeight: '600',
                      fontSize: '15px',
                      paddingLeft: '30px',
                      paddingRight: '30px'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-lg"
                    onClick={handleAddTeam}
                    style={{
                      background: 'linear-gradient(135deg, #e83e8c 0%, #c1316e 100%)',
                      color: '#fff',
                      border: 'none',
                      fontWeight: '600',
                      fontSize: '15px',
                      paddingLeft: '30px',
                      paddingRight: '30px'
                    }}
                  >
                    Create Team
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Team Modal */}
        {showEditModal && (
          <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}>
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content" style={{ backgroundColor: 'rgba(15, 14, 30, 0.95)', border: '1px solid rgba(232, 62, 140, 0.3)' }}>
                <div className="modal-header" style={{ borderBottom: '1px solid rgba(232, 62, 140, 0.3)' }}>
                  <h5 className="modal-title" style={{ color: '#e83e8c', fontWeight: '600', fontSize: '20px' }}>✏️ Edit Team</h5>
                  <button 
                    type="button" 
                    className="btn-close" 
                    style={{ filter: 'invert(1)' }}
                    onClick={closeEditModal}
                  ></button>
                </div>
                <div className="modal-body" style={{ padding: '30px' }}>
                  {formErrors.submit && (
                    <div className="alert alert-danger" role="alert">
                      {formErrors.submit}
                    </div>
                  )}
                  
                  <div className="row g-4">
                    {/* Name */}
                    <div className="col-md-6">
                      <input
                        type="text"
                        className={`form-control form-control-lg ${formErrors.name ? 'is-invalid' : ''}`}
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Team Name"
                        style={{
                          backgroundColor: 'rgba(15, 14, 30, 0.5)',
                          borderColor: formErrors.name ? '#ff6b6b' : 'rgba(232, 62, 140, 0.3)',
                          color: '#fff',
                          fontSize: '15px'
                        }}
                      />
                      {formErrors.name && <div className="invalid-feedback d-block" style={{ color: '#ff6b6b', fontSize: '13px', marginTop: '5px' }}>{formErrors.name}</div>}
                    </div>

                    {/* Country */}
                    <div className="col-md-6">
                      <input
                        type="text"
                        className={`form-control form-control-lg ${formErrors.country ? 'is-invalid' : ''}`}
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        placeholder="Country"
                        style={{
                          backgroundColor: 'rgba(15, 14, 30, 0.5)',
                          borderColor: formErrors.country ? '#ff6b6b' : 'rgba(232, 62, 140, 0.3)',
                          color: '#fff',
                          fontSize: '15px'
                        }}
                      />
                      {formErrors.country && <div className="invalid-feedback d-block" style={{ color: '#ff6b6b', fontSize: '13px', marginTop: '5px' }}>{formErrors.country}</div>}
                    </div>

                    {/* Base Location */}
                    <div className="col-md-6">
                      <input
                        type="text"
                        className={`form-control form-control-lg ${formErrors.base_location ? 'is-invalid' : ''}`}
                        name="base_location"
                        value={formData.base_location}
                        onChange={handleInputChange}
                        placeholder="Base Location"
                        style={{
                          backgroundColor: 'rgba(15, 14, 30, 0.5)',
                          borderColor: formErrors.base_location ? '#ff6b6b' : 'rgba(232, 62, 140, 0.3)',
                          color: '#fff',
                          fontSize: '15px'
                        }}
                      />
                      {formErrors.base_location && <div className="invalid-feedback d-block" style={{ color: '#ff6b6b', fontSize: '13px', marginTop: '5px' }}>{formErrors.base_location}</div>}
                    </div>

                    {/* Team Principal */}
                    <div className="col-md-6">
                      <input
                        type="text"
                        className={`form-control form-control-lg ${formErrors.team_principal ? 'is-invalid' : ''}`}
                        name="team_principal"
                        value={formData.team_principal}
                        onChange={handleInputChange}
                        placeholder="Team Principal"
                        style={{
                          backgroundColor: 'rgba(15, 14, 30, 0.5)',
                          borderColor: formErrors.team_principal ? '#ff6b6b' : 'rgba(232, 62, 140, 0.3)',
                          color: '#fff',
                          fontSize: '15px'
                        }}
                      />
                      {formErrors.team_principal && <div className="invalid-feedback d-block" style={{ color: '#ff6b6b', fontSize: '13px', marginTop: '5px' }}>{formErrors.team_principal}</div>}
                    </div>

                    {/* Chassis */}
                    <div className="col-md-6">
                      <input
                        type="text"
                        className="form-control form-control-lg"
                        name="chassis"
                        value={formData.chassis}
                        onChange={handleInputChange}
                        placeholder="Chassis"
                        style={{
                          backgroundColor: 'rgba(15, 14, 30, 0.5)',
                          borderColor: 'rgba(232, 62, 140, 0.3)',
                          color: '#fff',
                          fontSize: '15px'
                        }}
                      />
                    </div>

                    {/* Engine Supplier */}
                    <div className="col-md-6">
                      <input
                        type="text"
                        className="form-control form-control-lg"
                        name="engine_supplier"
                        value={formData.engine_supplier}
                        onChange={handleInputChange}
                        placeholder="Engine Supplier"
                        style={{
                          backgroundColor: 'rgba(15, 14, 30, 0.5)',
                          borderColor: 'rgba(232, 62, 140, 0.3)',
                          color: '#fff',
                          fontSize: '15px'
                        }}
                      />
                    </div>

                    {/* Founded Date */}
                    <div className="col-md-6">
                      <input
                        type="date"
                        className="form-control form-control-lg"
                        name="founded_date"
                        value={formData.founded_date}
                        onChange={handleInputChange}
                        placeholder="Founded Date"
                        style={{
                          backgroundColor: 'rgba(15, 14, 30, 0.5)',
                          borderColor: 'rgba(232, 62, 140, 0.3)',
                          color: '#fff',
                          fontSize: '15px'
                        }}
                      />
                    </div>

                    {/* Total Points */}
                    <div className="col-md-6">
                      <input
                        type="number"
                        className="form-control form-control-lg"
                        name="total_points"
                        value={formData.total_points || ''}
                        onChange={handleInputChange}
                        placeholder="Total Points"
                        style={{
                          backgroundColor: 'rgba(15, 14, 30, 0.5)',
                          borderColor: 'rgba(232, 62, 140, 0.3)',
                          color: '#fff',
                          fontSize: '15px'
                        }}
                      />
                    </div>

                    {/* Logo Image */}
                    <div className="col-md-6">
                      <input
                        type="file"
                        className="form-control form-control-lg"
                        name="logo"
                        onChange={handleInputChange}
                        accept="image/*"
                        placeholder="Logo Image"
                        style={{
                          backgroundColor: 'rgba(15, 14, 30, 0.5)',
                          borderColor: 'rgba(232, 62, 140, 0.3)',
                          color: '#fff',
                          fontSize: '15px'
                        }}
                      />
                    </div>

                    {/* Password (Optional for edit) */}
                    <div className="col-md-6">
                      <input
                        type="password"
                        className="form-control form-control-lg"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="New Password (Leave empty to keep current)"
                        style={{
                          backgroundColor: 'rgba(15, 14, 30, 0.5)',
                          borderColor: 'rgba(232, 62, 140, 0.3)',
                          color: '#fff',
                          fontSize: '15px'
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer" style={{ borderTop: '1px solid rgba(232, 62, 140, 0.3)', padding: '20px 30px' }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-lg"
                    onClick={closeEditModal}
                    style={{
                      backgroundColor: 'rgba(232, 62, 140, 0.2)',
                      borderColor: 'rgba(232, 62, 140, 0.3)',
                      color: '#e83e8c',
                      fontWeight: '600',
                      fontSize: '15px',
                      paddingLeft: '30px',
                      paddingRight: '30px'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-lg"
                    onClick={handleUpdateTeam}
                    style={{
                      background: 'linear-gradient(135deg, #e83e8c 0%, #c1316e 100%)',
                      color: '#fff',
                      border: 'none',
                      fontWeight: '600',
                      fontSize: '15px',
                      paddingLeft: '30px',
                      paddingRight: '30px'
                    }}
                  >
                    Update Team
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content" style={{ backgroundColor: 'rgba(15, 14, 30, 0.95)', border: '1px solid rgba(255, 107, 107, 0.3)' }}>
                <div className="modal-header" style={{ borderBottom: '1px solid rgba(255, 107, 107, 0.3)' }}>
                  <h5 className="modal-title" style={{ color: '#ff6b6b', fontWeight: '600', fontSize: '20px' }}>⚠️ Delete Team</h5>
                  <button 
                    type="button" 
                    className="btn-close" 
                    style={{ filter: 'invert(1)' }}
                    onClick={closeDeleteConfirm}
                  ></button>
                </div>
                <div className="modal-body" style={{ padding: '30px' }}>
                  <p style={{
                    color: '#e0e0e0',
                    fontSize: '16px',
                    marginBottom: '15px',
                    lineHeight: '1.6'
                  }}>
                    Are you sure you want to delete <strong style={{ color: '#ff6b6b' }}>{deletingTeamName}</strong>?
                  </p>
                  <p style={{
                    color: '#ff6b6b',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}>
                    ⚠️ This action cannot be undone. The team and its associated user account will be permanently deleted.
                  </p>
                </div>
                <div className="modal-footer" style={{ borderTop: '1px solid rgba(255, 107, 107, 0.3)', padding: '20px 30px' }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-lg"
                    onClick={closeDeleteConfirm}
                    style={{
                      backgroundColor: 'rgba(255, 107, 107, 0.2)',
                      borderColor: 'rgba(255, 107, 107, 0.3)',
                      color: '#ff6b6b',
                      fontWeight: '600',
                      fontSize: '15px',
                      paddingLeft: '30px',
                      paddingRight: '30px'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-lg"
                    onClick={handleDeleteTeam}
                    style={{
                      background: 'linear-gradient(135deg, #ff6b6b 0%, #e63946 100%)',
                      color: '#fff',
                      border: 'none',
                      fontWeight: '600',
                      fontSize: '15px',
                      paddingLeft: '30px',
                      paddingRight: '30px'
                    }}
                  >
                    Delete Team
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <style>{`
          .form-control::placeholder {
            color: #999 !important;
            opacity: 1 !important;
          }
        `}</style>
      </div>
    </div>
  );
}

export default TeamAdminDashboard;
