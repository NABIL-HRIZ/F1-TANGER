import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import '../styles/AdminDashboard.css';

function DriverAdminDashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [drivers, setDrivers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [activeSearch, setActiveSearch] = useState(searchParams.get('search') || '');
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page')) || 1);
  const [totalPages, setTotalPages] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingDriverId, setEditingDriverId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingDriverId, setDeletingDriverId] = useState(null);
  const [deletingDriverName, setDeletingDriverName] = useState('');
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    nationality: '',
    date_of_birth: '',
    team_id: '',
    total_points: '',
    driver_img: null
  });
  const [formErrors, setFormErrors] = useState({});
  const hasFetched = useRef(false);

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchTeams();
      fetchDrivers(1, activeSearch);
    }
  }, []);

  useEffect(() => {
    fetchDrivers(currentPage, activeSearch);
  }, [currentPage, activeSearch]);

  const fetchTeams = async () => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

      const response = await fetch(`${apiUrl}/teams`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to fetch teams');

      const data = await response.json();
      setTeams(data.data || []);
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  };

  const fetchDrivers = useCallback(async (page, search = '') => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

      let url = `${apiUrl}/drivers?page=${page}`;
      if (search.trim()) {
        url += `&search=${encodeURIComponent(search)}`;
      }

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to fetch drivers');

      const data = await response.json();
      setDrivers(data.data || []);
      setTotalPages(data.last_page || 1);

      if (search.trim() && currentPage !== 1) {
        setCurrentPage(1);
      }
    } catch (error) {
      console.error('Error fetching drivers:', error);
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
      if (search.trim()) {
        navigate(`/admin/drivers?search=${encodeURIComponent(search)}&page=1`);
      } else {
        navigate(`/admin/drivers`);
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

    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.first_name.trim()) errors.first_name = 'First name is required';
    if (!formData.last_name.trim()) errors.last_name = 'Last name is required';
    if (!formData.nationality.trim()) errors.nationality = 'Nationality is required';
    if (!formData.date_of_birth.trim()) errors.date_of_birth = 'Date of birth is required';
    if (!formData.team_id) errors.team_id = 'Team is required';
    if (!formData.driver_img) errors.driver_img = 'Driver image is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddDriver = async () => {
    if (!validateForm()) return;

    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

      const formDataToSend = new FormData();
      formDataToSend.append('first_name', formData.first_name);
      formDataToSend.append('last_name', formData.last_name);
      formDataToSend.append('nationality', formData.nationality);
      formDataToSend.append('date_of_birth', formData.date_of_birth);
      formDataToSend.append('team_id', formData.team_id);
      formDataToSend.append('total_points', formData.total_points || 0);
      if (formData.driver_img) {
        formDataToSend.append('driver_img', formData.driver_img);
      }

      const response = await fetch(`${apiUrl}/admin/drivers/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add driver');
      }

      setFormData({
        first_name: '',
        last_name: '',
        nationality: '',
        date_of_birth: '',
        team_id: '',
        total_points: '',
        driver_img: null
      });
      setFormErrors({});
      setShowAddModal(false);
      fetchDrivers(1, activeSearch);
    } catch (error) {
      console.error('Error adding driver:', error);
      setFormErrors({ submit: error.message });
    }
  };

  const closeModal = () => {
    setShowAddModal(false);
    setFormData({
      first_name: '',
      last_name: '',
      nationality: '',
      date_of_birth: '',
      team_id: '',
      total_points: '',
      driver_img: null
    });
    setFormErrors({});
  };

  const openEditModal = async (driverId) => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

      const response = await fetch(`${apiUrl}/admin/drivers/edit/${driverId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to fetch driver');

      const data = await response.json();
      const driver = data.driver;

      setFormData({
        first_name: driver.first_name || '',
        last_name: driver.last_name || '',
        nationality: driver.nationality || '',
        date_of_birth: driver.date_of_birth ? driver.date_of_birth.split('T')[0] : '',
        team_id: driver.team_id || '',
        total_points: driver.total_points || '',
        driver_img: null
      });
      setEditingDriverId(driverId);
      setShowEditModal(true);
      setFormErrors({});
    } catch (error) {
      console.error('Error fetching driver:', error);
      setFormErrors({ submit: error.message });
    }
  };

  const handleUpdateDriver = async () => {
    if (!formData.first_name.trim() || !formData.last_name.trim() || !formData.nationality.trim() || !formData.date_of_birth.trim() || !formData.team_id) {
      setFormErrors({
        first_name: formData.first_name.trim() ? '' : 'First name is required',
        last_name: formData.last_name.trim() ? '' : 'Last name is required',
        nationality: formData.nationality.trim() ? '' : 'Nationality is required',
        date_of_birth: formData.date_of_birth.trim() ? '' : 'Date of birth is required',
        team_id: formData.team_id ? '' : 'Team is required'
      });
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

      const formDataToSend = new FormData();
      formDataToSend.append('first_name', formData.first_name);
      formDataToSend.append('last_name', formData.last_name);
      formDataToSend.append('nationality', formData.nationality);
      formDataToSend.append('date_of_birth', formData.date_of_birth);
      formDataToSend.append('team_id', formData.team_id);
      formDataToSend.append('total_points', formData.total_points || 0);
      if (formData.driver_img) {
        formDataToSend.append('driver_img', formData.driver_img);
      }

      const response = await fetch(`${apiUrl}/admin/drivers/update/${editingDriverId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update driver');
      }

      setFormData({
        first_name: '',
        last_name: '',
        nationality: '',
        date_of_birth: '',
        team_id: '',
        total_points: '',
        driver_img: null
      });
      setFormErrors({});
      setShowEditModal(false);
      setEditingDriverId(null);
      fetchDrivers(currentPage, activeSearch);
    } catch (error) {
      console.error('Error updating driver:', error);
      setFormErrors({ submit: error.message });
    }
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingDriverId(null);
    setFormData({
      first_name: '',
      last_name: '',
      nationality: '',
      date_of_birth: '',
      team_id: '',
      total_points: '',
      driver_img: null
    });
    setFormErrors({});
  };

  const openDeleteConfirm = (driverId, firstName, lastName) => {
    setDeletingDriverId(driverId);
    setDeletingDriverName(`${firstName} ${lastName}`);
    setShowDeleteConfirm(true);
  };

  const closeDeleteConfirm = () => {
    setShowDeleteConfirm(false);
    setDeletingDriverId(null);
    setDeletingDriverName('');
  };

  const handleDeleteDriver = async () => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

      const response = await fetch(`${apiUrl}/admin/drivers/delete/${deletingDriverId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete driver');
      }

      setShowDeleteConfirm(false);
      setDeletingDriverId(null);
      setDeletingDriverName('');
      fetchDrivers(currentPage, activeSearch);
    } catch (error) {
      console.error('Error deleting driver:', error);
      alert('Error: ' + error.message);
    }
  };

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
        <h2 style={{ marginBottom: '20px' }}>🏎️ Drivers Management</h2>

        {/* Search Bar */}
        <div style={{
          marginBottom: '30px',
          display: 'flex',
          gap: '10px'
        }}>
          <input
            type="text"
            placeholder="Search drivers... (Press Enter to search)"
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
            + Add Driver
          </button>
        </div>

        {/* Drivers Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '20px'
        }}>
          {drivers.length > 0 ? (
            drivers.map((driver) => (
              <div
                key={driver.id}
                style={{
                  background: 'rgba(15, 14, 30, 0.6)',
                  border: '1px solid rgba(232, 62, 140, 0.2)',
                  borderRadius: '12px',
                  padding: '20px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
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
                {/* Driver Image */}
                <div style={{
                  width: '100%',
                  height: '150px',
                  backgroundColor: 'rgba(232, 62, 140, 0.2)',
                  borderRadius: '8px',
                  marginBottom: '15px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden'
                }}>
                  {driver.driver_img ? (
                    <img
                      src={`http://localhost:8000/${driver.driver_img}`}
                      alt={`${driver.first_name} ${driver.last_name}`}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  ) : (
                    <span style={{ color: '#999', fontSize: '12px' }}>No Image</span>
                  )}
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <h3 style={{
                    color: '#e83e8c',
                    fontSize: '18px',
                    fontWeight: '600',
                    margin: '0 0 8px 0'
                  }}>
                    {driver.first_name} {driver.last_name}
                  </h3>
                  <p style={{
                    color: '#7c8fa0',
                    fontSize: '13px',
                    margin: '0 0 5px 0'
                  }}>
                    🌍 {driver.nationality}
                  </p>
                  <p style={{
                    color: '#7c8fa0',
                    fontSize: '13px',
                    margin: 0
                  }}>
                    🏁 {driver.team?.name || 'No Team'}
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
                    background: 'rgba(100, 200, 255, 0.2)',
                    color: '#64c8ff',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}>
                    {driver.total_points || 0} Pts
                  </span>
                </div>

                <div style={{
                  display: 'flex',
                  gap: '10px'
                }}>
                  <button
                    onClick={() => openEditModal(driver.id)}
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
                    onClick={() => openDeleteConfirm(driver.id, driver.first_name, driver.last_name)}
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
              <p>No drivers found</p>
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
              navigate(`/admin/drivers${query}`);
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
                  navigate(`/admin/drivers${query}`);
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
              navigate(`/admin/drivers${query}`);
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

        {/* Add Driver Modal */}
        {showAddModal && (
          <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}>
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content" style={{ backgroundColor: 'rgba(15, 14, 30, 0.95)', border: '1px solid rgba(232, 62, 140, 0.3)' }}>
                <div className="modal-header" style={{ borderBottom: '1px solid rgba(232, 62, 140, 0.3)' }}>
                  <h5 className="modal-title" style={{ color: '#e83e8c', fontWeight: '600', fontSize: '20px' }}>➕ Add New Driver</h5>
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
                    {/* First Name */}
                    <div className="col-md-6">
                      <input
                        type="text"
                        className={`form-control form-control-lg ${formErrors.first_name ? 'is-invalid' : ''}`}
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleInputChange}
                        placeholder="First Name"
                        style={{
                          backgroundColor: 'rgba(15, 14, 30, 0.5)',
                          borderColor: formErrors.first_name ? '#ff6b6b' : 'rgba(232, 62, 140, 0.3)',
                          color: '#fff',
                          fontSize: '15px'
                        }}
                      />
                      {formErrors.first_name && <div className="invalid-feedback d-block" style={{ color: '#ff6b6b', fontSize: '13px', marginTop: '5px' }}>{formErrors.first_name}</div>}
                    </div>

                    {/* Last Name */}
                    <div className="col-md-6">
                      <input
                        type="text"
                        className={`form-control form-control-lg ${formErrors.last_name ? 'is-invalid' : ''}`}
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleInputChange}
                        placeholder="Last Name"
                        style={{
                          backgroundColor: 'rgba(15, 14, 30, 0.5)',
                          borderColor: formErrors.last_name ? '#ff6b6b' : 'rgba(232, 62, 140, 0.3)',
                          color: '#fff',
                          fontSize: '15px'
                        }}
                      />
                      {formErrors.last_name && <div className="invalid-feedback d-block" style={{ color: '#ff6b6b', fontSize: '13px', marginTop: '5px' }}>{formErrors.last_name}</div>}
                    </div>

                    {/* Nationality */}
                    <div className="col-md-6">
                      <input
                        type="text"
                        className={`form-control form-control-lg ${formErrors.nationality ? 'is-invalid' : ''}`}
                        name="nationality"
                        value={formData.nationality}
                        onChange={handleInputChange}
                        placeholder="Nationality"
                        style={{
                          backgroundColor: 'rgba(15, 14, 30, 0.5)',
                          borderColor: formErrors.nationality ? '#ff6b6b' : 'rgba(232, 62, 140, 0.3)',
                          color: '#fff',
                          fontSize: '15px'
                        }}
                      />
                      {formErrors.nationality && <div className="invalid-feedback d-block" style={{ color: '#ff6b6b', fontSize: '13px', marginTop: '5px' }}>{formErrors.nationality}</div>}
                    </div>

                    {/* Date of Birth */}
                    <div className="col-md-6">
                      <input
                        type="date"
                        className={`form-control form-control-lg ${formErrors.date_of_birth ? 'is-invalid' : ''}`}
                        name="date_of_birth"
                        value={formData.date_of_birth}
                        onChange={handleInputChange}
                        style={{
                          backgroundColor: 'rgba(15, 14, 30, 0.5)',
                          borderColor: formErrors.date_of_birth ? '#ff6b6b' : 'rgba(232, 62, 140, 0.3)',
                          color: '#fff',
                          fontSize: '15px'
                        }}
                      />
                      {formErrors.date_of_birth && <div className="invalid-feedback d-block" style={{ color: '#ff6b6b', fontSize: '13px', marginTop: '5px' }}>{formErrors.date_of_birth}</div>}
                    </div>

                    {/* Team */}
                    <div className="col-md-6">
                      <select
                        className={`form-control form-control-lg ${formErrors.team_id ? 'is-invalid' : ''}`}
                        name="team_id"
                        value={formData.team_id}
                        onChange={handleInputChange}
                        style={{
                          backgroundColor: 'rgba(15, 14, 30, 0.5)',
                          borderColor: formErrors.team_id ? '#ff6b6b' : 'rgba(232, 62, 140, 0.3)',
                          color: '#fff',
                          fontSize: '15px'
                        }}
                      >
                        <option value="">Select Team</option>
                        {teams.map(team => (
                          <option key={team.id} value={team.id}>{team.name}</option>
                        ))}
                      </select>
                      {formErrors.team_id && <div className="invalid-feedback d-block" style={{ color: '#ff6b6b', fontSize: '13px', marginTop: '5px' }}>{formErrors.team_id}</div>}
                    </div>

                    {/* Total Points */}
                    <div className="col-md-6">
                      <input
                        type="number"
                        className="form-control form-control-lg"
                        name="total_points"
                        value={formData.total_points}
                        onChange={handleInputChange}
                        placeholder="Total Points (Optional)"
                        style={{
                          backgroundColor: 'rgba(15, 14, 30, 0.5)',
                          borderColor: 'rgba(232, 62, 140, 0.3)',
                          color: '#fff',
                          fontSize: '15px'
                        }}
                      />
                    </div>

                    {/* Driver Image */}
                    <div className="col-md-6">
                      <input
                        type="file"
                        className={`form-control form-control-lg ${formErrors.driver_img ? 'is-invalid' : ''}`}
                        name="driver_img"
                        onChange={handleInputChange}
                        accept="image/*"
                        style={{
                          backgroundColor: 'rgba(15, 14, 30, 0.5)',
                          borderColor: formErrors.driver_img ? '#ff6b6b' : 'rgba(232, 62, 140, 0.3)',
                          color: '#fff',
                          fontSize: '15px'
                        }}
                      />
                      {formErrors.driver_img && <div className="invalid-feedback d-block" style={{ color: '#ff6b6b', fontSize: '13px', marginTop: '5px' }}>{formErrors.driver_img}</div>}
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
                    onClick={handleAddDriver}
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
                    Create Driver
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Driver Modal */}
        {showEditModal && (
          <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}>
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content" style={{ backgroundColor: 'rgba(15, 14, 30, 0.95)', border: '1px solid rgba(232, 62, 140, 0.3)' }}>
                <div className="modal-header" style={{ borderBottom: '1px solid rgba(232, 62, 140, 0.3)' }}>
                  <h5 className="modal-title" style={{ color: '#e83e8c', fontWeight: '600', fontSize: '20px' }}>✏️ Edit Driver</h5>
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
                    {/* First Name */}
                    <div className="col-md-6">
                      <input
                        type="text"
                        className={`form-control form-control-lg ${formErrors.first_name ? 'is-invalid' : ''}`}
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleInputChange}
                        placeholder="First Name"
                        style={{
                          backgroundColor: 'rgba(15, 14, 30, 0.5)',
                          borderColor: formErrors.first_name ? '#ff6b6b' : 'rgba(232, 62, 140, 0.3)',
                          color: '#fff',
                          fontSize: '15px'
                        }}
                      />
                      {formErrors.first_name && <div className="invalid-feedback d-block" style={{ color: '#ff6b6b', fontSize: '13px', marginTop: '5px' }}>{formErrors.first_name}</div>}
                    </div>

                    {/* Last Name */}
                    <div className="col-md-6">
                      <input
                        type="text"
                        className={`form-control form-control-lg ${formErrors.last_name ? 'is-invalid' : ''}`}
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleInputChange}
                        placeholder="Last Name"
                        style={{
                          backgroundColor: 'rgba(15, 14, 30, 0.5)',
                          borderColor: formErrors.last_name ? '#ff6b6b' : 'rgba(232, 62, 140, 0.3)',
                          color: '#fff',
                          fontSize: '15px'
                        }}
                      />
                      {formErrors.last_name && <div className="invalid-feedback d-block" style={{ color: '#ff6b6b', fontSize: '13px', marginTop: '5px' }}>{formErrors.last_name}</div>}
                    </div>

                    {/* Nationality */}
                    <div className="col-md-6">
                      <input
                        type="text"
                        className={`form-control form-control-lg ${formErrors.nationality ? 'is-invalid' : ''}`}
                        name="nationality"
                        value={formData.nationality}
                        onChange={handleInputChange}
                        placeholder="Nationality"
                        style={{
                          backgroundColor: 'rgba(15, 14, 30, 0.5)',
                          borderColor: formErrors.nationality ? '#ff6b6b' : 'rgba(232, 62, 140, 0.3)',
                          color: '#fff',
                          fontSize: '15px'
                        }}
                      />
                      {formErrors.nationality && <div className="invalid-feedback d-block" style={{ color: '#ff6b6b', fontSize: '13px', marginTop: '5px' }}>{formErrors.nationality}</div>}
                    </div>

                    {/* Date of Birth */}
                    <div className="col-md-6">
                      <input
                        type="date"
                        className={`form-control form-control-lg ${formErrors.date_of_birth ? 'is-invalid' : ''}`}
                        name="date_of_birth"
                        value={formData.date_of_birth}
                        onChange={handleInputChange}
                        style={{
                          backgroundColor: 'rgba(15, 14, 30, 0.5)',
                          borderColor: formErrors.date_of_birth ? '#ff6b6b' : 'rgba(232, 62, 140, 0.3)',
                          color: '#fff',
                          fontSize: '15px'
                        }}
                      />
                      {formErrors.date_of_birth && <div className="invalid-feedback d-block" style={{ color: '#ff6b6b', fontSize: '13px', marginTop: '5px' }}>{formErrors.date_of_birth}</div>}
                    </div>

                    {/* Team */}
                    <div className="col-md-6">
                      <select
                        className={`form-control form-control-lg ${formErrors.team_id ? 'is-invalid' : ''}`}
                        name="team_id"
                        value={formData.team_id}
                        onChange={handleInputChange}
                        style={{
                          backgroundColor: 'rgba(15, 14, 30, 0.5)',
                          borderColor: formErrors.team_id ? '#ff6b6b' : 'rgba(232, 62, 140, 0.3)',
                          color: '#fff',
                          fontSize: '15px'
                        }}
                      >
                        <option value="">Select Team</option>
                        {teams.map(team => (
                          <option key={team.id} value={team.id}>{team.name}</option>
                        ))}
                      </select>
                      {formErrors.team_id && <div className="invalid-feedback d-block" style={{ color: '#ff6b6b', fontSize: '13px', marginTop: '5px' }}>{formErrors.team_id}</div>}
                    </div>

                    {/* Total Points */}
                    <div className="col-md-6">
                      <input
                        type="number"
                        className="form-control form-control-lg"
                        name="total_points"
                        value={formData.total_points}
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

                    {/* Driver Image */}
                    <div className="col-md-6">
                      <input
                        type="file"
                        className="form-control form-control-lg"
                        name="driver_img"
                        onChange={handleInputChange}
                        accept="image/*"
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
                    onClick={handleUpdateDriver}
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
                    Update Driver
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
                  <h5 className="modal-title" style={{ color: '#ff6b6b', fontWeight: '600', fontSize: '20px' }}>⚠️ Delete Driver</h5>
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
                    Are you sure you want to delete <strong style={{ color: '#ff6b6b' }}>{deletingDriverName}</strong>?
                  </p>
                  <p style={{
                    color: '#ff6b6b',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}>
                    ⚠️ This action cannot be undone. The driver will be permanently deleted.
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
                    onClick={handleDeleteDriver}
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
                    Delete Driver
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

export default DriverAdminDashboard;
