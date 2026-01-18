// ================================================
// UTILITY FUNCTIONS (Must be first)
// ================================================

function saveToLocalStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
        console.error('Error saving to localStorage:', e);
    }
}

function loadFromLocalStorage(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (e) {
        console.error('Error loading from localStorage:', e);
        return null;
    }
}

// ================================================
// CONFIGURATION & DATA
// ================================================

const APP_ID = 'cardapio-gourmet-express';
const WHATSAPP_NUMBER = '5511972746345'; // Altere para o número desejado

const CATEGORIES = [
    { id: 'burgers', name: 'Burgers Artesanais', icon: '🍔' },
    { id: 'sides', name: 'Acompanhamentos', icon: '🍟' },
    { id: 'drinks', name: 'Bebidas', icon: '🥤' },
    { id: 'desserts', name: 'Sobremesas', icon: '🍰' },
];

// Default products
const DEFAULT_PRODUCTS = [
    {
        id: 1,
        category: 'burgers',
        name: 'Double Bacon Cheese',
        description: 'Dois blends de 160g, muito bacon crocante e cheddar cremoso.',
        price: 42.00,
        image: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&q=80&w=400'
    },
    {
        id: 2,
        category: 'burgers',
        name: 'Classic Onion',
        description: 'Blend bovino, cebola caramelizada, queijo prato e maionese da casa.',
        price: 34.90,
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=400'
    },
    {
        id: 3,
        category: 'sides',
        name: 'Batata Rústica',
        description: 'Porção individual de batatas fritas com alecrim e páprica.',
        price: 18.00,
        image: 'https://images.unsplash.com/photo-1630384066252-19e1ed95536a?auto=format&fit=crop&q=80&w=400'
    },
    {
        id: 4,
        category: 'drinks',
        name: 'Soda Italiana Maçã Verde',
        description: 'Refrescante soda artesanal de maçã verde com gelo.',
        price: 14.00,
        image: 'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&q=80&w=400'
    },
    {
        id: 5,
        category: 'desserts',
        name: 'Brownie com Sorvete',
        description: 'Brownie de chocolate belga morno com sorvete de baunilha.',
        price: 22.00,
        image: 'https://images.unsplash.com/photo-1624353339560-b42ed99945b3?auto=format&fit=crop&q=80&w=400'
    },
];

// Default hours
const DEFAULT_HOURS = [
    { day: 'Domingo', open: '12:00', close: '23:00', closed: false },
    { day: 'Segunda', open: '18:00', close: '23:00', closed: false },
    { day: 'Terça', open: '18:00', close: '23:00', closed: false },
    { day: 'Quarta', open: '18:00', close: '23:00', closed: false },
    { day: 'Quinta', open: '18:00', close: '23:00', closed: false },
    { day: 'Sexta', open: '18:00', close: '00:00', closed: false },
    { day: 'Sábado', open: '12:00', close: '00:00', closed: false },
];

// Load products from localStorage or use defaults
let PRODUCTS = loadFromLocalStorage('products') || [...DEFAULT_PRODUCTS];

// ================================================
// STATE MANAGEMENT
// ================================================

let state = {
    currentView: 'menu',
    activeCategory: 'burgers',
    cart: [],
    orders: [],
    isLoading: false
};

// ================================================
// MORE UTILITY FUNCTIONS
// ================================================

function formatPrice(price) {
    return price.toFixed(2).replace('.', ',');
}

function getStatusLabel(status) {
    const labels = {
        pending: 'Pendente',
        preparing: 'Preparando',
        ready: 'Pronto',
        delivered: 'Entregue'
    };
    return labels[status] || status;
}

function getStatusClass(status) {
    const classes = {
        pending: 'pending',
        preparing: 'preparing',
        ready: 'ready',
        delivered: 'delivered'
    };
    return classes[status] || '';
}

// ================================================
// VIEW SWITCHING
// ================================================

function switchView(viewName) {
    state.currentView = viewName;
    const views = document.querySelectorAll('.view');
    views.forEach(view => {
        view.classList.remove('active');
    });

    const targetView = document.getElementById(`${viewName}View`);
    if (targetView) {
        targetView.classList.add('active');
    }

    if (viewName === 'admin') {
        renderAdminDashboard();
    } else if (viewName === 'config') {
        renderConfigView();
    }
}

