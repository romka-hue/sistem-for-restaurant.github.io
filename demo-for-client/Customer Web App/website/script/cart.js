// Copyright (c) 2026 Roman
// Licensed under the GNU Affero General Public License v3.0

// Cart functionality
let cart = JSON.parse(localStorage.getItem('restaurantCart')) || [];

// Update cart count in navigation
function updateCartCount() {
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
    }
}

// Add item to cart
function addToCart(item) {
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...item,
            quantity: 1
        });
    }
    
    localStorage.setItem('restaurantCart', JSON.stringify(cart));
    updateCartCount();
    displayCart();
}

// Remove item from cart
function removeFromCart(itemId) {
    cart = cart.filter(item => item.id !== itemId);
    localStorage.setItem('restaurantCart', JSON.stringify(cart));
    updateCartCount();
    displayCart();
}

// Update item quantity
function updateQuantity(itemId, change) {
    const item = cart.find(cartItem => cartItem.id === itemId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(itemId);
        } else {
            localStorage.setItem('restaurantCart', JSON.stringify(cart));
            displayCart();
        }
    }
}

// Display cart items 
function displayCart() { 
    const cartItemsContainer = document.getElementById('cart-items');
    const subtotalElement = document.getElementById('subtotal');
    const taxElement = document.getElementById('tax');
    const totalElement = document.getElementById('total');
    const checkoutBtn = document.getElementById('checkout-btn');
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
        subtotalElement.textContent = '$0.00';
        taxElement.textContent = '$0.00';
        totalElement.textContent = '$0.00';
        checkoutBtn.disabled = true;
        return;
    }
    
    let subtotal = 0;
    cartItemsContainer.innerHTML = '';
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        
        const cartItemElement = document.createElement('div');
        cartItemElement.className = 'cart-item';
        cartItemElement.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <div class="item-details">
                <h4>${item.name}</h4>
                <p>${item.description}</p>
            </div>
            <div class="quantity-controls">
                <button class="quantity-btn" onclick="updateQuantity('${item.id}', -1)">-</button>
                <span class="quantity">${item.quantity}</span>
                <button class="quantity-btn" onclick="updateQuantity('${item.id}', 1)">+</button>
            </div>
            <div class="item-price">$${itemTotal.toFixed(2)}</div>
            <button class="remove-item" onclick="removeFromCart('${item.id}')">Remove</button>
        `;
        cartItemsContainer.appendChild(cartItemElement);
    });
    
    const tax = subtotal * 0.1;
    const total = subtotal + tax;
    
    subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
    taxElement.textContent = `$${tax.toFixed(2)}`;
    totalElement.textContent = `$${total.toFixed(2)}`;
    checkoutBtn.disabled = false;
}

// Checkout functionality
document.addEventListener('DOMContentLoaded', function() {
    updateCartCount();
    displayCart();
    
    const checkoutBtn = document.getElementById('checkout-btn');
    const checkoutModal = document.getElementById('checkout-modal');
    const closeModal = document.querySelector('.close');
    const checkoutForm = document.getElementById('checkout-form');
    
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
            checkoutModal.style.display = 'block';
        });
    }
    
    if (closeModal) {
        closeModal.addEventListener('click', function() {
            checkoutModal.style.display = 'none';
        });
    }
    
    window.addEventListener('click', function(event) {
        if (event.target === checkoutModal) {
            checkoutModal.style.display = 'none';
        }
    });
    
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const orderData = {
                id: 'ORD-' + Date.now(),
                customer: {
                    name: document.getElementById('customer-name').value,
                    phone: document.getElementById('customer-phone').value,
                    address: document.getElementById('delivery-address').value
                },
                items: cart,
                orderType: document.getElementById('order-type').value,
                subtotal: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
                tax: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) * 0.1,
                total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) * 1.1,
                status: 'pending',
                timestamp: new Date().toISOString()
            };
            
            // Save order to localStorage (in real app, send to server)
            let orders = JSON.parse(localStorage.getItem('restaurantOrders')) || [];
            orders.push(orderData);
            localStorage.setItem('restaurantOrders', JSON.stringify(orders));
            
            // Clear cart
            cart = [];
            localStorage.setItem('restaurantCart', JSON.stringify(cart));
            
            // Show success message
            alert(`Order placed successfully! Order ID: ${orderData.id}`);
            
            // Close modal and refresh page
            checkoutModal.style.display = 'none';
            window.location.reload();
        });
    }
});

// Export functions for use in other files
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateQuantity = updateQuantity;