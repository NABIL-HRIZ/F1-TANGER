import React, { useState, useEffect, useRef } from 'react';
import { apiRequest } from '../../utils/api';
import '../../styles/ClientDashboard.css';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

function ClientTicketsHome({ user }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ticketsPerPage = 6;

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    const res = await apiRequest('/client/tickets', 'GET');
    if (res.success) {
      setTickets(res.data);
    }
    setLoading(false);
  };

  const handleViewDetails = (ticket) => {
    setSelectedTicket(ticket);
    setShowModal(true);
  };

  const handleDownloadTicket = async (ticket) => {
    try {
      // Format date as dd/mm/yyyy
      const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
      };

      // Convert SVG QR code to image FIRST
      let qrImageData = null;
      const qrElement = document.getElementById(`qr-code-${ticket.id}`);
      
      if (qrElement) {
        const svgElement = qrElement.querySelector('svg');
        if (svgElement) {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const svgData = new XMLSerializer().serializeToString(svgElement);
          const img = new Image();
          
          await new Promise((resolve) => {
            img.onload = () => {
              canvas.width = 300;
              canvas.height = 300;
              ctx.fillStyle = '#ffffff';
              ctx.fillRect(0, 0, canvas.width, canvas.height);
              ctx.drawImage(img, 0, 0, 300, 300);
              qrImageData = canvas.toDataURL('image/png');
              resolve();
            };
            img.onerror = () => {
              console.error('QR code image failed to load');
              resolve();
            };
            img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
          });
        }
      }

      // Create a temporary container for the ticket
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'fixed';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '-9999px';
      tempContainer.style.width = '600px';
      tempContainer.style.backgroundColor = '#ffffff';
      tempContainer.style.padding = '0';
      tempContainer.style.borderRadius = '0';
      
      // Prepare QR image HTML
      let qrHtml = '';
      if (qrImageData) {
        qrHtml = `<img src="${qrImageData}" alt="QR Code" style="max-width: 120px; height: auto; margin: 0 auto; display: block; border-radius: 8px;" />`;
      }
      
      // HTML content for the ticket with futuristic design
      tempContainer.innerHTML = `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; background: #000; padding: 0; margin: 0; border-radius: 0; overflow: hidden; width: 100%; min-height: 100vh;">
          
          <!-- Futuristic Grid Background -->
          <div style="position: relative; width: 100%; background: 
            linear-gradient(90deg, rgba(232, 62, 140, 0.03) 1px, transparent 1px),
            linear-gradient(rgba(232, 62, 140, 0.03) 1px, transparent 1px);
            background-size: 50px 50px;
            padding: 60px 40px;">
            
            <!-- Neon Glow Effect -->
            <div style="position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: radial-gradient(circle at 30% 50%, rgba(232, 62, 140, 0.1) 0%, transparent 50%); pointer-events: none;"></div>
            
            <!-- Content Container -->
            <div style="position: relative; z-index: 10; max-width: 500px;">
              
              <!-- Race Title - Futuristic Style -->
              <div style="margin-bottom: 50px; position: relative;">
                <h1 style="font-size: 42px; margin: 0; color: #fff; font-weight: 900; letter-spacing: 2px; text-shadow: 0 0 30px rgba(232, 62, 140, 0.5); line-height: 1.2;">${ticket.race?.name || 'N/A'}</h1>
                <div style="width: 60px; height: 3px; background: linear-gradient(90deg, #e83e8c, #d633f5); margin-top: 20px;"></div>
              </div>
              
              <!-- Futuristic Card Grid -->
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 40px;">
                
                <!-- Date Card -->
                <div style="background: linear-gradient(135deg, rgba(232, 62, 140, 0.15) 0%, rgba(214, 51, 245, 0.1) 100%); border: 1px solid rgba(232, 62, 140, 0.4); border-radius: 12px; padding: 25px; position: relative; overflow: hidden;">
                  <div style="position: absolute; top: 0; right: 0; width: 100px; height: 100px; background: radial-gradient(circle, rgba(232, 62, 140, 0.2) 0%, transparent 70%); border-radius: 50%;"></div>
                  <div style="font-size: 10px; color: #64c8ff; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 10px; font-weight: 700;">📅 Date</div>
                  <div style="font-size: 24px; color: #fbbf24; font-weight: 900; letter-spacing: 1px;">${formatDate(ticket.race?.date)}</div>
                </div>
                
                <!-- Location Card -->
                <div style="background: linear-gradient(135deg, rgba(100, 200, 255, 0.15) 0%, rgba(74, 222, 128, 0.1) 100%); border: 1px solid rgba(100, 200, 255, 0.4); border-radius: 12px; padding: 25px; position: relative; overflow: hidden;">
                  <div style="position: absolute; top: 0; right: 0; width: 100px; height: 100px; background: radial-gradient(circle, rgba(100, 200, 255, 0.2) 0%, transparent 70%); border-radius: 50%;"></div>
                  <div style="font-size: 10px; color: #4ade80; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 10px; font-weight: 700;">📍 Location</div>
                  <div style="font-size: 18px; color: #4ade80; font-weight: 900; letter-spacing: 0.5px;">${ticket.race?.location || 'N/A'}</div>
                </div>
              </div>
              
              <!-- Price Card - Large Focus -->
              <div style="background: linear-gradient(135deg, rgba(100, 200, 255, 0.2) 0%, rgba(232, 62, 140, 0.15) 100%); border: 2px solid rgba(100, 200, 255, 0.5); border-radius: 12px; padding: 30px; margin-bottom: 40px; position: relative; overflow: hidden;">
                <div style="position: absolute; top: -50px; right: -50px; width: 150px; height: 150px; background: radial-gradient(circle, rgba(100, 200, 255, 0.3) 0%, transparent 70%); border-radius: 50%;"></div>
                <div style="font-size: 10px; color: #64c8ff; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 12px; font-weight: 700;">Price</div>
                <div style="font-size: 48px; color: #64c8ff; font-weight: 900; letter-spacing: 2px;">${ticket.race?.price || '0'} DH</div>
              </div>
              
              <!-- QR Code Section - Futuristic -->
              <div style="background: linear-gradient(135deg, rgba(232, 62, 140, 0.15) 0%, rgba(100, 200, 255, 0.15) 100%); border: 2px solid rgba(232, 62, 140, 0.5); border-radius: 16px; padding: 35px; text-align: center; margin-bottom: 40px; position: relative;">
                <div style="font-size: 12px; color: #64c8ff; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 25px; font-weight: 700;">Scan to Validate</div>
                ${qrHtml}
              </div>
              
              <!-- Footer Line -->
              <div style="border-top: 1px solid rgba(232, 62, 140, 0.3); padding-top: 25px; text-align: center;">
                <p style="font-size: 12px; color: #64c8ff; margin: 0; letter-spacing: 2px; text-transform: uppercase; font-weight: 700;">F1 TANGER RACING • ${new Date().getFullYear()}</p>
              </div>
            </div>
          </div>
        </div>
      `;
      
      document.body.appendChild(tempContainer);
      
      // Wait a moment for rendering
      await new Promise((resolve) => {
        setTimeout(() => {
          resolve();
        }, 200);
      });
      
      // Convert to canvas and then to PDF
      const canvas = await html2canvas(tempContainer, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
        allowTaint: true,
        useCORS: true,
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`F1_TANGER_Ticket_${ticket.id}.pdf`);
      
      // Clean up
      document.body.removeChild(tempContainer);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setTimeout(() => setSelectedTicket(null), 300);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    return timeString.substring(0, 5); // Get only hh:mm
  };

  const getSortedTickets = () => {
    return [...tickets].sort((a, b) => {
      const dateA = new Date(a.race?.date);
      const dateB = new Date(b.race?.date);
      return dateB - dateA; // Most recent first
    });
  };

  const getPaginatedTickets = () => {
    const sortedTickets = getSortedTickets();
    const indexOfLastTicket = currentPage * ticketsPerPage;
    const indexOfFirstTicket = indexOfLastTicket - ticketsPerPage;
    return sortedTickets.slice(indexOfFirstTicket, indexOfLastTicket);
  };

  const getTotalPages = () => {
    return Math.ceil(tickets.length / ticketsPerPage);
  };

  if (loading) {
    return (
      <div className="dashboard-home loading">
        <div className="loader">
          <div className="f1-wheel"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-home">
      <div className="page-header">
        <h1>🎫 My Race Tickets</h1>
        <p>View and manage all your purchased race tickets</p>
      </div>

      {tickets.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🎟️</div>
          <h3>No Tickets Yet</h3>
          <p>You haven't purchased any race tickets yet.</p>
        </div>
      ) : (
        <>
          <div className="tickets-grid">
            {getPaginatedTickets().map((ticket) => (
              <div key={ticket.id} className="ticket-card">
              <div className="ticket-header">
                <h3>{ticket.race?.name || 'Race'}</h3>
                <span className={`ticket-status ${ticket.status}`}>✓ {ticket.status?.charAt(0).toUpperCase() + ticket.status?.slice(1) || 'Active'}</span>
              </div>

              <div className="ticket-body">
                <div className="ticket-detail">
                  <span className="detail-label">📅 Date</span>
                  <span className="detail-value">{formatDate(ticket.race?.date)}</span>
                </div>
                <div className="ticket-detail">
                  <span className="detail-label">📍 Location</span>
                  <span className="detail-value">{ticket.race?.location || 'N/A'}</span>
                </div>
                <div className="ticket-detail">
                  <span className="detail-label">🕐 Start Time</span>
                  <span className="detail-value">{formatTime(ticket.race?.start_time)}</span>
                </div>
                <div className="ticket-detail">
                  <span className="detail-label">💰 Price</span>
                  <span className="detail-value">{ticket.race?.price || '0'} DH</span>
                </div>
              </div>

              <div className="ticket-footer">
                <button 
                  className="ticket-btn"
                  onClick={() => handleViewDetails(ticket)}
                >
                  View Details
                </button>
                <button 
                  className="ticket-btn secondary"
                  onClick={() => handleDownloadTicket(ticket)}
                >
                  Download Ticket
                </button>
              </div>

              {/* Hidden QR Code for download */}
              <div style={{ display: 'none' }}>
                <div id={`qr-code-${ticket.id}`}>
                  <QRCodeSVG value={ticket.ticket_code} size={256} />
                </div>
              </div>
            </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {getTotalPages() > 1 && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '10px',
              marginTop: '30px',
              alignItems: 'center'
            }}>
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
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
                {Array.from({ length: getTotalPages() }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
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
                onClick={() => setCurrentPage(Math.min(getTotalPages(), currentPage + 1))}
                disabled={currentPage === getTotalPages()}
                style={{
                  padding: '10px 16px',
                  background: currentPage === getTotalPages() ? 'rgba(232, 62, 140, 0.2)' : 'linear-gradient(135deg, #e83e8c 0%, #c1316e 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: currentPage === getTotalPages() ? 'not-allowed' : 'pointer',
                  opacity: currentPage === getTotalPages() ? 0.5 : 1,
                  fontWeight: '600'
                }}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}

      {/* Details Modal */}
      {showModal && selectedTicket && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>✕</button>
            
            <div className="modal-header">
              <h2>{selectedTicket.race?.name}</h2>
            </div>

            <div className="modal-body">
              <div className="modal-section">
                <h3>Race Information</h3>
                <div className="modal-row">
                  <span className="label">Location:</span>
                  <span className="value">{selectedTicket.race?.location || 'N/A'}</span>
                </div>
                <div className="modal-row">
                  <span className="label">Date:</span>
                  <span className="value">{selectedTicket.race?.date || 'N/A'}</span>
                </div>
                <div className="modal-row">
                  <span className="label">Start Time:</span>
                  <span className="value">{formatTime(selectedTicket.race?.start_time)}</span>
                </div>
              </div>

              <div className="modal-section">
                <h3>Ticket Information</h3>
                <div className="modal-row">
                  <span className="label">Price:</span>
                  <span className="value">{selectedTicket.race?.price || '0'} DH</span>
                </div>
              </div>

              <div className="modal-section qr-section">
                <h3>QR Code</h3>
                <div className="qr-code-container">
                  <QRCodeSVG 
                    id={`qr-code-${selectedTicket.id}`}
                    value={selectedTicket.ticket_code} 
                    size={250}
                    level="H"
                    includeMargin={true}
                  />
                </div>
              </div>

              <div className="modal-dates">
                <div className="date-item">
                  <span className="date-label">Issue Date</span>
                  <span className="date-value">{selectedTicket.issue_date ? new Date(selectedTicket.issue_date).toLocaleDateString('en-GB') : 'N/A'}</span>
                </div>
                <div className="date-item">
                  <span className="date-label">Expiry Date</span>
                  <span className="date-value">{selectedTicket.expiry_date ? new Date(selectedTicket.expiry_date).toLocaleDateString('en-GB') : 'N/A'}</span>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="modal-btn download"
                onClick={() => {
                  handleDownloadTicket(selectedTicket);
                  closeModal();
                }}
              >
                📥 Download Ticket
              </button>
              <button className="modal-btn cancel" onClick={closeModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ClientTicketsHome;
