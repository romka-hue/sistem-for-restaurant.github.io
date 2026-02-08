// Copyright (c) 2026 Roman
// Licensed under the GNU Affero General Public License v3.0

// Admin Dashboard functionality
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
    
    // Modal functionality
    const modal = document.getElementById('add-item-modal');
    const closeModal = document.querySelector('.close');
    const addItemForm = document.getElementById('add-item-form');
    
    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    addItemForm.addEventListener('submit', function(e) {
        e.preventDefault();
        addMenuItem();
    });
    
    // Load initial data
    loadSectionData('overview');
});

function loadSectionData(section) {
    switch(section) {
        case 'overview':
            loadOverviewData();
            break;
        case 'menu':
            loadMenuManagement();
            break;
        case 'analytics':
            loadAnalytics();
            break;
        case 'settings':
            loadSettings();
            break;
    }
}

// Overview Section
function loadOverviewData() {
    const orders = JSON.parse(localStorage.getItem('restaurantOrders')) || [];
    const reservations = JSON.parse(localStorage.getItem('restaurantReservations')) || [];
    
    // Calculate stats
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = orders.length;
    const totalReservations = reservations.length;
    const uniqueCustomers = new Set(orders.map(order => order.customer.phone)).size;
    
    // Update stats display
    document.getElementById('total-revenue').textContent = `$${totalRevenue.toFixed(2)}`;
    document.getElementById('total-orders').textContent = totalOrders;
    document.getElementById('total-reservations').textContent = totalReservations;
    document.getElementById('total-customers').textContent = uniqueCustomers;
    
    // Load popular items
    loadPopularItems(orders);
    
    // Load recent orders
    loadRecentOrders(orders);
}

function loadPopularItems(orders) {
    const itemCounts = {};
    const itemRevenue = {};
    
    orders.forEach(order => {
        order.items.forEach(item => {
            const itemName = item.name;
            itemCounts[itemName] = (itemCounts[itemName] || 0) + item.quantity;
            itemRevenue[itemName] = (itemRevenue[itemName] || 0) + (item.price * item.quantity);
        });
    });
    
    const popularItems = Object.keys(itemCounts)
        .map(name => ({
            name,
            orders: itemCounts[name],
            revenue: itemRevenue[name]
        }))
        .sort((a, b) => b.orders - a.orders)
        .slice(0, 5);
    
    const container = document.getElementById('popular-items');
    container.innerHTML = '';
    
    if (popularItems.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #7f8c8d;">No data available</p>';
        return;
    }
    
    popularItems.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'popular-item';
        itemElement.innerHTML = `
            <div class="item-info">
                <div class="item-name">${item.name}</div>
                <div class="item-orders">${item.orders} orders</div>
            </div>
            <div class="item-revenue">$${item.revenue.toFixed(2)}</div>
        `;
        container.appendChild(itemElement);
    });
}

function loadRecentOrders(orders) {
    const recentOrders = orders
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 5);
    
    const container = document.getElementById('recent-orders');
    container.innerHTML = '';
    
    if (recentOrders.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #7f8c8d;">No orders yet</p>';
        return;
    }
    
    recentOrders.forEach(order => {
        const orderElement = document.createElement('div');
        orderElement.className = 'recent-order';
        
        const orderTime = new Date(order.timestamp).toLocaleTimeString();
        
        orderElement.innerHTML = `
            <div class="order-info">
                <div class="order-customer">${order.customer.name}</div>
                <div class="order-time">${orderTime}</div>
            </div>
            <div class="order-amount">$${order.total.toFixed(2)}</div>
        `;
        container.appendChild(orderElement);
    });
}

// Menu Management Section
function loadMenuManagement() {
    const menuItems = getMenuItems();
    
    // Display items by category
    displayMenuItemsByCategory('appetizers', menuItems.appetizers);
    displayMenuItemsByCategory('main-courses', menuItems.mainCourses);
    displayMenuItemsByCategory('desserts', menuItems.desserts);
}

function getMenuItems() {
    // Sample menu items (in real app, this would come from database)
    return {
        appetizers: [
            { id: 1, name: 'Pkhali', description: 'Traditional Georgian vegetable pâté with walnuts and spices', price: 8 },
            { id: 2, name: 'Badrijani Nigvzit', description: 'Fried eggplant rolls with walnut paste and pomegranate', price: 10 }
        ],
        mainCourses: [
            { id: 3, name: 'Khachapuri', description: 'Traditional cheese-filled bread with butter and egg', price: 14 },
            { id: 4, name: 'Khinkali', description: 'Georgian dumplings filled with spiced meat and broth', price: 16 }
        ],
        desserts: [
            { id: 5, name: 'Churchkhela', description: 'Traditional Georgian candy made with grape must and walnuts', price: 6 },
            { id: 6, name: 'Pelamushi', description: 'Georgian grape pudding with a sweet and tangy flavor', price: 5 }
        ]
    };
}