// ================================================
// CATEGORY MANAGEMENT
// ================================================

function setActiveCategory(categoryId) {
    state.activeCategory = categoryId;

    // Update category buttons
    const categoryButtons = document.querySelectorAll('.category-btn');
    categoryButtons.forEach(btn => {
        if (btn.dataset.category === categoryId) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Render products for this category
    renderProducts();
}

// ================================================
// BUSINESS INFO RENDERING
// ================================================

function renderBusinessInfo() {
    const businessInfoContainer = document.getElementById('businessInfo');
    if (!businessInfoContainer) return;

    const hours = loadFromLocalStorage('hours') || DEFAULT_HOURS;
    const today = new Date().getDay(); // 0 = Domingo, 1 = Segunda, etc.
    const todayInfo = hours[today];

    const hoursHTML = hours.map((day, index) => {
        const isToday = index === today;
        const statusText = day.closed ? 'Fechado' : `${day.open} - ${day.close}`;
        return `
            <div class="info-hours-item ${isToday ? 'today' : ''}">
                <span class="info-hours-day">${day.day}</span>
                <span class="info-hours-time ${day.closed ? 'closed' : ''}">${statusText}</span>
            </div>
        `;
    }).join('');

    businessInfoContainer.innerHTML = `
        <div class="business-info-card">
            <div class="info-section">
                <h3 class="info-title">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12 6 12 12 16 14"/>
                    </svg>
                    Horário de Funcionamento
                </h3>
                <div class="info-hours-list">
                    ${hoursHTML}
                </div>
            </div>
            <div class="info-section">
                <h3 class="info-title">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                    Contato WhatsApp
                </h3>
                <a href="https://wa.me/${WHATSAPP_NUMBER}" target="_blank" class="info-whatsapp-link">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                    ${WHATSAPP_NUMBER.replace(/^55/, '').replace(/(\\d{2})(\\d{5})(\\d{4})/, '($1) $2-$3')}
                </a>
            </div>
        </div>
    `;
}

// ================================================
// PRODUCT RENDERING
// ================================================

function renderBusinessInfo() {
    const businessInfoContainer = document.getElementById('businessInfo');
    if (!businessInfoContainer) return;

    const hours = loadFromLocalStorage('hours') || DEFAULT_HOURS;
    const today = new Date().getDay(); // 0 = Domingo, 1 = Segunda, etc.
    const todayInfo = hours[today];

    const hoursHTML = hours.map((day, index) => {
        const isToday = index === today;
        const statusText = day.closed ? 'Fechado' : `${day.open} - ${day.close}`;
        return `
            <div class="info-hours-item ${isToday ? 'today' : ''}">
                <span class="info-hours-day">${day.day}</span>
                <span class="info-hours-time ${day.closed ? 'closed' : ''}">${statusText}</span>
            </div>
        `;
    }).join('');

    businessInfoContainer.innerHTML = `
        <div class="business-info-card">
            <div class="info-section">
                <h3 class="info-title">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12 6 12 12 16 14"/>
                    </svg>
                    Horário de Funcionamento
                </h3>
                <div class="info-hours-list">
                    ${hoursHTML}
                </div>
            </div>
            <div class="info-section">
                <h3 class="info-title">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                    Contato WhatsApp
                </h3>
                <a href="https://wa.me/${WHATSAPP_NUMBER}" target="_blank" class="info-whatsapp-link">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                    ${WHATSAPP_NUMBER.replace(/^55/, '').replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')}
                </a>
            </div>
        </div>
    `;
}

function renderProducts() {
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) return;

    const filteredProducts = PRODUCTS.filter(p => p.category === state.activeCategory);

    if (filteredProducts.length === 0) {
        productsGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--color-gray-400);">
                <p>Nenhum produto cadastrado nesta categoria ainda.</p>
            </div>
        `;
        return;
    }

    productsGrid.innerHTML = filteredProducts.map(product => `
        <div class="product-card">
            <div class="product-image-wrapper">
                <img src="${product.image}" 
                     alt="${product.name}" 
                     class="product-image"
                     onerror="this.src='https://via.placeholder.com/150'">
            </div>
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-footer">
                    <span class="product-price">R$ ${formatPrice(product.price)}</span>
                    <button class="btn-add-cart" onclick="addToCart(${product.id})">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// ================================================
// CART MANAGEMENT
// ================================================

function addToCart(productId) {
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) return;

    const existingItem = state.cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        state.cart.push({ ...product, quantity: 1 });
    }

    updateCartUI();
    saveToLocalStorage('cart', state.cart);
}

