// Copyright (c) 2026 Roman
// Licensed under the GNU Affero General Public License v3.0

// Data Export/Import Utility
function exportData() {
    const data = {
        orders: JSON.parse(localStorage.getItem('restaurantOrders')) || [],
        reservations: JSON.parse(localStorage.getItem('restaurantReservations')) || [],
        cart: JSON.parse(localStorage.getItem('restaurantCart')) || []
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `restaurant-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
}

function importData(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = JSON.parse(e.target.result);
                localStorage.setItem('restaurantOrders', JSON.stringify(data.orders || []));
                localStorage.setItem('restaurantReservations', JSON.stringify(data.reservations || []));
                localStorage.setItem('restaurantCart', JSON.stringify(data.cart || []));
                alert('Data imported successfully!');
                location.reload();
            } catch (error) {
                alert('Invalid file format');
            }
        };
        reader.readAsText(file);
    }
}

// Add to any page
function addDataControls() {
    const controls = document.createElement('div');
    controls.innerHTML = `
        <button onclick="exportData()">Export Data</button>
        <input type="file" id="import-file" accept=".json" onchange="importData(event)">
        <button onclick="document.getElementById('import-file').click()">Import Data</button>
    `;
    document.body.appendChild(controls);
}