function displayMenuItemsByCategory(category, items) {
    const container = document.getElementById(`${category}-items`);
    container.innerHTML = '';
    
    items.forEach(item => {
        const itemCard = document.createElement('div');
        itemCard.className = 'menu-item-card';
        itemCard.innerHTML = `
            <div class="item-actions">
                <button class="edit-btn" onclick="editMenuItem(${item.id})">Edit</button>
                <button class="delete-btn" onclick="deleteMenuItem(${item.id})">Delete</button>
            </div>
            <h4>${item.name}</h4>
            <p>${item.description}</p>
            <div class="menu-item-price">$${item.price}</div>
        `;
        container.appendChild(itemCard);
    });
}

function showAddItemModal() {
    document.getElementById('add-item-modal').style.display = 'block';
}

function addMenuItem() {
    const name = document.getElementById('item-name').value;
    const description = document.getElementById('item-description').value;
    const price = parseFloat(document.getElementById('item-price').value);
    const category = document.getElementById('item-category').value;
    
    // In real app, save to database
    console.log('Adding menu item:', { name, description, price, category });
    
    // Close modal and reset form
    document.getElementById('add-item-modal').style.display = 'none';
    document.getElementById('add-item-form').reset();
    
    // Refresh menu display
    loadMenuManagement();
    
    alert('Menu item added successfully!');
}

function editMenuItem(itemId) {
    // In real app, open edit modal with item data
    console.log('Editing item:', itemId);
    alert('Edit functionality would open here');
}

function deleteMenuItem(itemId) {
    if (confirm('Are you sure you want to delete this menu item?')) {
        // In real app, delete from database
        console.log('Deleting item:', itemId);
        loadMenuManagement();
        alert('Menu item deleted successfully!');
    }
}

// Analytics Section
function loadAnalytics() {
    const orders = JSON.parse(localStorage.getItem('restaurantOrders')) || [];
    
    if (orders.length === 0) {
        // Show default values
        document.getElementById('daily-average').textContent = '$0';
        document.getElementById('weekly-growth').textContent = '0%';
        document.getElementById('monthly-total').textContent = '$0';
        document.getElementById('repeat-customers').textContent = '0';
        document.getElementById('avg-order-value').textContent = '$0';
        return;
    }
    
    // Calculate analytics
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const avgOrderValue = totalRevenue / orders.length;
    
    // Simple calculations for demo
    const dailyAverage = totalRevenue / 30; // Assuming 30 days
    const weeklyGrowth = 15; // Mock growth percentage
    const monthlyTotal = totalRevenue;
    
    // Customer analytics
    const uniqueCustomers = new Set(orders.map(order => order.customer.phone));
    const repeatCustomers = orders.length - uniqueCustomers.size;
    
    // Update display
    document.getElementById('daily-average').textContent = `$${dailyAverage.toFixed(2)}`;
    document.getElementById('weekly-growth').textContent = `${weeklyGrowth}%`;
    document.getElementById('monthly-total').textContent = `$${monthlyTotal.toFixed(2)}`;
    document.getElementById('repeat-customers').textContent = repeatCustomers;
    document.getElementById('avg-order-value').textContent = `$${avgOrderValue.toFixed(2)}`;
}

// Settings Section
function loadSettings() {
    // Settings are mostly static for this demo
    console.log('Settings loaded');
}

// Add some sample data for demo
function addSampleData() {
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
                status: 'completed',
                total: 36,
                timestamp: new Date(Date.now() - 86400000).toISOString() // Yesterday
            },
            {
                id: 'ORD-002',
                customer: { name: 'Jane Smith', phone: '+995 555 0002' },
                items: [
                    { name: 'Khinkali', quantity: 1, price: 16 },
                    { name: 'Pkhali', quantity: 1, price: 8 }
                ],
                status: 'completed',
                total: 24,
                timestamp: new Date(Date.now() - 43200000).toISOString() // 12 hours ago
            },
            {
                id: 'ORD-003',
                customer: { name: 'Bob Johnson', phone: '+995 555 0003' },
                items: [
                    { name: 'Churchkhela', quantity: 3, price: 6 }
                ],
                status: 'completed',
                total: 18,
                timestamp: new Date(Date.now() - 7200000).toISOString() // 2 hours ago
            }
        ];
        localStorage.setItem('restaurantOrders', JSON.stringify(sampleOrders));
    }
}

// Initialize sample data
addSampleData();