function removeFromCart(productId) {
    state.cart = state.cart.filter(item => item.id !== productId);
    updateCartUI();
    renderCartItems();
    saveToLocalStorage('cart', state.cart);
}

function updateQuantity(productId, delta) {
    const item = state.cart.find(item => item.id === productId);
    if (!item) return;

    item.quantity = Math.max(1, item.quantity + delta);
    updateCartUI();
    renderCartItems();
    saveToLocalStorage('cart', state.cart);
}

function updateCartUI() {
    const floatingCart = document.getElementById('floatingCart');
    const cartBadge = document.getElementById('cartBadge');
    const cartTotal = document.getElementById('cartTotal');

    const totalItems = state.cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    if (totalItems > 0) {
        floatingCart.classList.remove('hidden');
        cartBadge.textContent = totalItems;
        cartTotal.textContent = `R$ ${formatPrice(totalPrice)}`;
    } else {
        floatingCart.classList.add('hidden');
    }
}

function renderCartItems() {
    const cartItemsContainer = document.getElementById('cartItems');
    if (!cartItemsContainer) return;

    if (state.cart.length === 0) {
        cartItemsContainer.innerHTML = '<p style="text-align: center; color: var(--color-gray-400); padding: 2rem;">Seu carrinho está vazio</p>';
        return;
    }

    cartItemsContainer.innerHTML = state.cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-info">
                <h4 class="cart-item-name">${item.name}</h4>
                <p class="cart-item-price">R$ ${formatPrice(item.price * item.quantity)}</p>
            </div>
            <div class="cart-item-controls">
                <button class="btn-quantity" onclick="updateQuantity(${item.id}, -1)">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                </button>
                <span class="cart-item-quantity">${item.quantity}</span>
                <button class="btn-quantity" onclick="updateQuantity(${item.id}, 1)">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                </button>
            </div>
            <button class="btn-remove" onclick="removeFromCart(${item.id})">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
            </button>
        </div>
    `).join('');
}

function openCart() {
    const cartModal = document.getElementById('cartModal');
    cartModal.classList.add('active');
    renderCartItems();
    document.body.style.overflow = 'hidden';
}

function closeCart() {
    const cartModal = document.getElementById('cartModal');
    cartModal.classList.remove('active');
    document.body.style.overflow = '';
}

// ================================================
// CHECKOUT
// ================================================

function handleCheckout() {
    const customerName = document.getElementById('customerName').value.trim();
    const customerPhone = document.getElementById('customerPhone').value.trim();
    const customerAddress = document.getElementById('customerAddress').value.trim();

    if (!customerName || !customerPhone || !customerAddress) {
        alert('Por favor, preencha todos os campos.');
        return;
    }

    if (state.cart.length === 0) {
        alert('Seu carrinho está vazio.');
        return;
    }

    const checkoutBtn = document.getElementById('checkoutBtn');
    checkoutBtn.disabled = true;
    checkoutBtn.textContent = 'Processando...';

    // Create order
    const order = {
        id: Date.now().toString(),
        customerName,
        customerPhone,
        customerAddress,
        items: [...state.cart],
        total: state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        status: 'pending',
        createdAt: new Date().toISOString()
    };

    // Save order to localStorage
    const orders = loadFromLocalStorage('orders') || [];
    orders.unshift(order);
    saveToLocalStorage('orders', orders);
    state.orders = orders;

    // Prepare WhatsApp message
    const itemsList = state.cart
        .map(item => `• ${item.quantity}x ${item.name} (R$ ${formatPrice(item.price * item.quantity)})`)
        .join('%0A');

    const message = `*NOVO PEDIDO - Gourmet Express*%0A%0A` +
        `*Cliente:* ${customerName}%0A` +
        `*Endereço:* ${customerAddress}%0A%0A` +
        `*Itens:*%0A${itemsList}%0A%0A` +
        `*Total: R$ ${formatPrice(order.total)}*%0A%0A` +
        `_Aguardando confirmação._`;

    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;

    // Reset cart
    state.cart = [];
    saveToLocalStorage('cart', state.cart);
    document.getElementById('customerName').value = '';
    document.getElementById('customerPhone').value = '';
    document.getElementById('customerAddress').value = '';
    closeCart();
    updateCartUI();

    // Redirect to WhatsApp
    window.open(whatsappUrl, '_blank');

    // Reset button
    setTimeout(() => {
        checkoutBtn.disabled = false;
        checkoutBtn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
            Enviar Pedido para WhatsApp
        `;
    }, 2000);
}

