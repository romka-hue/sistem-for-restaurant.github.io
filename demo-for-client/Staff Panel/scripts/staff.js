// Staff Panel functionality
document.addEventListener('DOMContentLoaded', function() {
    // Navigation functionality
    const navBtns = document.querySelectorAll('.nav-btn');
    const sections = document.querySelectorAll('.section');
    
    navBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const targetSection = this.dataset.section;
            
            // Update active nav button
            navBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Show target section
            sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === targetSection + '-section') {
                    section.classList.add('active');
                }
            });
            
            // Load section data
            loadSectionData(targetSection);
        });
    });
    
    // Load initial data
    loadSectionData('orders');
    
    // Auto-refresh every 30 seconds
    setInterval(() => {
        const activeSection = document.querySelector('.nav-btn.active').dataset.section;
        loadSectionData(activeSection);
    }, 30000);
});

function loadSectionData(section) {
    switch(section) {
        case 'orders':
            loadOrders();
            break;
        case 'reservations':
            loadReservations();
            break;
        case 'tables':
            loadTables();
            break;
    }
}

// Orders Management
async function loadOrders() {
    try {
        const apiUrl = window.location.protocol === 'file:' 
            ? 'http://localhost:3000/api/orders'
            : '/api/orders';
        
        const response = await fetch(apiUrl);
        const orders = await response.json();
        
        // Filter orders by status
        const pendingOrders = orders.filter(order => order.status === 'pending');
        const preparingOrders = orders.filter(order => order.status === 'preparing');
        const readyOrders = orders.filter(order => order.status === 'ready');
        
        // Update stats
        document.getElementById('pending-orders').textContent = pendingOrders.length;
        document.getElementById('preparing-orders').textContent = preparingOrders.length;
        document.getElementById('ready-orders').textContent = readyOrders.length;
        
        // Display orders in columns
        displayOrdersInColumn('pending-orders-list', pendingOrders, 'pending');
        displayOrdersInColumn('preparing-orders-list', preparingOrders, 'preparing');
        displayOrdersInColumn('ready-orders-list', readyOrders, 'ready');
    } catch (err) {
        console.error('Failed to load orders:', err);
    }
}

function displayOrdersInColumn(containerId, orders, status) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = '';
    
    if (orders.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #7f8c8d; padding: 20px;">No orders</p>';
        return;
    }
    
    orders.forEach(order => {
        const orderCard = document.createElement('div');
        orderCard.className = 'order-card';
        
        // Format order data
        const orderTime = new Date(order.created_at).toLocaleTimeString();
        const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
        const itemsList = items.map(item => `${item.quantity}x ${item.name}`).join(', ');
        
        orderCard.innerHTML = `
            <div class="order-header">
                <span class="order-id">ORD-${order.id}</span>
                <span class="order-time">${orderTime}</span>
            </div>
            <div class="order-customer">${order.customer_name}</div>
            <div class="order-items">${itemsList}</div>
            <div class="order-total">Total: $${parseFloat(order.total).toFixed(2)}</div>
            <div class="order-actions">
                ${getOrderActions(order.id, status)}
            </div>
        `;
        
        container.appendChild(orderCard);
    });
}

function getOrderActions(orderId, status) {
    switch(status) {
        case 'pending':
            return `<button class="action-btn accept-btn" onclick="updateOrderStatus(${orderId}, 'preparing')">Accept</button>`;
        case 'preparing':
            return `<button class="action-btn ready-btn" onclick="updateOrderStatus(${orderId}, 'ready')">Mark Ready</button>`;
        case 'ready':
            return `<button class="action-btn complete-btn" onclick="updateOrderStatus(${orderId}, 'completed')">Complete</button>`;
        default:
            return '';
    }
}

async function updateOrderStatus(orderId, newStatus) {
    try {
        const apiUrl = window.location.protocol === 'file:' 
            ? `http://localhost:3000/api/orders/${orderId}`
            : `/api/orders/${orderId}`;
        
        const response = await fetch(apiUrl, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });
        
        if (response.ok) {
            loadOrders();
        }
    } catch (err) {
        console.error('Failed to update order:', err);
    }
}

