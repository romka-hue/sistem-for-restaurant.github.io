// Copyright (c) 2026 Roman
// Licensed under the GNU Affero General Public License v3.0

// Reservations functionality
document.addEventListener('DOMContentLoaded', function() {
    const reservationForm = document.getElementById('reservation-form');
    const confirmationModal = document.getElementById('confirmation-modal');
    const closeModal = document.querySelector('.close');
    const dateInput = document.getElementById('reservation-date');
    const tableCards = document.querySelectorAll('.table-card');
    
    let selectedTable = null;
    
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
    
    // Table   
    tableCards.forEach(card => {
        card.addEventListener('click', function() {
            const tableStatus = this.querySelector('.status');
            if (tableStatus.classList.contains('available')) {
                // Remove previous selection
                tableCards.forEach(c => c.classList.remove('selected'));
                // Select current table
                this.classList.add('selected');
                selectedTable = this.dataset.table;
            }
        });
    });
    
    // Update available tables based on date and time
    function updateAvailableTables() {
        const date = dateInput.value;
        const time = document.getElementById('reservation-time').value;
        
        if (date && time) {
            // Simulate checking availability (in real app, check with server)
            tableCards.forEach(card => {
                const status = card.querySelector('.status');
                // Random availability for demo
                const isAvailable = Math.random() > 0.3;
                
                if (isAvailable) {
                    status.textContent = 'Available';
                    status.className = 'status available';
                    card.style.opacity = '1';
                    card.style.pointerEvents = 'auto';
                } else {
                    status.textContent = 'Reserved';
                    status.className = 'status reserved';
                    card.style.opacity = '0.6';
                    card.style.pointerEvents = 'none';
                    card.classList.remove('selected');
                }
            });
        }
    }
    
    // Listen for date/time changes
    dateInput.addEventListener('change', updateAvailableTables);
    document.getElementById('reservation-time').addEventListener('change', updateAvailableTables);
    
    // Form submission
    reservationForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('guest-name').value,
            email: document.getElementById('guest-email')?.value || '',
            phone: document.getElementById('guest-phone').value,
            date: document.getElementById('reservation-date').value,
            time: document.getElementById('reservation-time').value,
            guests: parseInt(document.getElementById('party-size').value)
        };
        
        try {
            // Detect if running through server or file://
            const apiUrl = window.location.protocol === 'file:' 
                ? 'http://localhost:3000/api/reservations'
                : '/api/reservations';
            
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Server error');
            }
            
            const result = await response.json();
            
            if (result.success) {
                showConfirmation(result.reservation);
            } else {
                alert('Reservation failed: ' + (result.error || 'Unknown error'));
            }
        } catch (err) {
            console.error('Reservation error:', err);
            alert('Failed to make reservation: ' + err.message + '\n\nMake sure the server is running at http://localhost:3000');
        }
    });
    
    function showConfirmation(reservationData) {
        const detailsContainer = document.getElementById('reservation-details');
        const date = new Date(reservationData.date);
        const formattedDate = date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        detailsContainer.innerHTML = `
            <h4>Reservation Submitted</h4>
            <p style="color: #f39c12; margin-bottom: 15px;">⏳ Your reservation is pending confirmation. Our staff will call you shortly to confirm.</p>
            <p><strong>Name:</strong> ${reservationData.name}</p>
            <p><strong>Phone:</strong> ${reservationData.phone}</p>
            <p><strong>Date:</strong> ${formattedDate}</p>
            <p><strong>Time:</strong> ${reservationData.time}</p>
            <p><strong>Party Size:</strong> ${reservationData.guests} ${reservationData.guests === 1 ? 'person' : 'people'}</p>
            <p><strong>Reservation ID:</strong> ${reservationData.id}</p>
        `;
        
        confirmationModal.style.display = 'block';
        
        // Reset form
        reservationForm.reset();
        tableCards.forEach(card => card.classList.remove('selected'));
        selectedTable = null;
    }
    
    // Modal close functionality
    closeModal.addEventListener('click', function() {
        confirmationModal.style.display = 'none';
    });
    
    window.addEventListener('click', function(event) {
        if (event.target === confirmationModal) {
            confirmationModal.style.display = 'none';
        }
    });
    
    // Update cart count if cart.js is loaded
    if (typeof updateCartCount === 'function') {
        updateCartCount();
    }
});