// ================================================
// ADMIN DASHBOARD
// ================================================

function renderAdminDashboard() {
    state.orders = loadFromLocalStorage('orders') || [];

    // Update stats
    document.getElementById('totalOrders').textContent = state.orders.length;
    document.getElementById('deliveredOrders').textContent = 
        state.orders.filter(o => o.status === 'delivered').length;

    // Render queue
    renderQueue();

    // Render orders
    renderOrders();

    // Render hours configuration
    renderHoursConfig();
}

function renderQueue() {
    const queueList = document.getElementById('queueList');
    if (!queueList) return;

    const pendingOrders = state.orders.filter(o => o.status === 'pending').slice(0, 3);

    if (pendingOrders.length === 0) {
        queueList.innerHTML = '<div class="empty-queue">Nenhum pedido pendente</div>';
        return;
    }

    queueList.innerHTML = pendingOrders.map(order => `
        <div class="queue-item">
            <div class="queue-indicator"></div>
            <span class="queue-name">${order.customerName}</span>
            <span class="queue-price">R$ ${formatPrice(order.total)}</span>
        </div>
    `).join('');
}

function renderOrders() {
    const ordersList = document.getElementById('ordersList');
    if (!ordersList) return;

    if (state.orders.length === 0) {
        ordersList.innerHTML = `
            <div class="empty-orders">
                <div class="empty-icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6z"/>
                        <line x1="6" y1="17" x2="18" y2="17"/>
                    </svg>
                </div>
                <p>Nenhum pedido recebido ainda.</p>
            </div>
        `;
        return;
    }

    ordersList.innerHTML = state.orders.map(order => {
        const actionButton = getOrderActionButton(order);
        return `
            <div class="order-card">
                <div class="order-header">
                    <div>
                        <p class="order-id">ID: ${order.id.slice(-6)}</p>
                        <h4 class="order-customer">${order.customerName}</h4>
                    </div>
                    <span class="status-badge ${getStatusClass(order.status)}">
                        ${getStatusLabel(order.status)}
                    </span>
                </div>
                <div class="order-body">
                    <div class="order-items">
                        ${order.items.map(item => `
                            <div class="order-item-tag">
                                <span class="order-item-quantity">${item.quantity}x</span>
                                <span class="order-item-name">${item.name}</span>
                            </div>
                        `).join('')}
                    </div>
                    <div class="order-address">
                        <p class="order-address-label">Endereço:</p>
                        <p class="order-address-text">${order.customerAddress}</p>
                    </div>
                    ${actionButton ? `
                        <div class="order-actions">
                            ${actionButton}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');
}

function getOrderActionButton(order) {
    const actions = {
        pending: {
            label: 'Iniciar Preparo',
            nextStatus: 'preparing',
            icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6z"/><line x1="6" y1="17" x2="18" y2="17"/></svg>',
            className: 'preparing'
        },
        preparing: {
            label: 'Pronto para Entrega',
            nextStatus: 'ready',
            icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
            className: 'ready'
        },
        ready: {
            label: 'Confirmar Entrega',
            nextStatus: 'delivered',
            icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>',
            className: 'delivered'
        }
    };

    const action = actions[order.status];
    if (!action) return '';

    return `
        <button class="btn-order-action ${action.className}" onclick="updateOrderStatus('${order.id}', '${action.nextStatus}')">
            ${action.icon}
            ${action.label}
        </button>
    `;
}

function updateOrderStatus(orderId, newStatus) {
    const order = state.orders.find(o => o.id === orderId);
    if (!order) return;

    const oldStatus = order.status;
    order.status = newStatus;
    saveToLocalStorage('orders', state.orders);
    renderAdminDashboard();

    // Send WhatsApp notification to customer
    if (order.customerPhone) {
        sendStatusUpdate(order, newStatus);
    }
}

function sendStatusUpdate(order, newStatus) {
    const statusMessages = {
        preparing: '🍳 Seu pedido está sendo preparado com carinho!',
        ready: '✅ Seu pedido está pronto e saindo para entrega!',
        delivered: '🎉 Pedido entregue! Obrigado pela preferência!'
    };

    const statusMessage = statusMessages[newStatus];
    if (!statusMessage) return;

    const customerPhone = order.customerPhone.replace(/\D/g, '');
    const phoneWithCountry = customerPhone.startsWith('55') ? customerPhone : '55' + customerPhone;

    const message = `*Gourmet Express*%0A%0A` +
        `Olá *${order.customerName}*!%0A%0A` +
        `${statusMessage}%0A%0A` +
        `*Pedido:* #${order.id.slice(-6)}%0A` +
        `*Total:* R$ ${formatPrice(order.total)}%0A%0A` +
        `_Atualização automática_`;

    const whatsappUrl = `https://wa.me/${phoneWithCountry}?text=${message}`;
    window.open(whatsappUrl, '_blank');
}

// ================================================
// SHARE MENU
// ================================================

function shareMenu() {
    const currentUrl = window.location.href;
    const menuUrl = currentUrl.split('#')[0]; // Remove any hash
    
    const message = `*Gourmet Express* 🍔%0A%0A` +
        `Confira nosso cardápio completo e faça seu pedido:%0A%0A` +
        `${encodeURIComponent(menuUrl)}%0A%0A` +
        `_Os melhores burgers artesanais da cidade!_`;

    // Try to use Web Share API if available
    if (navigator.share) {
        navigator.share({
            title: 'Gourmet Express - Cardápio',
            text: 'Confira nosso cardápio completo!',
            url: menuUrl
        }).catch(err => {
            // Fallback to WhatsApp if share fails
            window.open(`https://wa.me/?text=${message}`, '_blank');
        });
    } else {
        // Fallback to WhatsApp
        window.open(`https://wa.me/?text=${message}`, '_blank');
    }
}

// ================================================
// CONFIG VIEW RENDERING
// ================================================

function renderConfigView() {
    renderProductsList();
}

// ================================================
// HOURS MANAGEMENT
// ================================================

function renderHoursConfig() {
    const hoursGrid = document.getElementById('hoursGrid');
    if (!hoursGrid) return;

    const hours = loadFromLocalStorage('hours') || DEFAULT_HOURS;

    hoursGrid.innerHTML = hours.map((day, index) => `
        <div class="hours-item">
            <div class="hours-day">${day.day}</div>
            <input 
                type="time" 
                class="hours-input" 
                id="open-${index}" 
                value="${day.open}"
                ${day.closed ? 'disabled' : ''}
            >
            <input 
                type="time" 
                class="hours-input" 
                id="close-${index}" 
                value="${day.close}"
                ${day.closed ? 'disabled' : ''}
            >
            <div class="hours-toggle">
                <input 
                    type="checkbox" 
                    class="hours-checkbox" 
                    id="closed-${index}" 
                    ${day.closed ? 'checked' : ''}
                    onchange="toggleDayClosed(${index})"
                >
                <label for="closed-${index}" class="hours-label">Fechado</label>
            </div>
        </div>
    `).join('');
}

function toggleDayClosed(index) {
    const openInput = document.getElementById(`open-${index}`);
    const closeInput = document.getElementById(`close-${index}`);
    const closedCheckbox = document.getElementById(`closed-${index}`);

    const isClosed = closedCheckbox.checked;
    openInput.disabled = isClosed;
    closeInput.disabled = isClosed;
}

function saveHours() {
    const hours = loadFromLocalStorage('hours') || DEFAULT_HOURS;
    
    hours.forEach((day, index) => {
        const closedCheckbox = document.getElementById(`closed-${index}`);
        day.closed = closedCheckbox.checked;
        
        if (!day.closed) {
            day.open = document.getElementById(`open-${index}`).value;
            day.close = document.getElementById(`close-${index}`).value;
        }
    });

    saveToLocalStorage('hours', hours);
    alert('Horários salvos com sucesso!');
}

// ================================================
// PRODUCT MANAGEMENT
// ================================================

// Placeholders dinâmicos baseados na categoria
const CATEGORY_PLACEHOLDERS = {
    burgers: {
        name: 'Ex: Double Bacon Cheese',
        description: 'Ex: Dois blends de 160g, muito bacon crocante e cheddar cremoso.',
        price: '42.00'
    },
    sides: {
        name: 'Ex: Batata Rústica',
        description: 'Ex: Porção individual de batatas fritas com alecrim e páprica.',
        price: '18.00'
    },
    drinks: {
        name: 'Ex: Soda Italiana Maçã Verde',
        description: 'Ex: Refrescante soda artesanal de maçã verde com gelo.',
        price: '14.00'
    },
    desserts: {
        name: 'Ex: Brownie com Sorvete',
        description: 'Ex: Brownie de chocolate belga morno com sorvete de baunilha.',
        price: '22.00'
    }
};

function updatePlaceholders() {
    const category = document.getElementById('productCategory').value;
    const placeholders = CATEGORY_PLACEHOLDERS[category];
    
    if (placeholders) {
        document.getElementById('productName').placeholder = placeholders.name;
        document.getElementById('productDescription').placeholder = placeholders.description;
        document.getElementById('productPrice').placeholder = placeholders.price;
    }
}

function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
        alert('Por favor, selecione apenas arquivos de imagem.');
        return;
    }

    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
        alert('A imagem deve ter no máximo 5MB.');
        return;
    }

    // Converter para base64
    const reader = new FileReader();
    reader.onload = function(e) {
        const imageData = e.target.result;
        document.getElementById('productImage').value = imageData;
        showImagePreview(imageData);
    };
    reader.readAsDataURL(file);
}

