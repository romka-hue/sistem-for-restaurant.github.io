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
function loadOrders() {
    const orders = JSON.parse(localStorage.getItem('restaurantOrders')) || [];
    
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
}

function displayOrdersInColumn(containerId, orders, status) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    if (orders.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #7f8c8d; padding: 20px;">No orders</p>';
        return;
    }
    
    orders.forEach(order => {
        const orderCard = document.createElement('div');
        orderCard.className = 'order-card';
        
        const orderTime = new Date(order.timestamp).toLocaleTimeString();
        const itemsList = order.items.map(item => `${item.quantity}x ${item.name}`).join(', ');
        
        orderCard.innerHTML = `
            <div class="order-header">
                <span class="order-id">${order.id}</span>
                <span class="order-time">${orderTime}</span>
            </div>
            <div class="order-customer">${order.customer.name}</div>
            <div class="order-items">${itemsList}</div>
            <div class="order-total">Total: $${order.total.toFixed(2)}</div>
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
            return `<button class="action-btn accept-btn" onclick="updateOrderStatus('${orderId}', 'preparing')">Accept</button>`;
        case 'preparing':
            return `<button class="action-btn ready-btn" onclick="updateOrderStatus('${orderId}', 'ready')">Mark Ready</button>`;
        case 'ready':
            return `<button class="action-btn complete-btn" onclick="updateOrderStatus('${orderId}', 'completed')">Complete</button>`;
        default:
            return '';
    }
}

function updateOrderStatus(orderId, newStatus) {
    let orders = JSON.parse(localStorage.getItem('restaurantOrders')) || [];
    const orderIndex = orders.findIndex(order => order.id === orderId);
    
    if (orderIndex !== -1) {
        orders[orderIndex].status = newStatus;
        localStorage.setItem('restaurantOrders', JSON.stringify(orders));
        loadOrders(); // Refresh the display
    }
}

// Reservations Management
function loadReservations() {
    const reservations = JSON.parse(localStorage.getItem('restaurantReservations')) || [];
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
    
    // Display reservations
    displayReservations(reservations);
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
                <span class="reservation-id">${reservation.id}</span>
                <span class="reservation-status status-${reservation.status}">${reservation.status}</span>
            </div>
            <div class="reservation-details">
                <p><strong>Name:</strong> ${reservation.customer.name}</p>
                <p><strong>Phone:</strong> ${reservation.customer.phone}</p>
                <p><strong>Date:</strong> ${reservationDate}</p>
                <p><strong>Time:</strong> ${reservation.time}</p>
                <p><strong>Party Size:</strong> ${reservation.partySize} people</p>
                ${reservation.selectedTable ? `<p><strong>Table:</strong> ${reservation.selectedTable}</p>` : ''}
                ${reservation.specialRequests ? `<p><strong>Special Requests:</strong> ${reservation.specialRequests}</p>` : ''}
            </div>
        `;
        
        container.appendChild(reservationCard);
    });
}

// Tables Management
function loadTables() {
    // Generate sample tables (in real app, this would come from database)
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
    
    // Display tables
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

// Add some sample data for demo
function addSampleData() {
    // Add sample orders if none exist
    const existingOrders = JSON.parse(localStorage.getItem('restaurantOrders')) || [];
    if (existingOrders.length === 0) {
        const sampleOrders = [
            {
                id: 'ORD-001',
                customer: { name: 'John Doe', phone: '+995 555 0001' },
                items: [
                    { name: 'Khachapuri', quantity: 2, price: 14 },
                    { name: 'Georgian Wine', quantity: 1, price: 8 }
                ],
                status: 'pending',
                total: 36,
                timestamp: new Date().toISOString()
            },
            {
                id: 'ORD-002',
                customer: { name: 'Jane Smith', phone: '+995 555 0002' },
                items: [
                    { name: 'Khinkali', quantity: 1, price: 16 }
                ],
                status: 'preparing',
                total: 16,
                timestamp: new Date(Date.now() - 600000).toISOString()
            }
        ];
        localStorage.setItem('restaurantOrders', JSON.stringify(sampleOrders));
    }
    
    // Add sample reservations if none exist
    const existingReservations = JSON.parse(localStorage.getItem('restaurantReservations')) || [];
    if (existingReservations.length === 0) {
        const sampleReservations = [
            {
                id: 'RES-001',
                customer: { name: 'Alice Johnson', phone: '+995 555 0003' },
                date: new Date().toISOString().split('T')[0],
                time: '19:00',
                partySize: '4',
                status: 'confirmed',
                selectedTable: '3'
            }
        ];
        localStorage.setItem('restaurantReservations', JSON.stringify(sampleReservations));
    }
}

// Initialize sample data
addSampleData();