/* ===========================
   SCRIPT.JS - Glow Beauty
   Sistema Completo: Auth, Carrinho, UI
   =========================== */

// 1. LOADER (Corrigido e Seguro)
(function() {
    function hideLoader() {
        const loader = document.getElementById('loader');
        if (loader) {
            loader.classList.add('hidden');
            setTimeout(() => loader.style.display = 'none', 500);
        }
    }
    document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', hideLoader) : hideLoader();
    setTimeout(hideLoader, 2500);
})();

document.addEventListener('DOMContentLoaded', function() {
    
    // ===========================
    // AUTH SYSTEM (Login/Cadastro)
    // ===========================
    const authOverlay = document.getElementById('authOverlay');
    const authModal = document.getElementById('authModal');
    const authClose = document.getElementById('authClose');
    const userBtn = document.getElementById('userBtn');
    const userStatus = document.getElementById('userStatus');
    const authTabs = document.querySelectorAll('.auth-tab');
    const authForms = document.querySelectorAll('.auth-form');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    // Check stored user
    function updateUserState() {
        const stored = JSON.parse(localStorage.getItem('glow_user') || '{}');
        if (stored && stored.email) {
            userStatus.textContent = stored.name || 'Minha Conta';
        } else {
            userStatus.textContent = 'Entrar';
        }
    }
    updateUserState();

    function toggleAuth(show) {
        authOverlay.style.display = show ? 'block' : 'none';
        authModal.style.display = show ? 'flex' : 'none';
        document.body.style.overflow = show ? 'hidden' : '';
    }

    userBtn.addEventListener('click', function() {
        const stored = JSON.parse(localStorage.getItem('glow_user') || '{}');
        if (stored && stored.email) {
            // Logout
            localStorage.removeItem('glow_user');
            updateUserState();
            alert('Conta desconectada com sucesso.');
        } else {
            toggleAuth(true);
        }
    });

    authClose.addEventListener('click', () => toggleAuth(false));
    authOverlay.addEventListener('click', () => toggleAuth(false));

    authTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            authTabs.forEach(t => t.classList.remove('active'));
            authForms.forEach(f => f.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById(`${tab.dataset.tab}Form`).classList.add('active');
        });
    });

    // Register Validation
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('regName').value.trim();
        const email = document.getElementById('regEmail').value.trim();
        const pass = document.getElementById('regPassword').value;
        const confirm = document.getElementById('regConfirm').value;
        const feedback = document.getElementById('regFeedback');

        if (!name || !email || !pass || !confirm) {
            feedback.textContent = 'Preencha todos os campos.';
            feedback.style.color = '#e74c3c';
            return;
        }
        if (pass.length < 6) {
            feedback.textContent = 'Senha deve ter no minimo 6 caracteres.';
            feedback.style.color = '#e74c3c';
            return;
        }
        if (pass !== confirm) {
            feedback.textContent = 'As senhas nao coincidem.';
            feedback.style.color = '#e74c3c';
            return;
        }

        // Simulate saving
        localStorage.setItem('glow_users_' + email, JSON.stringify({name, email, pass}));
        localStorage.setItem('glow_user', JSON.stringify({name, email}));
        updateUserState();
        feedback.textContent = 'Conta criada com sucesso!';
        feedback.style.color = '#27ae60';
        registerForm.reset();
        setTimeout(() => {
            toggleAuth(false);
            feedback.textContent = '';
        }, 1500);
    });

    // Login Validation
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value.trim();
        const pass = document.getElementById('loginPassword').value;
        const feedback = document.getElementById('loginFeedback');

        if (!email || !pass) {
            feedback.textContent = 'Preencha e-mail e senha.';
            feedback.style.color = '#e74c3c';
            return;
        }

        const storedUser = JSON.parse(localStorage.getItem('glow_users_' + email) || 'null');
        if (!storedUser || storedUser.pass !== pass) {
            feedback.textContent = 'E-mail ou senha invalidos.';
            feedback.style.color = '#e74c3c';
            return;
        }

        localStorage.setItem('glow_user', JSON.stringify({name: storedUser.name, email: storedUser.email}));
        updateUserState();
        feedback.textContent = 'Login realizado com sucesso!';
        feedback.style.color = '#27ae60';
        loginForm.reset();
        setTimeout(() => {
            toggleAuth(false);
            feedback.textContent = '';
        }, 1500);
    });

    // ===========================
    // CART SYSTEM (Carrinho Completo)
    // ===========================
    const cartBtn = document.getElementById('cartBtn');
    const cartDrawer = document.getElementById('cartDrawer');
    const cartOverlay = document.getElementById('cartOverlay');
    const closeCart = document.getElementById('closeCart');
    const cartItemsContainer = document.getElementById('cartItems');
    const cartTotalEl = document.getElementById('cartTotalValue');
    const cartCountEl = document.querySelector('.cart-count');
    const checkoutBtn = document.getElementById('checkoutBtn');

    let cart = JSON.parse(localStorage.getItem('glow_cart') || '[]');

    function toggleCart(show) {
        cartOverlay.style.display = show ? 'block' : 'none';
        cartDrawer.style.transform = show ? 'translateX(0)' : 'translateX(100%)';
        document.body.style.overflow = show ? 'hidden' : '';
        if (show) renderCart();
    }

    cartBtn.addEventListener('click', () => toggleCart(true));
    closeCart.addEventListener('click', () => toggleCart(false));
    cartOverlay.addEventListener('click', () => toggleCart(false));

    function renderCart() {
        cartItemsContainer.innerHTML = '';
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<div class="cart-empty">Seu carrinho esta vazio</div>';
            cartCountEl.textContent = '0';
            cartTotalEl.textContent = 'R$0,00';
            return;
        }

        let total = 0;
        let count = 0;

        cart.forEach((item, index) => {
            total += item.price * item.qty;
            count += item.qty;

            const div = document.createElement('div');
            div.className = 'cart-item';
            div.innerHTML = `
                <div class="cart-item-img">
                    <img src="${item.img}" alt="${item.name}">
                </div>
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p class="cart-item-price">R$${item.price.toFixed(2).replace('.', ',')}</p>
                    <div class="cart-controls">
                        <button class="qty-btn" data-action="dec" data-idx="${index}">-</button>
                        <span>${item.qty}</span>
                        <button class="qty-btn" data-action="inc" data-idx="${index}">+</button>
                    </div>
                </div>
                <button class="remove-item" data-idx="${index}" aria-label="Remover">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
            `;
            cartItemsContainer.appendChild(div);
        });

        cartCountEl.textContent = count;
        cartTotalEl.textContent = `R$${total.toFixed(2).replace('.', ',')}`;
    }

    // Add to Cart
    document.querySelectorAll('.btn-add-cart').forEach(btn => {
        btn.addEventListener('click', function() {
            const card = this.closest('.product-card');
            const item = {
                id: card.dataset.id,
                name: card.dataset.name,
                price: parseFloat(card.dataset.price),
                img: card.dataset.img,
                qty: 1
            };

            const existing = cart.find(i => i.id === item.id);
            if (existing) existing.qty++;
            else cart.push(item);

            localStorage.setItem('glow_cart', JSON.stringify(cart));
            
            // Button feedback
            const orig = this.innerHTML;
            this.innerHTML = 'Adicionado!';
            this.style.background = '#27ae60';
            setTimeout(() => {
                this.innerHTML = orig;
                this.style.background = '';
            }, 1200);
        });
    });

    // Cart Controls (Delegation)
    cartItemsContainer.addEventListener('click', function(e) {
        const btn = e.target.closest('.qty-btn, .remove-item');
        if (!btn) return;
        const idx = parseInt(btn.dataset.idx);

        if (btn.classList.contains('qty-btn')) {
            if (btn.dataset.action === 'inc') cart[idx].qty++;
            else cart[idx].qty = Math.max(1, cart[idx].qty - 1);
        } else if (btn.classList.contains('remove-item')) {
            cart.splice(idx, 1);
        }

        localStorage.setItem('glow_cart', JSON.stringify(cart));
        renderCart();
    });

    checkoutBtn.addEventListener('click', function() {
        if (cart.length === 0) return alert('Carrinho vazio!');
        const user = JSON.parse(localStorage.getItem('glow_user') || '{}');
        if (!user.email) {
            alert('Faça login para finalizar a compra.');
            toggleCart(false);
            toggleAuth(true);
            return;
        }
        alert(`Pedido recebido!\nCliente: ${user.name}\nTotal: ${cartTotalEl.textContent}\nObrigada pela compra!`);
        cart = [];
        localStorage.setItem('glow_cart', '[]');
        toggleCart(false);
    });

    // ===========================
    // UI & NAVIGATION
    // ===========================
    // Header Scroll
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => navbar.classList.toggle('scrolled', window.scrollY > 50));

    // Mobile Menu
    const menuBtn = document.getElementById('menuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    const closeMenu = document.getElementById('closeMenu');
    
    function toggleMenu() {
        mobileMenu.classList.toggle('active');
        document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
    }
    menuBtn.addEventListener('click', toggleMenu);
    closeMenu.addEventListener('click', toggleMenu);
    document.querySelectorAll('.mobile-menu a').forEach(a => a.addEventListener('click', toggleMenu));

    // Search
    const searchBtn = document.getElementById('searchBtn');
    const searchBar = document.getElementById('searchBar');
    const searchClose = document.getElementById('searchClose');
    searchBtn.addEventListener('click', () => { searchBar.classList.add('active'); document.getElementById('searchInput').focus(); });
    searchClose.addEventListener('click', () => searchBar.classList.remove('active'));
    document.addEventListener('keydown', e => e.key === 'Escape' && searchBar.classList.remove('active'));

    // Hero Slider
    const slides = document.querySelectorAll('.hero-slide');
    const dots = document.querySelectorAll('.dot');
    let currentSlide = 0;
    let slideInterval;

    function goToSlide(i) {
        slides[currentSlide].classList.remove('active');
        dots[currentSlide].classList.remove('active');
        currentSlide = (i + slides.length) % slides.length;
        slides[currentSlide].classList.add('active');
        dots[currentSlide].classList.add('active');
    }
    document.getElementById('nextSlide').addEventListener('click', () => { goToSlide(currentSlide+1); resetSlide(); });
    document.getElementById('prevSlide').addEventListener('click', () => { goToSlide(currentSlide-1); resetSlide(); });
    dots.forEach(d => d.addEventListener('click', () => { goToSlide(+d.dataset.slide); resetSlide(); }));
    function resetSlide() { clearInterval(slideInterval); slideInterval = setInterval(() => goToSlide(currentSlide+1), 5000); }
    resetSlide();

    // Filters
    const filterBtns = document.querySelectorAll('.filter-btn');
    const productCards = document.querySelectorAll('.product-card');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const f = this.dataset.filter;
            productCards.forEach(card => {
                card.style.opacity = '0';
                card.style.transform = 'translateY(15px)';
                setTimeout(() => {
                    if (f === 'todos' || card.dataset.category === f) {
                        card.classList.remove('hidden');
                        setTimeout(() => { card.style.opacity = '1'; card.style.transform = 'translateY(0)'; }, 50);
                    } else card.classList.add('hidden');
                }, 300);
            });
        });
    });

    // Wishlist
    document.querySelectorAll('.wishlist').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            this.classList.toggle('active');
            const svg = this.querySelector('svg');
            svg.setAttribute('fill', this.classList.contains('active') ? '#e74c3c' : 'none');
            svg.setAttribute('stroke', this.classList.contains('active') ? '#e74c3c' : 'currentColor');
        });
    });

    // Reviews Slider
    const reviewsTrack = document.getElementById('reviewsTrack');
    const reviewDots = document.querySelectorAll('.review-dot');
    let revIdx = 0;
    let revPerView = window.innerWidth > 1024 ? 3 : window.innerWidth > 768 ? 2 : 1;

    function moveReviews() {
        const w = reviewsTrack.querySelector('.review-card').offsetWidth + 25;
        reviewsTrack.style.transform = `translateX(-${revIdx * w}px)`;
        reviewDots.forEach((d, i) => d.classList.toggle('active', i === revIdx));
    }
    reviewDots.forEach(d => d.addEventListener('click', function() { revIdx = +this.dataset.index; moveReviews(); }));
    setInterval(() => { 
        const max = Math.max(0, reviewsTrack.children.length - revPerView);
        revIdx = revIdx >= max ? 0 : revIdx + 1; 
        moveReviews(); 
    }, 6000);
    window.addEventListener('resize', () => {
        revPerView = window.innerWidth > 1024 ? 3 : window.innerWidth > 768 ? 2 : 1;
        revIdx = 0; moveReviews();
    });

    // Back to Top
    const btt = document.getElementById('backToTop');
    window.addEventListener('scroll', () => btt.classList.toggle('visible', window.scrollY > 500));
    btt.addEventListener('click', () => window.scrollTo({top: 0, behavior: 'smooth'}));

    // Scroll Animations
    const obs = new IntersectionObserver(entries => {
        entries.forEach(e => { if(e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
    }, { threshold: 0.15 });
    document.querySelectorAll('.fade-in, .fade-in-left, .scale-in').forEach(el => obs.observe(el));

    // Forms Feedback
    ['newsletterForm', 'contactForm'].forEach(id => {
        const form = document.getElementById(id);
        if(form) form.addEventListener('submit', e => {
            e.preventDefault();
            const btn = form.querySelector('button');
            const orig = btn.textContent;
            btn.textContent = 'Enviado!'; btn.style.background = '#27ae60';
            form.reset();
            setTimeout(() => { btn.textContent = orig; btn.style.background = ''; }, 2500);
        });
    });

    // Init
    renderCart();
});