function handleImageUrl(event) {
    const url = event.target.value.trim();
    if (url) {
        document.getElementById('productImage').value = url;
        showImagePreview(url);
    }
}

function showImagePreview(imageSrc) {
    const previewContainer = document.getElementById('imagePreview');
    const previewImg = document.getElementById('previewImg');
    
    if (imageSrc) {
        previewImg.src = imageSrc;
        previewContainer.style.display = 'block';
    } else {
        previewContainer.style.display = 'none';
    }
}

function handleProductSubmit(event) {
    event.preventDefault();

    const id = document.getElementById('productId').value;
    const category = document.getElementById('productCategory').value;
    const name = document.getElementById('productName').value.trim();
    const description = document.getElementById('productDescription').value.trim();
    const price = parseFloat(document.getElementById('productPrice').value);
    const image = document.getElementById('productImage').value.trim();

    if (!name || !description || !price || !image) {
        alert('Por favor, preencha todos os campos.');
        return;
    }

    if (id) {
        // Edit existing product
        const index = PRODUCTS.findIndex(p => p.id == id);
        if (index !== -1) {
            PRODUCTS[index] = { id: parseInt(id), category, name, description, price, image };
        }
    } else {
        // Add new product
        const newId = PRODUCTS.length > 0 ? Math.max(...PRODUCTS.map(p => p.id)) + 1 : 1;
        PRODUCTS.push({ id: newId, category, name, description, price, image });
    }

    saveToLocalStorage('products', PRODUCTS);
    resetProductForm();
    renderConfigView();
    renderProducts(); // Update menu view
    
    alert(id ? 'Produto atualizado com sucesso!' : 'Produto adicionado com sucesso!');
}

