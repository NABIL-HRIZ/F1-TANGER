import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AdminDashboard.css';

const RacesAdminDashboard = () => {
  const navigate = useNavigate();
  const [races, setRaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    date: '',
    start_time: '',
    status: 'scheduled',
    laps_nbr: '',
    nbr_tickets: '',
    price: '',
    img: null,
  });
  const [formErrors, setFormErrors] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRaceId, setEditingRaceId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingRaceId, setDeletingRaceId] = useState(null);
  const [deletingRaceName, setDeletingRaceName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [perPage, setPerPage] = useState(10);

  // Fetch races
  useEffect(() => {
    fetchRaces();
  }, [currentPage]);

  const fetchRaces = async () => {
    try {
      setLoading(true);
      const url = searchQuery
        ? `http://localhost:8000/api/admin/race/search?q=${searchQuery}&page=${currentPage}`
        : `http://localhost:8000/api/admin/races?page=${currentPage}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        }
      });

      if (!response.ok) throw new Error('Failed to fetch races');

      const data = await response.json();
      setRaces(data.data || data);
      if (data.pagination) {
        setCurrentPage(data.pagination.current_page);
        setLastPage(data.pagination.last_page);
        setTotal(data.pagination.total);
        setPerPage(data.pagination.per_page);
      }
    } catch (error) {
      console.error('Error fetching races:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.location.trim()) errors.location = 'Location is required';
    if (!formData.date) errors.date = 'Date is required';
    if (!formData.status) errors.status = 'Status is required';
    return errors;
  };

  const handleInputChange = (e) => {
    const { name, type, files, value } = e.target;
    if (type === 'file') {
      setFormData(prev => ({ ...prev, [name]: files[0] || null }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAddRace = async (e) => {
    e.preventDefault();
    const errors = validateForm();

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append('name', formData.name);
    formDataToSend.append('location', formData.location);
    formDataToSend.append('date', formData.date);
    formDataToSend.append('start_time', formData.start_time);
    formDataToSend.append('status', formData.status);
    formDataToSend.append('laps_nbr', formData.laps_nbr);
    formDataToSend.append('nbr_tickets', formData.nbr_tickets);
    formDataToSend.append('price', formData.price);
    if (formData.img) {
      formDataToSend.append('img', formData.img);
    }

    try {
      const response = await fetch('http://localhost:8000/api/admin/race/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formDataToSend
      });

      if (!response.ok) throw new Error('Failed to add race');

      setFormData({
        name: '',
        location: '',
        date: '',
        start_time: '',
        status: 'scheduled',
        laps_nbr: '',
        nbr_tickets: '',
        price: '',
        img: null,
      });
      setFormErrors({});
      setShowAddModal(false);
      fetchRaces();
    } catch (error) {
      console.error('Error adding race:', error);
      setFormErrors({ submit: 'Failed to add race' });
    }
  };

  const handleEditRace = async (race) => {
    setFormData({
      name: race.name,
      location: race.location,
      date: race.date,
      start_time: race.start_time || '',
      status: race.status,
      laps_nbr: race.laps_nbr || '',
      nbr_tickets: race.nbr_tickets || '',
      price: race.price || '',
      img: null,
    });
    setEditingRaceId(race.id);
    setShowEditModal(true);
    setFormErrors({});
  };

  const handleUpdateRace = async (e) => {
    e.preventDefault();
    const errors = validateForm();

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append('name', formData.name);
    formDataToSend.append('location', formData.location);
    formDataToSend.append('date', formData.date);
    formDataToSend.append('start_time', formData.start_time);
    formDataToSend.append('status', formData.status);
    formDataToSend.append('laps_nbr', formData.laps_nbr);
    formDataToSend.append('nbr_tickets', formData.nbr_tickets);
    formDataToSend.append('price', formData.price);
    if (formData.img) {
      formDataToSend.append('img', formData.img);
    }

    try {
      const response = await fetch(`http://localhost:8000/api/admin/race/update/${editingRaceId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formDataToSend
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update race');
      }

      setFormData({
        name: '',
        location: '',
        date: '',
        start_time: '',
        status: 'scheduled',
        laps_nbr: '',
        nbr_tickets: '',
        price: '',
        img: null,
      });
      setFormErrors({});
      setShowEditModal(false);
      setEditingRaceId(null);
      fetchRaces();
    } catch (error) {
      console.error('Error updating race:', error);
      setFormErrors({ submit: error.message });
    }
  };

  const handleDeleteRace = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/admin/race/delete/${deletingRaceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        }
      });

      if (!response.ok) throw new Error('Failed to delete race');

      setShowDeleteConfirm(false);
      setDeletingRaceId(null);
      setDeletingRaceName('');
      fetchRaces();
    } catch (error) {
      console.error('Error deleting race:', error);
      alert('Error: ' + error.message);
    }
  };

  const openDeleteConfirm = (raceId, raceName) => {
    setDeletingRaceId(raceId);
    setDeletingRaceName(raceName);
    setShowDeleteConfirm(true);
  };

  const closeDeleteConfirm = () => {
    setShowDeleteConfirm(false);
    setDeletingRaceId(null);
    setDeletingRaceName('');
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchRaces();
  };

  const closeModal = () => {
    setShowAddModal(false);
    setFormData({
      name: '',
      location: '',
      date: '',
      start_time: '',
      status: 'scheduled',
      laps_nbr: '',
      nbr_tickets: '',
      price: '',
      img: null,
    });
    setFormErrors({});
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingRaceId(null);
    setFormData({
      name: '',
      location: '',
      date: '',
      start_time: '',
      status: 'scheduled',
      laps_nbr: '',
      nbr_tickets: '',
      price: '',
      img: null,
    });
    setFormErrors({});
  };

  if (loading) return (
    <div className="page-content">
      <div className="loader">
        <div className="f1-wheel"></div>
      </div>
    </div>
  );

  return (
    <>
    <div className="page-content">
      <div style={{ width: '100%' }}>
        <h2 style={{ marginBottom: '20px' }}>🏁 Races Management</h2>

        {/* Search Bar */}
        <div style={{
          marginBottom: '30px',
          display: 'flex',
          gap: '10px'
        }}>
          <input
            type="text"
            placeholder="Search races... (Press Enter to search)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
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
            + Add Race
          </button>
        </div>

        {/* Races Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '20px'
        }}>
          {races.length > 0 ? (
            races.map((race) => (
              <div
                key={race.id}
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
                    {race.name}
                  </h3>
                  <p style={{
                    color: '#7c8fa0',
                    fontSize: '13px',
                    margin: 0
                  }}>
                    📍 {race.location}
                  </p>
                </div>

                <div style={{
                  display: 'flex',
                  gap: '8px',
                  marginBottom: '15px',
                  flexWrap: 'wrap'
                }}>
                  <span style={{
                    display: 'inline-block',
                    padding: '4px 10px',
                    background: race.status === 'scheduled' ? 'rgba(76, 175, 80, 0.2)' : race.status === 'ongoing' ? 'rgba(255, 193, 7, 0.2)' : 'rgba(244, 67, 54, 0.2)',
                    color: race.status === 'scheduled' ? '#4caf50' : race.status === 'ongoing' ? '#ffc107' : '#f44336',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}>
                    {race.status || 'scheduled'}
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
                    ${race.price || '0.00'}
                  </span>
                </div>

                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  marginBottom: '15px',
                  fontSize: '13px',
                  color: '#a8b5c4'
                }}>
                  <p style={{ margin: '0' }}>📅 {race.date}</p>
                  <p style={{ margin: '0' }}>⏰ {race.start_time || 'N/A'}</p>
                  <p style={{ margin: '0' }}>🎫 {race.nbr_tickets || 'N/A'} Tickets</p>
                </div>

                <div style={{
                  display: 'flex',
                  gap: '10px'
                }}>
                  <button 
                    onClick={() => handleEditRace(race)}
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
                    onClick={() => openDeleteConfirm(race.id, race.name)}
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
              <p>No races found</p>
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
            {Array.from({ length: lastPage }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => {
                  setCurrentPage(page);
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
              const newPage = Math.min(lastPage, currentPage + 1);
              setCurrentPage(newPage);
            }}
            disabled={currentPage === lastPage}
            style={{
              padding: '10px 16px',
              background: currentPage === lastPage ? 'rgba(232, 62, 140, 0.2)' : 'linear-gradient(135deg, #e83e8c 0%, #c1316e 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: currentPage === lastPage ? 'not-allowed' : 'pointer',
              opacity: currentPage === lastPage ? 0.5 : 1,
              fontWeight: '600'
            }}
          >
            Next →
          </button>
        </div>
      </div>
    </div>

    {/* Add Race Modal */}
    {showAddModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}>
          <div className="modal-dialog modal-lg" style={{ maxWidth: '700px' }}>
            <div className="modal-content" style={{ backgroundColor: '#1a1728', borderColor: 'rgba(232, 62, 140, 0.3)' }}>
              <div className="modal-header" style={{ borderBottom: '1px solid rgba(232, 62, 140, 0.3)', padding: '20px 30px' }}>
                <h5 className="modal-title" style={{ color: '#e83e8c', fontWeight: '600', fontSize: '20px' }}>➕ Add New Race</h5>
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
                      placeholder="Race Name"
                      style={{
                        backgroundColor: 'rgba(15, 14, 30, 0.5)',
                        borderColor: formErrors.name ? '#ff6b6b' : 'rgba(232, 62, 140, 0.3)',
                        color: '#fff',
                        fontSize: '15px'
                      }}
                    />
                    {formErrors.name && <div className="invalid-feedback d-block" style={{ color: '#ff6b6b', fontSize: '13px', marginTop: '5px' }}>{formErrors.name}</div>}
                  </div>

                  {/* Location */}
                  <div className="col-md-6">
                    <input
                      type="text"
                      className={`form-control form-control-lg ${formErrors.location ? 'is-invalid' : ''}`}
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="Location"
                      style={{
                        backgroundColor: 'rgba(15, 14, 30, 0.5)',
                        borderColor: formErrors.location ? '#ff6b6b' : 'rgba(232, 62, 140, 0.3)',
                        color: '#fff',
                        fontSize: '15px'
                      }}
                    />
                    {formErrors.location && <div className="invalid-feedback d-block" style={{ color: '#ff6b6b', fontSize: '13px', marginTop: '5px' }}>{formErrors.location}</div>}
                  </div>

                  {/* Date */}
                  <div className="col-md-6">
                    <input
                      type="date"
                      className={`form-control form-control-lg ${formErrors.date ? 'is-invalid' : ''}`}
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      style={{
                        backgroundColor: 'rgba(15, 14, 30, 0.5)',
                        borderColor: formErrors.date ? '#ff6b6b' : 'rgba(232, 62, 140, 0.3)',
                        color: '#fff',
                        fontSize: '15px'
                      }}
                    />
                    {formErrors.date && <div className="invalid-feedback d-block" style={{ color: '#ff6b6b', fontSize: '13px', marginTop: '5px' }}>{formErrors.date}</div>}
                  </div>

                  {/* Start Time */}
                  <div className="col-md-6">
                    <input
                      type="time"
                      className="form-control form-control-lg"
                      name="start_time"
                      value={formData.start_time}
                      onChange={handleInputChange}
                      style={{
                        backgroundColor: 'rgba(15, 14, 30, 0.5)',
                        borderColor: 'rgba(232, 62, 140, 0.3)',
                        color: '#fff',
                        fontSize: '15px'
                      }}
                    />
                  </div>

                  {/* Status */}
                  <div className="col-md-6">
                    <select
                      className={`form-control form-control-lg ${formErrors.status ? 'is-invalid' : ''}`}
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      style={{
                        backgroundColor: 'rgba(15, 14, 30, 0.5)',
                        borderColor: formErrors.status ? '#ff6b6b' : 'rgba(232, 62, 140, 0.3)',
                        color: '#fff',
                        fontSize: '15px'
                      }}
                    >
                      <option value="scheduled">Scheduled</option>
                      <option value="ongoing">Ongoing</option>
                      <option value="completed">Completed</option>
                    </select>
                    {formErrors.status && <div className="invalid-feedback d-block" style={{ color: '#ff6b6b', fontSize: '13px', marginTop: '5px' }}>{formErrors.status}</div>}
                  </div>

                  {/* Laps Number */}
                  <div className="col-md-6">
                    <input
                      type="number"
                      className="form-control form-control-lg"
                      name="laps_nbr"
                      value={formData.laps_nbr}
                      onChange={handleInputChange}
                      placeholder="Number of Laps"
                      style={{
                        backgroundColor: 'rgba(15, 14, 30, 0.5)',
                        borderColor: 'rgba(232, 62, 140, 0.3)',
                        color: '#fff',
                        fontSize: '15px'
                      }}
                    />
                  </div>

                  {/* Number of Tickets */}
                  <div className="col-md-6">
                    <input
                      type="number"
                      className="form-control form-control-lg"
                      name="nbr_tickets"
                      value={formData.nbr_tickets}
                      onChange={handleInputChange}
                      placeholder="Number of Tickets"
                      style={{
                        backgroundColor: 'rgba(15, 14, 30, 0.5)',
                        borderColor: 'rgba(232, 62, 140, 0.3)',
                        color: '#fff',
                        fontSize: '15px'
                      }}
                    />
                  </div>

                  {/* Price */}
                  <div className="col-md-6">
                    <input
                      type="number"
                      className="form-control form-control-lg"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      placeholder="Ticket Price"
                      step="0.01"
                      style={{
                        backgroundColor: 'rgba(15, 14, 30, 0.5)',
                        borderColor: 'rgba(232, 62, 140, 0.3)',
                        color: '#fff',
                        fontSize: '15px'
                      }}
                    />
                  </div>

                  {/* Race Image */}
                  <div className="col-md-6">
                    <input
                      type="file"
                      className="form-control form-control-lg"
                      name="img"
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
                  onClick={handleAddRace}
                  style={{
                    backgroundColor: '#e83e8c',
                    borderColor: '#e83e8c',
                    color: '#fff',
                    fontWeight: '600',
                    fontSize: '15px',
                    paddingLeft: '30px',
                    paddingRight: '30px'
                  }}
                >
                  Add Race
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    {/* Edit Race Modal */}
    {showEditModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}>
          <div className="modal-dialog modal-lg" style={{ maxWidth: '700px' }}>
            <div className="modal-content" style={{ backgroundColor: '#1a1728', borderColor: 'rgba(232, 62, 140, 0.3)' }}>
              <div className="modal-header" style={{ borderBottom: '1px solid rgba(232, 62, 140, 0.3)', padding: '20px 30px' }}>
                <h5 className="modal-title" style={{ color: '#e83e8c', fontWeight: '600', fontSize: '20px' }}>✏️ Edit Race</h5>
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
                      placeholder="Race Name"
                      style={{
                        backgroundColor: 'rgba(15, 14, 30, 0.5)',
                        borderColor: formErrors.name ? '#ff6b6b' : 'rgba(232, 62, 140, 0.3)',
                        color: '#fff',
                        fontSize: '15px'
                      }}
                    />
                    {formErrors.name && <div className="invalid-feedback d-block" style={{ color: '#ff6b6b', fontSize: '13px', marginTop: '5px' }}>{formErrors.name}</div>}
                  </div>

                  {/* Location */}
                  <div className="col-md-6">
                    <input
                      type="text"
                      className={`form-control form-control-lg ${formErrors.location ? 'is-invalid' : ''}`}
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="Location"
                      style={{
                        backgroundColor: 'rgba(15, 14, 30, 0.5)',
                        borderColor: formErrors.location ? '#ff6b6b' : 'rgba(232, 62, 140, 0.3)',
                        color: '#fff',
                        fontSize: '15px'
                      }}
                    />
                    {formErrors.location && <div className="invalid-feedback d-block" style={{ color: '#ff6b6b', fontSize: '13px', marginTop: '5px' }}>{formErrors.location}</div>}
                  </div>

                  {/* Date */}
                  <div className="col-md-6">
                    <input
                      type="date"
                      className={`form-control form-control-lg ${formErrors.date ? 'is-invalid' : ''}`}
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      style={{
                        backgroundColor: 'rgba(15, 14, 30, 0.5)',
                        borderColor: formErrors.date ? '#ff6b6b' : 'rgba(232, 62, 140, 0.3)',
                        color: '#fff',
                        fontSize: '15px'
                      }}
                    />
                    {formErrors.date && <div className="invalid-feedback d-block" style={{ color: '#ff6b6b', fontSize: '13px', marginTop: '5px' }}>{formErrors.date}</div>}
                  </div>

                  {/* Start Time */}
                  <div className="col-md-6">
                    <input
                      type="time"
                      className="form-control form-control-lg"
                      name="start_time"
                      value={formData.start_time}
                      onChange={handleInputChange}
                      style={{
                        backgroundColor: 'rgba(15, 14, 30, 0.5)',
                        borderColor: 'rgba(232, 62, 140, 0.3)',
                        color: '#fff',
                        fontSize: '15px'
                      }}
                    />
                  </div>

                  {/* Status */}
                  <div className="col-md-6">
                    <select
                      className={`form-control form-control-lg ${formErrors.status ? 'is-invalid' : ''}`}
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      style={{
                        backgroundColor: 'rgba(15, 14, 30, 0.5)',
                        borderColor: formErrors.status ? '#ff6b6b' : 'rgba(232, 62, 140, 0.3)',
                        color: '#fff',
                        fontSize: '15px'
                      }}
                    >
                      <option value="scheduled">Scheduled</option>
                      <option value="ongoing">Ongoing</option>
                      <option value="completed">Completed</option>
                    </select>
                    {formErrors.status && <div className="invalid-feedback d-block" style={{ color: '#ff6b6b', fontSize: '13px', marginTop: '5px' }}>{formErrors.status}</div>}
                  </div>

                  {/* Laps Number */}
                  <div className="col-md-6">
                    <input
                      type="number"
                      className="form-control form-control-lg"
                      name="laps_nbr"
                      value={formData.laps_nbr}
                      onChange={handleInputChange}
                      placeholder="Number of Laps"
                      style={{
                        backgroundColor: 'rgba(15, 14, 30, 0.5)',
                        borderColor: 'rgba(232, 62, 140, 0.3)',
                        color: '#fff',
                        fontSize: '15px'
                      }}
                    />
                  </div>

                  {/* Number of Tickets */}
                  <div className="col-md-6">
                    <input
                      type="number"
                      className="form-control form-control-lg"
                      name="nbr_tickets"
                      value={formData.nbr_tickets}
                      onChange={handleInputChange}
                      placeholder="Number of Tickets"
                      style={{
                        backgroundColor: 'rgba(15, 14, 30, 0.5)',
                        borderColor: 'rgba(232, 62, 140, 0.3)',
                        color: '#fff',
                        fontSize: '15px'
                      }}
                    />
                  </div>

                  {/* Price */}
                  <div className="col-md-6">
                    <input
                      type="number"
                      className="form-control form-control-lg"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      placeholder="Ticket Price"
                      step="0.01"
                      style={{
                        backgroundColor: 'rgba(15, 14, 30, 0.5)',
                        borderColor: 'rgba(232, 62, 140, 0.3)',
                        color: '#fff',
                        fontSize: '15px'
                      }}
                    />
                  </div>

                  {/* Race Image */}
                  <div className="col-md-6">
                    <input
                      type="file"
                      className="form-control form-control-lg"
                      name="img"
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
                  onClick={handleUpdateRace}
                  style={{
                    backgroundColor: '#e83e8c',
                    borderColor: '#e83e8c',
                    color: '#fff',
                    fontWeight: '600',
                    fontSize: '15px',
                    paddingLeft: '30px',
                    paddingRight: '30px'
                  }}
                >
                  Update Race
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}>
          <div className="modal-dialog" style={{ maxWidth: '500px' }}>
            <div className="modal-content" style={{ 
              backgroundColor: 'rgba(15, 14, 30, 0.95)', 
              borderColor: 'rgba(255, 107, 107, 0.3)',
              border: '2px solid rgba(255, 107, 107, 0.3)'
            }}>
              <div className="modal-header" style={{ borderBottom: '1px solid rgba(255, 107, 107, 0.3)', padding: '20px 30px' }}>
                <h5 className="modal-title" style={{ color: '#ff6b6b', fontWeight: '600', fontSize: '20px' }}>
                  ⚠️ Delete Race
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  style={{ filter: 'invert(1)' }}
                  onClick={closeDeleteConfirm}
                ></button>
              </div>
              <div className="modal-body" style={{ padding: '30px' }}>
                <p style={{ color: '#a8b5c4', marginBottom: '15px', fontSize: '15px' }}>
                  Are you sure you want to delete the race:
                </p>
                <p style={{ 
                  color: '#ff6b6b', 
                  fontWeight: '600', 
                  fontSize: '16px',
                  marginBottom: '15px',
                  padding: '10px',
                  backgroundColor: 'rgba(255, 107, 107, 0.1)',
                  borderLeft: '3px solid #ff6b6b',
                  borderRadius: '4px'
                }}>
                  {deletingRaceName}
                </p>
                <p style={{ color: '#ff6b6b', fontSize: '14px', fontWeight: '500' }}>
                  ⚠️ This action cannot be undone.
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
                  onClick={handleDeleteRace}
                  style={{
                    background: 'linear-gradient(135deg, #ff6b6b 0%, #e63946 100%)',
                    borderColor: '#ff6b6b',
                    color: '#fff',
                    fontWeight: '600',
                    fontSize: '15px',
                    paddingLeft: '30px',
                    paddingRight: '30px'
                  }}
                >
                  Delete Race
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RacesAdminDashboard;
