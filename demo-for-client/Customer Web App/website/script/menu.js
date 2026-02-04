document.addEventListener('DOMContentLoaded', () => {
    // dynamic nav offset for sticky elements and anchor offsets
    const navEl = document.querySelector('nav');
    const setNavOffset = () => {
        const h = navEl ? navEl.offsetHeight : 60;
        document.documentElement.style.setProperty('--nav-offset', `${h}px`);
    };
    setNavOffset();
    window.addEventListener('resize', setNavOffset);

    // Toggle TOC nav on small screens
    const tocToggle = document.querySelector('.toc-toggle');
    const tocNav = document.querySelector('.toc-nav');

    if (tocToggle && tocNav) {
        tocToggle.addEventListener('click', () => {
            tocNav.classList.toggle('open');
            tocNav.style.display = tocNav.classList.contains('open') ? 'flex' : '';
        });
    }

    // Build category buttons dynamically from existing categories
    const menuToc = document.querySelector('.menu-toc');
    const categories = Array.from(document.querySelectorAll('.menu-category'));

    if (menuToc && categories.length) {
        const btnWrap = document.createElement('div');
        btnWrap.className = 'category-buttons';

        const allBtn = document.createElement('button');
        allBtn.className = 'btn-cat active';
        allBtn.textContent = 'All';
        allBtn.setAttribute('data-cat', 'all');
        allBtn.setAttribute('data-i18n', 'menu.categories.all');
        btnWrap.appendChild(allBtn);

        categories.forEach(cat => {
            const id = cat.id || cat.querySelector('h2')?.textContent.toLowerCase().replace(/\s+/g, '-');
            const title = cat.querySelector('h2')?.textContent || id;
            const btn = document.createElement('button');
            btn.className = 'btn-cat';
            btn.textContent = title;
            btn.setAttribute('data-cat', id);
            btn.setAttribute('data-i18n', `menu.categories.${id}`);
            btnWrap.appendChild(btn);
        });

        menuToc.appendChild(btnWrap);

        // add an empty-state message (hidden when there are visible categories)
        const emptyEl = document.createElement('div');
        emptyEl.className = 'menu-empty hidden';
        emptyEl.setAttribute('data-i18n', 'menu.noResults');
        emptyEl.textContent = 'No items found';
        menuToc.appendChild(emptyEl);

        function updateEmptyState() {
            const visible = categories.some(c => !c.classList.contains('hidden'));
            emptyEl.classList.toggle('hidden', visible);
        }

        // ensure dynamically created buttons are translated according to saved language
        if (window.applyLanguage) window.applyLanguage(localStorage.getItem('site-lang') || 'en');

        // Filtering behavior
        btnWrap.addEventListener('click', (e) => {
            const clicked = e.target.closest('.btn-cat');
            if (!clicked) return;

            // update active state
            btnWrap.querySelectorAll('.btn-cat').forEach(b => b.classList.remove('active'));
            clicked.classList.add('active');

            const cat = clicked.getAttribute('data-cat');
            if (cat === 'all') {
                categories.forEach(c => c.classList.remove('hidden'));
                updateEmptyState();
            } else {
                categories.forEach(c => {
                    if ((c.id && c.id === cat) || (c.querySelector('h2') && c.querySelector('h2').textContent === clicked.textContent)) {
                        c.classList.remove('hidden');
                    } else {
                        c.classList.add('hidden');
                    }
                });

                // scroll to the visible category for easier navigation
                const firstVisible = document.querySelector('.menu-category:not(.hidden)');
                if (firstVisible) firstVisible.scrollIntoView({ behavior: 'smooth', block: 'start' });
                updateEmptyState();
            }
        });
    }

    // Close TOC nav if a link is clicked (mobile friendly)
    document.querySelectorAll('.toc-nav a').forEach(a => {
        a.addEventListener('click', () => {
            if (tocNav) {
                tocNav.classList.remove('open');
                tocNav.style.display = '';
            }
        });
    });

    // Image modal for menu cards (click to zoom)
    let modal = document.querySelector('.modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = '<span class="close">&times;</span><div class="modal-content"><img src="" alt=""></div>';
        document.body.appendChild(modal);
    }
    const modalImg = modal.querySelector('img');
    const closeBtn = modal.querySelector('.close');

    document.querySelectorAll('.menu-card img').forEach(img => {
        img.style.cursor = 'zoom-in';
        img.addEventListener('click', () => {
            modalImg.src = img.src;
            modalImg.alt = img.alt || '';
            modal.style.display = 'block';
        });
    });

    closeBtn.addEventListener('click', () => modal.style.display = 'none');
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });

    // Add to cart functionality
    addCartButtons();
    updateCartCount();
});

// Add cart buttons to menu items
function addCartButtons() {
    const menuItems = document.querySelectorAll('.menu-item');
    
    menuItems.forEach((item, index) => {
        const menuCard = item.querySelector('.menu-card');
        const itemHeader = item.querySelector('.item-header');
        const name = item.querySelector('h3').textContent;
        const description = item.querySelector('p').textContent;
        const priceText = item.querySelector('.price').textContent;
        const price = parseFloat(priceText.replace('$', ''));
        const image = item.querySelector('img').src;
        
        // Create add to cart button
        const addToCartBtn = document.createElement('button');
        addToCartBtn.className = 'add-to-cart-btn';
        addToCartBtn.textContent = 'Add to Cart';
        addToCartBtn.onclick = function() {
            const itemData = {
                id: `item-${index}`,
                name: name,
                description: description,
                price: price,
                image: image
            };
            addToCart(itemData);
            
            // Visual feedback
            addToCartBtn.textContent = 'Added!';
            addToCartBtn.style.background = '#27ae60';
            setTimeout(() => {
                addToCartBtn.textContent = 'Add to Cart';
                addToCartBtn.style.background = '';
            }, 1000);
        };
        
        // Add button to menu card
        const cardContent = item.querySelector('.menu-card-content');
        cardContent.appendChild(addToCartBtn);
    });
}

// Cart functions (will be loaded from cart.js)
function addToCart(item) {
    let cart = JSON.parse(localStorage.getItem('restaurantCart')) || [];
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...item, quantity: 1 });
    }
    
    localStorage.setItem('restaurantCart', JSON.stringify(cart));
    updateCartCount();
}

function updateCartCount() {
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        const cart = JSON.parse(localStorage.getItem('restaurantCart')) || [];
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
    }
}
