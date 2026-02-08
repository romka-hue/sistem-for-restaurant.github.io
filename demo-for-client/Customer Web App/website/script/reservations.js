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
    reservationForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = {
            id: 'RES-' + Date.now(),
            customer: {
                name: document.getElementById('guest-name').value,
                phone: document.getElementById('guest-phone').value
            },
            date: document.getElementById('reservation-date').value,
            time: document.getElementById('reservation-time').value,
            partySize: document.getElementById('party-size').value,
            tablePreference: document.getElementById('table-preference').value,
            specialRequests: document.getElementById('special-requests').value,
            selectedTable: selectedTable,
            status: 'pending',
            timestamp: new Date().toISOString()
        };
        
        // Save reservation to localStorage (in real app, send to server)
        let reservations = JSON.parse(localStorage.getItem('restaurantReservations')) || [];
        reservations.push(formData);
        localStorage.setItem('restaurantReservations', JSON.stringify(reservations));
        
        // Show confirmation
        showConfirmation(formData);
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
            <p><strong>Name:</strong> ${reservationData.customer.name}</p>
            <p><strong>Phone:</strong> ${reservationData.customer.phone}</p>
            <p><strong>Date:</strong> ${formattedDate}</p>
            <p><strong>Time:</strong> ${reservationData.time}</p>
            <p><strong>Party Size:</strong> ${reservationData.partySize} ${reservationData.partySize === '1' ? 'person' : 'people'}</p>
            ${reservationData.selectedTable ? `<p><strong>Table:</strong> Table ${reservationData.selectedTable}</p>` : ''}
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