function resetProductForm() {
    document.getElementById('productForm').reset();
    document.getElementById('productId').value = '';
    document.getElementById('productImage').value = '';
    document.getElementById('productImageUrl').value = '';
    document.getElementById('imagePreview').style.display = 'none';
    updatePlaceholders(); // Restaurar placeholders padrão
}

function editProduct(productId) {
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) return;

    document.getElementById('productId').value = product.id;
    document.getElementById('productCategory').value = product.category;
    document.getElementById('productName').value = product.name;
    document.getElementById('productDescription').value = product.description;
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productImage').value = product.image;
    
    // Atualizar campo de URL ou mostrar preview da imagem
    if (product.image.startsWith('data:')) {
        // É uma imagem em base64
        document.getElementById('productImageUrl').value = '';
    } else {
        // É uma URL
        document.getElementById('productImageUrl').value = product.image;
    }
    
    showImagePreview(product.image);
    updatePlaceholders();

    // Scroll to form
    document.getElementById('productForm').scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function duplicateProduct(productId) {
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) return;

    const newId = PRODUCTS.length > 0 ? Math.max(...PRODUCTS.map(p => p.id)) + 1 : 1;
    const duplicatedProduct = {
        ...product,
        id: newId,
        name: product.name + ' (Cópia)'
    };

    PRODUCTS.push(duplicatedProduct);
    saveToLocalStorage('products', PRODUCTS);
    renderConfigView();
    renderProducts();
    alert('Produto duplicado com sucesso!');
}
function duplicateProduct(productId) {
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) return;

    const newId = PRODUCTS.length > 0 ? Math.max(...PRODUCTS.map(p => p.id)) + 1 : 1;
    const duplicatedProduct = {
        ...product,
        id: newId,
        name: product.name + ' (Cópia)'
    };

    PRODUCTS.push(duplicatedProduct);
    saveToLocalStorage('products', PRODUCTS);
    renderConfigView();
    renderProducts();
    alert('Produto duplicado com sucesso!');
}