// Reservations Management
async function loadReservations() {
    try {
        const apiUrl = window.location.protocol === 'file:' 
            ? 'http://localhost:3000/api/reservations'
            : '/api/reservations';
        
        const response = await fetch(apiUrl);
        const reservations = await response.json();
        
        // Filter reservations
        const today = new Date().toDateString();
        const todayReservations = reservations.filter(res => 
            new Date(res.date).toDateString() === today
        );
        const upcomingReservations = reservations.filter(res => 
            new Date(res.date) > new Date()
        );
        
        // Update stats
        document.getElementById('today-reservations').textContent = todayReservations.length;
        document.getElementById('upcoming-reservations').textContent = upcomingReservations.length;
        
        displayReservations(reservations);
    } catch (err) {
        console.error('Failed to load reservations:', err);
    }
}

function displayReservations(reservations) {
    const container = document.getElementById('reservations-list');
    container.innerHTML = '';
    
    if (reservations.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #7f8c8d; padding: 40px;">No reservations</p>';
        return;
    }
    
    reservations.forEach(reservation => {
        const reservationCard = document.createElement('div');
        reservationCard.className = 'reservation-card';
        
        const reservationDate = new Date(reservation.date).toLocaleDateString();
        
        reservationCard.innerHTML = `
            <div class="reservation-header">
                <span class="reservation-id">RES-${reservation.id}</span>
                <span class="reservation-status status-${reservation.status}">${reservation.status}</span>
            </div>
            <div class="reservation-details">
                <p><strong>Name:</strong> ${reservation.name}</p>
                <p><strong>Phone:</strong> ${reservation.phone}</p>
                <p><strong>Date:</strong> ${reservationDate}</p>
                <p><strong>Time:</strong> ${reservation.time}</p>
                <p><strong>Party Size:</strong> ${reservation.guests} people</p>
            </div>
            ${reservation.status === 'pending' ? `
                <div class="order-actions" style="margin-top: 15px;">
                    <button class="action-btn accept-btn" onclick="updateReservationStatus(${reservation.id}, 'confirmed')">Confirm</button>
                    <button class="action-btn" onclick="updateReservationStatus(${reservation.id}, 'cancelled')" style="background: #e74c3c;">Cancel</button>
                </div>
            ` : ''}
        `;
        
        container.appendChild(reservationCard);
    });
}

async function updateReservationStatus(reservationId, newStatus) {
    try {
        const apiUrl = window.location.protocol === 'file:' 
            ? `http://localhost:3000/api/reservations/${reservationId}`
            : `/api/reservations/${reservationId}`;
        
        const response = await fetch(apiUrl, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });
        
        if (response.ok) {
            loadReservations();
        }
    } catch (err) {
        console.error('Failed to update reservation:', err);
    }
}

// Tables Management
function loadTables() {
    // Sample tables (in real app, this would come from database)
    const tables = [
        { id: 1, capacity: '2-4', status: 'available' },
        { id: 2, capacity: '2-4', status: 'occupied' },
        { id: 3, capacity: '4-6', status: 'reserved' },
        { id: 4, capacity: '6-8', status: 'available' },
        { id: 5, capacity: '2-4', status: 'available' },
        { id: 6, capacity: '4-6', status: 'occupied' },
        { id: 7, capacity: '2-4', status: 'available' },
        { id: 8, capacity: '6-8', status: 'available' }
    ];
    
    const availableTables = tables.filter(table => table.status === 'available').length;
    const occupiedTables = tables.filter(table => table.status === 'occupied').length;
    
    // Update stats
    document.getElementById('available-tables').textContent = availableTables;
    document.getElementById('occupied-tables').textContent = occupiedTables;
    
    displayTables(tables);
}

function displayTables(tables) {
    const container = document.getElementById('tables-grid');
    container.innerHTML = '';
    
    tables.forEach(table => {
        const tableCard = document.createElement('div');
        tableCard.className = `table-card ${table.status}`;
        
        tableCard.innerHTML = `
            <div class="table-number">Table ${table.id}</div>
            <div class="table-capacity">${table.capacity} people</div>
            <div class="table-status ${table.status}">${table.status}</div>
        `;
        
        tableCard.addEventListener('click', () => {
            toggleTableStatus(table.id, table.status);
        });
        
        container.appendChild(tableCard);
    });
}

function toggleTableStatus(tableId, currentStatus) {
    // Simple status cycling for demo
    const statusCycle = {
        'available': 'occupied',
        'occupied': 'available',
        'reserved': 'available'
    };
    
    const newStatus = statusCycle[currentStatus];
    
    // In real app, update database
    console.log(`Table ${tableId} status changed from ${currentStatus} to ${newStatus}`);
    
    // Refresh tables display
    loadTables();
}
