import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import '../styles/AdminDashboard.css';

function CarsAdminDashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [cars, setCars] = useState([]);
  const [teams, setTeams] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [activeSearch, setActiveSearch] = useState(searchParams.get('search') || '');
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page')) || 1);
  const [totalPages, setTotalPages] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCarId, setEditingCarId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingCarId, setDeletingCarId] = useState(null);
  const [deletingCarName, setDeletingCarName] = useState('');
  const [formData, setFormData] = useState({
    car_number: '',
    model: '',
    brand: '',
    team_id: '',
    driver_id: '',
    status: 'active',
    horsepower: '',
    top_speed: '',
    chassis: '',
    engine: '',
    year: '',
    color: '',
    weight: '',
    image: null
  });
  const [formErrors, setFormErrors] = useState({});
  const hasFetched = useRef(false);

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchTeams();
      fetchDrivers();
      fetchCars(1, activeSearch);
    }
  }, []);

  useEffect(() => {
    fetchCars(currentPage, activeSearch);
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

  const fetchDrivers = async () => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

      const response = await fetch(`${apiUrl}/drivers`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to fetch drivers');

      const data = await response.json();
      setDrivers(data.data || []);
    } catch (error) {
      console.error('Error fetching drivers:', error);
    }
  };

  const fetchCars = useCallback(async (page, search = '') => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

      let url = `${apiUrl}/cars?page=${page}`;
      if (search.trim()) {
        url += `&search=${encodeURIComponent(search)}`;
      }

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to fetch cars');

      const data = await response.json();
      setCars(data.data || []);
      setTotalPages(data.last_page || 1);

      if (search.trim() && currentPage !== 1) {
        setCurrentPage(1);
      }
    } catch (error) {
      console.error('Error fetching cars:', error);
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
        navigate(`/admin/cars?search=${encodeURIComponent(search)}&page=1`);
      } else {
        navigate(`/admin/cars`);
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
    if (!formData.car_number.trim()) errors.car_number = 'Car number is required';
    if (!formData.model.trim()) errors.model = 'Model is required';
    if (!formData.brand.trim()) errors.brand = 'Brand is required';
    if (!formData.team_id) errors.team_id = 'Team is required';
    if (!formData.chassis.trim()) errors.chassis = 'Chassis is required';
    if (!formData.year) errors.year = 'Year is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddCar = async () => {
    if (!validateForm()) return;

    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

      const formDataToSend = new FormData();
      formDataToSend.append('car_number', formData.car_number);
      formDataToSend.append('model', formData.model);
      formDataToSend.append('brand', formData.brand);
      formDataToSend.append('team_id', formData.team_id);
      formDataToSend.append('driver_id', formData.driver_id || null);
      formDataToSend.append('status', formData.status);
      formDataToSend.append('horsepower', formData.horsepower || null);
      formDataToSend.append('top_speed', formData.top_speed || null);
      formDataToSend.append('chassis', formData.chassis);
      formDataToSend.append('engine', formData.engine || null);
      formDataToSend.append('year', formData.year);
      formDataToSend.append('color', formData.color || null);
      formDataToSend.append('weight', formData.weight || null);
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      const response = await fetch(`${apiUrl}/admin/cars/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add car');
      }

      setFormData({
        car_number: '',
        model: '',
        brand: '',
        team_id: '',
        driver_id: '',
        status: 'active',
        horsepower: '',
        top_speed: '',
        chassis: '',
        engine: '',
        year: '',
        color: '',
        weight: '',
        image: null
      });
      setFormErrors({});
      setShowAddModal(false);
      fetchCars(1, activeSearch);
    } catch (error) {
      console.error('Error adding car:', error);
      setFormErrors({ submit: error.message });
    }
  };

  const closeModal = () => {
    setShowAddModal(false);
    setFormData({
      car_number: '',
      model: '',
      brand: '',
      team_id: '',
      driver_id: '',
      status: 'active',
      horsepower: '',
      top_speed: '',
      chassis: '',
      engine: '',
      year: '',
      color: '',
      weight: '',
      image: null
    });
    setFormErrors({});
  };

  const openEditModal = async (carId) => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

      const response = await fetch(`${apiUrl}/admin/cars/edit/${carId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to fetch car');

      const data = await response.json();
      const car = data.car;

      setFormData({
        car_number: car.car_number || '',
        model: car.model || '',
        brand: car.brand || '',
        team_id: car.team_id || '',
        driver_id: car.driver_id || '',
        status: car.status || 'active',
        horsepower: car.horsepower || '',
        top_speed: car.top_speed || '',
        chassis: car.chassis || '',
        engine: car.engine || '',
        year: car.year || '',
        color: car.color || '',
        weight: car.weight || '',
        image: null
      });
      setEditingCarId(carId);
      setShowEditModal(true);
      setFormErrors({});
    } catch (error) {
      console.error('Error fetching car:', error);
      setFormErrors({ submit: error.message });
    }
  };

  const handleUpdateCar = async () => {
    if (!formData.car_number.trim() || !formData.model.trim() || !formData.brand.trim() || !formData.team_id || !formData.chassis.trim() || !formData.year) {
      setFormErrors({
        car_number: formData.car_number.trim() ? '' : 'Car number is required',
        model: formData.model.trim() ? '' : 'Model is required',
        brand: formData.brand.trim() ? '' : 'Brand is required',
        team_id: formData.team_id ? '' : 'Team is required',
        chassis: formData.chassis.trim() ? '' : 'Chassis is required',
        year: formData.year ? '' : 'Year is required'
      });
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

      const formDataToSend = new FormData();
      formDataToSend.append('car_number', formData.car_number);
      formDataToSend.append('model', formData.model);
      formDataToSend.append('brand', formData.brand);
      formDataToSend.append('team_id', formData.team_id);
      formDataToSend.append('driver_id', formData.driver_id || null);
      formDataToSend.append('status', formData.status);
      formDataToSend.append('horsepower', formData.horsepower || null);
      formDataToSend.append('top_speed', formData.top_speed || null);
      formDataToSend.append('chassis', formData.chassis);
      formDataToSend.append('engine', formData.engine || null);
      formDataToSend.append('year', formData.year);
      formDataToSend.append('color', formData.color || null);
      formDataToSend.append('weight', formData.weight || null);
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      const response = await fetch(`${apiUrl}/admin/cars/update/${editingCarId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update car');
      }

      setFormData({
        car_number: '',
        model: '',
        brand: '',
        team_id: '',
        driver_id: '',
        status: 'active',
        horsepower: '',
        top_speed: '',
        chassis: '',
        engine: '',
        year: '',
        color: '',
        weight: '',
        image: null
      });
      setFormErrors({});
      setShowEditModal(false);
      setEditingCarId(null);
      fetchCars(currentPage, activeSearch);
    } catch (error) {
      console.error('Error updating car:', error);
      setFormErrors({ submit: error.message });
    }
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingCarId(null);
    setFormData({
      car_number: '',
      model: '',
      brand: '',
      team_id: '',
      driver_id: '',
      status: 'active',
      horsepower: '',
      top_speed: '',
      chassis: '',
      engine: '',
      year: '',
      color: '',
      weight: '',
      image: null
    });
    setFormErrors({});
  };

  const openDeleteConfirm = (carId, carName) => {
    setDeletingCarId(carId);
    setDeletingCarName(carName);
    setShowDeleteConfirm(true);
  };

  const closeDeleteConfirm = () => {
    setShowDeleteConfirm(false);
    setDeletingCarId(null);
    setDeletingCarName('');
  };

  const handleDeleteCar = async () => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

      const response = await fetch(`${apiUrl}/admin/cars/delete/${deletingCarId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete car');
      }

      setShowDeleteConfirm(false);
      setDeletingCarId(null);
      setDeletingCarName('');
      fetchCars(currentPage, activeSearch);
    } catch (error) {
      console.error('Error deleting car:', error);
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
        <h2 style={{ marginBottom: '20px' }}>🏎️ Cars Management</h2>

        {/* Search Bar */}
        <div style={{
          marginBottom: '30px',
          display: 'flex',
          gap: '10px'
        }}>
          <input
            type="text"
            placeholder="Search cars... (Press Enter to search)"
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
            + Add Car
          </button>
        </div>

        {/* Cars Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '20px'
        }}>
          {cars.length > 0 ? (
            cars.map((car) => (
              <div
                key={car.id}
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
                <div style={{ marginBottom: '15px' }}>
                  <h3 style={{
                    color: '#e83e8c',
                    fontSize: '18px',
                    fontWeight: '600',
                    margin: '0 0 8px 0'
                  }}>
                    #{car.car_number} - {car.brand}
                  </h3>
                  <p style={{
                    color: '#7c8fa0',
                    fontSize: '13px',
                    margin: '0 0 5px 0'
                  }}>
                    🚗 {car.model}
                  </p>
                  <p style={{
                    color: '#7c8fa0',
                    fontSize: '13px',
                    margin: '0 0 5px 0'
                  }}>
                    🏁 {car.team_name}
                  </p>
                  <p style={{
                    color: '#7c8fa0',
                    fontSize: '13px',
                    margin: 0
                  }}>
                    👤 {car.driver_name}
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
                    background: car.status === 'active' ? 'rgba(76, 175, 80, 0.2)' : 'rgba(255, 193, 7, 0.2)',
                    color: car.status === 'active' ? '#4caf50' : '#ffc107',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}>
                    {car.status || 'Active'}
                  </span>
                  {car.horsepower && (
                    <span style={{
                      display: 'inline-block',
                      padding: '4px 10px',
                      background: 'rgba(100, 200, 255, 0.2)',
                      color: '#64c8ff',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}>
                      {car.horsepower} HP
                    </span>
                  )}
                </div>

                <div style={{
                  display: 'flex',
                  gap: '10px'
                }}>
                  <button
                    onClick={() => openEditModal(car.id)}
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
                    onClick={() => openDeleteConfirm(car.id, `#${car.car_number} - ${car.brand}`)}
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
              <p>No cars found</p>
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
              navigate(`/admin/cars${query}`);
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
                  navigate(`/admin/cars${query}`);
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
              navigate(`/admin/cars${query}`);
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

        {/* Add Car Modal */}
        {showAddModal && (
          <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}>
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content" style={{ backgroundColor: 'rgba(15, 14, 30, 0.95)', border: '1px solid rgba(232, 62, 140, 0.3)' }}>
                <div className="modal-header" style={{ borderBottom: '1px solid rgba(232, 62, 140, 0.3)' }}>
                  <h5 className="modal-title" style={{ color: '#e83e8c', fontWeight: '600', fontSize: '20px' }}>➕ Add New Car</h5>
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
                    {/* Car Number */}
                    <div className="col-md-6">
                      <input
                        type="text"
                        className={`form-control form-control-lg ${formErrors.car_number ? 'is-invalid' : ''}`}
                        name="car_number"
                        value={formData.car_number}
                        onChange={handleInputChange}
                        placeholder="Car Number"
                        style={{
                          backgroundColor: 'rgba(15, 14, 30, 0.5)',
                          borderColor: formErrors.car_number ? '#ff6b6b' : 'rgba(232, 62, 140, 0.3)',
                          color: '#fff',
                          fontSize: '15px'
                        }}
                      />
                      {formErrors.car_number && <div className="invalid-feedback d-block" style={{ color: '#ff6b6b', fontSize: '13px', marginTop: '5px' }}>{formErrors.car_number}</div>}
                    </div>

                    {/* Model */}
                    <div className="col-md-6">
                      <input
                        type="text"
                        className={`form-control form-control-lg ${formErrors.model ? 'is-invalid' : ''}`}
                        name="model"
                        value={formData.model}
                        onChange={handleInputChange}
                        placeholder="Model"
                        style={{
                          backgroundColor: 'rgba(15, 14, 30, 0.5)',
                          borderColor: formErrors.model ? '#ff6b6b' : 'rgba(232, 62, 140, 0.3)',
                          color: '#fff',
                          fontSize: '15px'
                        }}
                      />
                      {formErrors.model && <div className="invalid-feedback d-block" style={{ color: '#ff6b6b', fontSize: '13px', marginTop: '5px' }}>{formErrors.model}</div>}
                    </div>

                    {/* Brand */}
                    <div className="col-md-6">
                      <input
                        type="text"
                        className={`form-control form-control-lg ${formErrors.brand ? 'is-invalid' : ''}`}
                        name="brand"
                        value={formData.brand}
                        onChange={handleInputChange}
                        placeholder="Brand"
                        style={{
                          backgroundColor: 'rgba(15, 14, 30, 0.5)',
                          borderColor: formErrors.brand ? '#ff6b6b' : 'rgba(232, 62, 140, 0.3)',
                          color: '#fff',
                          fontSize: '15px'
                        }}
                      />
                      {formErrors.brand && <div className="invalid-feedback d-block" style={{ color: '#ff6b6b', fontSize: '13px', marginTop: '5px' }}>{formErrors.brand}</div>}
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

                    {/* Driver */}
                    <div className="col-md-6">
                      <select
                        className="form-control form-control-lg"
                        name="driver_id"
                        value={formData.driver_id}
                        onChange={handleInputChange}
                        style={{
                          backgroundColor: 'rgba(15, 14, 30, 0.5)',
                          borderColor: 'rgba(232, 62, 140, 0.3)',
                          color: '#fff',
                          fontSize: '15px'
                        }}
                      >
                        <option value="">Select Driver</option>
                        {drivers.map(driver => (
                          <option key={driver.id} value={driver.id}>{driver.first_name} {driver.last_name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Status */}
                    <div className="col-md-6">
                      <select
                        className="form-control form-control-lg"
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        style={{
                          backgroundColor: 'rgba(15, 14, 30, 0.5)',
                          borderColor: 'rgba(232, 62, 140, 0.3)',
                          color: '#fff',
                          fontSize: '15px'
                        }}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="maintenance">Maintenance</option>
                      </select>
                    </div>

                    {/* Horsepower */}
                    <div className="col-md-6">
                      <input
                        type="number"
                        className="form-control form-control-lg"
                        name="horsepower"
                        value={formData.horsepower}
                        onChange={handleInputChange}
                        placeholder="Horsepower"
                        style={{
                          backgroundColor: 'rgba(15, 14, 30, 0.5)',
                          borderColor: 'rgba(232, 62, 140, 0.3)',
                          color: '#fff',
                          fontSize: '15px'
                        }}
                      />
                    </div>

                    {/* Top Speed */}
                    <div className="col-md-6">
                      <input
                        type="number"
                        className="form-control form-control-lg"
                        name="top_speed"
                        value={formData.top_speed}
                        onChange={handleInputChange}
                        placeholder="Top Speed"
                        style={{
                          backgroundColor: 'rgba(15, 14, 30, 0.5)',
                          borderColor: 'rgba(232, 62, 140, 0.3)',
                          color: '#fff',
                          fontSize: '15px'
                        }}
                      />
                    </div>

                    {/* Chassis */}
                    <div className="col-md-6">
                      <input
                        type="text"
                        className={`form-control form-control-lg ${formErrors.chassis ? 'is-invalid' : ''}`}
                        name="chassis"
                        value={formData.chassis}
                        onChange={handleInputChange}
                        placeholder="Chassis"
                        style={{
                          backgroundColor: 'rgba(15, 14, 30, 0.5)',
                          borderColor: formErrors.chassis ? '#ff6b6b' : 'rgba(232, 62, 140, 0.3)',
                          color: '#fff',
                          fontSize: '15px'
                        }}
                      />
                      {formErrors.chassis && <div className="invalid-feedback d-block" style={{ color: '#ff6b6b', fontSize: '13px', marginTop: '5px' }}>{formErrors.chassis}</div>}
                    </div>

                    {/* Engine */}
                    <div className="col-md-6">
                      <input
                        type="text"
                        className="form-control form-control-lg"
                        name="engine"
                        value={formData.engine}
                        onChange={handleInputChange}
                        placeholder="Engine"
                        style={{
                          backgroundColor: 'rgba(15, 14, 30, 0.5)',
                          borderColor: 'rgba(232, 62, 140, 0.3)',
                          color: '#fff',
                          fontSize: '15px'
                        }}
                      />
                    </div>

                    {/* Year */}
                    <div className="col-md-6">
                      <input
                        type="number"
                        className={`form-control form-control-lg ${formErrors.year ? 'is-invalid' : ''}`}
                        name="year"
                        value={formData.year}
                        onChange={handleInputChange}
                        placeholder="Year"
                        style={{
                          backgroundColor: 'rgba(15, 14, 30, 0.5)',
                          borderColor: formErrors.year ? '#ff6b6b' : 'rgba(232, 62, 140, 0.3)',
                          color: '#fff',
                          fontSize: '15px'
                        }}
                      />
                      {formErrors.year && <div className="invalid-feedback d-block" style={{ color: '#ff6b6b', fontSize: '13px', marginTop: '5px' }}>{formErrors.year}</div>}
                    </div>

                    {/* Color */}
                    <div className="col-md-6">
                      <input
                        type="text"
                        className="form-control form-control-lg"
                        name="color"
                        value={formData.color}
                        onChange={handleInputChange}
                        placeholder="Color"
                        style={{
                          backgroundColor: 'rgba(15, 14, 30, 0.5)',
                          borderColor: 'rgba(232, 62, 140, 0.3)',
                          color: '#fff',
                          fontSize: '15px'
                        }}
                      />
                    </div>

                    {/* Weight */}
                    <div className="col-md-6">
                      <input
                        type="number"
                        className="form-control form-control-lg"
                        name="weight"
                        value={formData.weight}
                        onChange={handleInputChange}
                        placeholder="Weight in kg"
                        style={{
                          backgroundColor: 'rgba(15, 14, 30, 0.5)',
                          borderColor: 'rgba(232, 62, 140, 0.3)',
                          color: '#fff',
                          fontSize: '15px'
                        }}
                      />
                    </div>

                    {/* Car Image */}
                    <div className="col-md-6">
                      <input
                        type="file"
                        className="form-control form-control-lg"
                        name="image"
                        onChange={handleInputChange}
                        accept="image/*"
                        placeholder="Car Image"
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
                    onClick={handleAddCar}
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
                    Create Car
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Car Modal */}
        {showEditModal && (
          <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}>
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content" style={{ backgroundColor: 'rgba(15, 14, 30, 0.95)', border: '1px solid rgba(232, 62, 140, 0.3)' }}>
                <div className="modal-header" style={{ borderBottom: '1px solid rgba(232, 62, 140, 0.3)' }}>
                  <h5 className="modal-title" style={{ color: '#e83e8c', fontWeight: '600', fontSize: '20px' }}>✏️ Edit Car</h5>
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
                    {/* Car Number */}
                    <div className="col-md-6">
                      <input
                        type="text"
                        className={`form-control form-control-lg ${formErrors.car_number ? 'is-invalid' : ''}`}
                        name="car_number"
                        value={formData.car_number}
                        onChange={handleInputChange}
                        placeholder="Car Number"
                        style={{
                          backgroundColor: 'rgba(15, 14, 30, 0.5)',
                          borderColor: formErrors.car_number ? '#ff6b6b' : 'rgba(232, 62, 140, 0.3)',
                          color: '#fff',
                          fontSize: '15px'
                        }}
                      />
                      {formErrors.car_number && <div className="invalid-feedback d-block" style={{ color: '#ff6b6b', fontSize: '13px', marginTop: '5px' }}>{formErrors.car_number}</div>}
                    </div>

                    {/* Model */}
                    <div className="col-md-6">
                      <input
                        type="text"
                        className={`form-control form-control-lg ${formErrors.model ? 'is-invalid' : ''}`}
                        name="model"
                        value={formData.model}
                        onChange={handleInputChange}
                        placeholder="Model"
                        style={{
                          backgroundColor: 'rgba(15, 14, 30, 0.5)',
                          borderColor: formErrors.model ? '#ff6b6b' : 'rgba(232, 62, 140, 0.3)',
                          color: '#fff',
                          fontSize: '15px'
                        }}
                      />
                      {formErrors.model && <div className="invalid-feedback d-block" style={{ color: '#ff6b6b', fontSize: '13px', marginTop: '5px' }}>{formErrors.model}</div>}
                    </div>

                    {/* Brand */}
                    <div className="col-md-6">
                      <input
                        type="text"
                        className={`form-control form-control-lg ${formErrors.brand ? 'is-invalid' : ''}`}
                        name="brand"
                        value={formData.brand}
                        onChange={handleInputChange}
                        placeholder="Brand"
                        style={{
                          backgroundColor: 'rgba(15, 14, 30, 0.5)',
                          borderColor: formErrors.brand ? '#ff6b6b' : 'rgba(232, 62, 140, 0.3)',
                          color: '#fff',
                          fontSize: '15px'
                        }}
                      />
                      {formErrors.brand && <div className="invalid-feedback d-block" style={{ color: '#ff6b6b', fontSize: '13px', marginTop: '5px' }}>{formErrors.brand}</div>}
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

                    {/* Driver */}
                    <div className="col-md-6">
                      <select
                        className="form-control form-control-lg"
                        name="driver_id"
                        value={formData.driver_id}
                        onChange={handleInputChange}
                        style={{
                          backgroundColor: 'rgba(15, 14, 30, 0.5)',
                          borderColor: 'rgba(232, 62, 140, 0.3)',
                          color: '#fff',
                          fontSize: '15px'
                        }}
                      >
                        <option value="">Select Driver</option>
                        {drivers.map(driver => (
                          <option key={driver.id} value={driver.id}>{driver.first_name} {driver.last_name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Status */}
                    <div className="col-md-6">
                      <select
                        className="form-control form-control-lg"
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        style={{
                          backgroundColor: 'rgba(15, 14, 30, 0.5)',
                          borderColor: 'rgba(232, 62, 140, 0.3)',
                          color: '#fff',
                          fontSize: '15px'
                        }}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="maintenance">Maintenance</option>
                      </select>
                    </div>

                    {/* Horsepower */}
                    <div className="col-md-6">
                      <input
                        type="number"
                        className="form-control form-control-lg"
                        name="horsepower"
                        value={formData.horsepower}
                        onChange={handleInputChange}
                        placeholder="Horsepower"
                        style={{
                          backgroundColor: 'rgba(15, 14, 30, 0.5)',
                          borderColor: 'rgba(232, 62, 140, 0.3)',
                          color: '#fff',
                          fontSize: '15px'
                        }}
                      />
                    </div>

                    {/* Top Speed */}
                    <div className="col-md-6">
                      <input
                        type="number"
                        className="form-control form-control-lg"
                        name="top_speed"
                        value={formData.top_speed}
                        onChange={handleInputChange}
                        placeholder="Top Speed"
                        style={{
                          backgroundColor: 'rgba(15, 14, 30, 0.5)',
                          borderColor: 'rgba(232, 62, 140, 0.3)',
                          color: '#fff',
                          fontSize: '15px'
                        }}
                      />
                    </div>

                    {/* Chassis */}
                    <div className="col-md-6">
                      <input
                        type="text"
                        className={`form-control form-control-lg ${formErrors.chassis ? 'is-invalid' : ''}`}
                        name="chassis"
                        value={formData.chassis}
                        onChange={handleInputChange}
                        placeholder="Chassis"
                        style={{
                          backgroundColor: 'rgba(15, 14, 30, 0.5)',
                          borderColor: formErrors.chassis ? '#ff6b6b' : 'rgba(232, 62, 140, 0.3)',
                          color: '#fff',
                          fontSize: '15px'
                        }}
                      />
                      {formErrors.chassis && <div className="invalid-feedback d-block" style={{ color: '#ff6b6b', fontSize: '13px', marginTop: '5px' }}>{formErrors.chassis}</div>}
                    </div>

                    {/* Engine */}
                    <div className="col-md-6">
                      <input
                        type="text"
                        className="form-control form-control-lg"
                        name="engine"
                        value={formData.engine}
                        onChange={handleInputChange}
                        placeholder="Engine"
                        style={{
                          backgroundColor: 'rgba(15, 14, 30, 0.5)',
                          borderColor: 'rgba(232, 62, 140, 0.3)',
                          color: '#fff',
                          fontSize: '15px'
                        }}
                      />
                    </div>

                    {/* Year */}
                    <div className="col-md-6">
                      <input
                        type="number"
                        className={`form-control form-control-lg ${formErrors.year ? 'is-invalid' : ''}`}
                        name="year"
                        value={formData.year}
                        onChange={handleInputChange}
                        placeholder="Year"
                        style={{
                          backgroundColor: 'rgba(15, 14, 30, 0.5)',
                          borderColor: formErrors.year ? '#ff6b6b' : 'rgba(232, 62, 140, 0.3)',
                          color: '#fff',
                          fontSize: '15px'
                        }}
                      />
                      {formErrors.year && <div className="invalid-feedback d-block" style={{ color: '#ff6b6b', fontSize: '13px', marginTop: '5px' }}>{formErrors.year}</div>}
                    </div>

                    {/* Color */}
                    <div className="col-md-6">
                      <input
                        type="text"
                        className="form-control form-control-lg"
                        name="color"
                        value={formData.color}
                        onChange={handleInputChange}
                        placeholder="Color"
                        style={{
                          backgroundColor: 'rgba(15, 14, 30, 0.5)',
                          borderColor: 'rgba(232, 62, 140, 0.3)',
                          color: '#fff',
                          fontSize: '15px'
                        }}
                      />
                    </div>

                    {/* Weight */}
                    <div className="col-md-6">
                      <input
                        type="number"
                        className="form-control form-control-lg"
                        name="weight"
                        value={formData.weight}
                        onChange={handleInputChange}
                        placeholder="Weight in kg"
                        style={{
                          backgroundColor: 'rgba(15, 14, 30, 0.5)',
                          borderColor: 'rgba(232, 62, 140, 0.3)',
                          color: '#fff',
                          fontSize: '15px'
                        }}
                      />
                    </div>

                    {/* Car Image */}
                    <div className="col-md-6">
                      <input
                        type="file"
                        className="form-control form-control-lg"
                        name="image"
                        onChange={handleInputChange}
                        accept="image/*"
                        placeholder="Car Image"
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
                    onClick={handleUpdateCar}
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
                    Update Car
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
                  <h5 className="modal-title" style={{ color: '#ff6b6b', fontWeight: '600', fontSize: '20px' }}>⚠️ Delete Car</h5>
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
                    Are you sure you want to delete <strong style={{ color: '#ff6b6b' }}>{deletingCarName}</strong>?
                  </p>
                  <p style={{
                    color: '#ff6b6b',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}>
                    ⚠️ This action cannot be undone. The car will be permanently deleted.
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
                    onClick={handleDeleteCar}
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
                    Delete Car
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

export default CarsAdminDashboard;