function deleteProduct(productId) {
    if (!confirm('Tem certeza que deseja excluir este produto?')) {
        return;
    }

    const index = PRODUCTS.findIndex(p => p.id === productId);
    if (index !== -1) {
        PRODUCTS.splice(index, 1);
        saveToLocalStorage('products', PRODUCTS);
        renderConfigView();
        renderProducts(); // Update menu view
        alert('Produto excluído com sucesso!');
    }
}

function renderProductsList() {
    const productsList = document.getElementById('productsList');
    if (!productsList) return;

    if (PRODUCTS.length === 0) {
        productsList.innerHTML = `
            <div class="empty-state">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <p>Nenhum produto cadastrado ainda.</p>
            </div>
        `;
        return;
    }

    productsList.innerHTML = PRODUCTS.map(product => `
        <div class="product-config-item">
            <div class="product-config-image">
                <img src="${product.image}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/150'">
            </div>
            <div class="product-config-info">
                <div class="product-config-category">${CATEGORIES.find(c => c.id === product.category)?.name || product.category}</div>
                <h3 class="product-config-name">${product.name}</h3>
                <p class="product-config-description">${product.description}</p>
                <div class="product-config-price">R$ ${formatPrice(product.price)}</div>
            </div>
            <div class="product-config-actions">
                <button class="btn-icon edit" onclick="editProduct(${product.id})" title="Editar">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                </button>
                <button class="btn-icon duplicate" onclick="duplicateProduct(${product.id})" title="Duplicar">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                    </svg>
                </button>
                <button class="btn-icon delete" onclick="deleteProduct(${product.id})" title="Excluir">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                </button>
            </div>
        </div>
    `).join('');
}

// ================================================
// INITIALIZATION
// ================================================

function initializeApp() {
    console.log('🚀 Initializing app...');
    console.log('📦 Products loaded:', PRODUCTS.length);

    // Load saved cart
    const savedCart = loadFromLocalStorage('cart');
    if (savedCart) {
        state.cart = savedCart;
        updateCartUI();
    }

    // Render initial products
    renderProducts();

    // Setup category buttons
    const categoryButtons = document.querySelectorAll('.category-btn');
    categoryButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            setActiveCategory(btn.dataset.category);
        });
    });

    // Setup keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeCart();
        }
    });

    console.log('✅ App initialized successfully!');
}

// ================================================
// START APPLICATION
// ================================================

// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

// Make functions available globally
window.switchView = switchView;
window.setActiveCategory = setActiveCategory;
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateQuantity = updateQuantity;
window.openCart = openCart;
window.closeCart = closeCart;
window.handleCheckout = handleCheckout;
window.updateOrderStatus = updateOrderStatus;
window.shareMenu = shareMenu;
window.handleProductSubmit = handleProductSubmit;
window.editProduct = editProduct;
window.duplicateProduct = duplicateProduct;
window.deleteProduct = deleteProduct;
window.resetProductForm = resetProductForm;
window.saveHours = saveHours;
window.toggleDayClosed = toggleDayClosed;
window.updatePlaceholders = updatePlaceholders;
window.handleImageUpload = handleImageUpload;
window.handleImageUrl = handleImageUrl;
