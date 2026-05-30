'use strict';

// ===== STATE =====
const state = {
  produtos: [],
  servicos: [],
  depoimentos: [],
  categoriaAtual: 'todos',
  cart: JSON.parse(localStorage.getItem('techpro-cart') || '[]'),
  heroIndex: 0,
  heroTotal: 3,
  heroTimer: null,
};

// ===== API =====
async function fetchData(endpoint) {
  try {
    const res = await fetch(endpoint);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error(`Erro ao buscar ${endpoint}:`, err);
    return null;
  }
}

// ===== FORMAT =====
function formatBRL(valor) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatInstall(preco) {
  const parcela = preco / 12;
  return `12x de ${formatBRL(parcela)} sem juros`;
}

function catLabel(cat) {
  const map = {
    perifericos: 'Periférico', componentes: 'Componente'
  };
  return map[cat] || cat;
}

// ===== HERO SLIDER =====
function initHero() {
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('.dot');

  function goTo(idx) {
    slides[state.heroIndex].classList.remove('active');
    dots[state.heroIndex].classList.remove('active');
    state.heroIndex = (idx + state.heroTotal) % state.heroTotal;
    slides[state.heroIndex].classList.add('active');
    dots[state.heroIndex].classList.add('active');
  }

  function startTimer() {
    clearInterval(state.heroTimer);
    state.heroTimer = setInterval(() => goTo(state.heroIndex + 1), 5000);
  }

  document.getElementById('heroPrev').addEventListener('click', () => { goTo(state.heroIndex - 1); startTimer(); });
  document.getElementById('heroNext').addEventListener('click', () => { goTo(state.heroIndex + 1); startTimer(); });
  dots.forEach((dot, i) => dot.addEventListener('click', () => { goTo(i); startTimer(); }));
  startTimer();
}

// ===== NAVIGATION =====
function initNav() {
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  const header = document.getElementById('header');
  const btnSearch = document.getElementById('btnSearch');
  const searchBar = document.getElementById('searchBar');
  const btnCloseSearch = document.getElementById('btnCloseSearch');
  const searchInput = document.getElementById('searchInput');

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('open');
  });

  // Fechar nav ao clicar em link
  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navLinks.classList.remove('open');
    });
  });

  // Dropdown mobile
  navLinks.querySelectorAll('.has-dropdown > a').forEach(a => {
    a.addEventListener('click', (e) => {
      if (window.innerWidth <= 768) {
        e.preventDefault();
        a.parentElement.classList.toggle('open');
      }
    });
  });

  // Links dropdown com categoria
  document.querySelectorAll('.dropdown a[data-cat]').forEach(a => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const cat = a.dataset.cat;
      document.querySelector('#produtos').scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => setFilter(cat), 400);
    });
  });

  // Scroll header
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 20);
    document.getElementById('backToTop').classList.toggle('visible', window.scrollY > 400);
  });

  // Search
  btnSearch.addEventListener('click', () => {
    searchBar.classList.toggle('open');
    if (searchBar.classList.contains('open')) searchInput.focus();
  });
  btnCloseSearch.addEventListener('click', () => searchBar.classList.remove('open'));
  searchInput.addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase().trim();
    filterProducts(q);
  });

  // Smooth scroll anchors
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    if (!a.dataset.cat) {
      a.addEventListener('click', (e) => {
        const target = document.querySelector(a.getAttribute('href'));
        if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
      });
    }
  });

  // Back to top
  document.getElementById('backToTop').addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

// ===== PRODUCTS =====
function renderProducts(lista) {
  const grid = document.getElementById('productsGrid');
  if (!lista || lista.length === 0) {
    grid.innerHTML = '<p style="text-align:center;color:var(--text-muted);padding:60px 0;grid-column:1/-1">Nenhum produto encontrado.</p>';
    return;
  }
  grid.innerHTML = lista.map(p => `
    <article class="product-card animate-on-scroll" data-id="${p.id}">
      <div class="product-img">
        <img src="${p.imagem}" alt="${p.nome}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&h=380&fit=crop&auto=format'">
        ${p.destaque ? '<span class="badge-destaque">Destaque</span>' : ''}
        <span class="badge-categoria">${catLabel(p.categoria)}</span>
      </div>
      <div class="product-info">
        <h3>${p.nome}</h3>
        <p>${p.descricao}</p>
        <div class="product-actions">
          <button class="btn-view" data-id="${p.id}"><i class="fas fa-eye"></i> Ver Detalhes</button>
        </div>
      </div>
    </article>
  `).join('');

  // eventos
  grid.querySelectorAll('.btn-view, .product-card').forEach(el => {
    el.addEventListener('click', (e) => {
      const card = e.target.closest('[data-id]');
      if (card) openModal(parseInt(card.dataset.id));
    });
  });

  observeAnimations();
}

function setFilter(cat) {
  state.categoriaAtual = cat;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.toggle('active', b.dataset.cat === cat));
  const lista = cat === 'todos' ? state.produtos : state.produtos.filter(p => p.categoria === cat);
  renderProducts(lista);
}

function filterProducts(query) {
  let lista = state.categoriaAtual === 'todos' ? state.produtos : state.produtos.filter(p => p.categoria === state.categoriaAtual);
  if (query) lista = lista.filter(p => p.nome.toLowerCase().includes(query) || p.descricao.toLowerCase().includes(query));
  renderProducts(lista);
}

async function loadProducts() {
  const data = await fetchData('/api/produtos');
  if (data) {
    state.produtos = data;
    renderProducts(data);
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => setFilter(btn.dataset.cat));
    });
  } else {
    document.getElementById('productsGrid').innerHTML = '<p style="text-align:center;color:var(--text-muted);padding:60px 0;grid-column:1/-1">Não foi possível carregar os produtos. Inicie o servidor Node.js.</p>';
  }
}

// ===== SERVICES =====
function renderServices(lista) {
  const grid = document.getElementById('servicesGrid');
  if (!lista) { grid.innerHTML = '<p style="color:var(--text-muted)">Erro ao carregar serviços.</p>'; return; }
  grid.innerHTML = lista.map(s => `
    <div class="service-card animate-on-scroll">
      <div class="service-icon"><i class="fas ${s.icone}"></i></div>
      <h3>${s.nome}</h3>
      <p>${s.descricao}</p>
      <ul class="service-list">
        ${s.itens.map(i => `<li>${i}</li>`).join('')}
      </ul>
      <div class="service-tempo"><i class="fas fa-clock"></i> ${s.tempo}</div>
    </div>
  `).join('');
  observeAnimations();
}

async function loadServices() {
  const data = await fetchData('/api/servicos');
  if (data) { state.servicos = data; renderServices(data); }
}

// ===== TESTIMONIALS =====
function renderTestimonials(lista) {
  const grid = document.getElementById('testimonialsGrid');
  if (!lista || lista.length === 0) {
    grid.innerHTML = '<p style="text-align:center;color:var(--text-muted);padding:40px 0;grid-column:1/-1">Nenhum depoimento encontrado.</p>';
    return;
  }
  grid.innerHTML = lista.map(d => `
    <div class="testimonial-card">
      <div class="quote-icon"><i class="fas fa-quote-left"></i></div>
      <div class="stars">${'★'.repeat(d.nota)}</div>
      <p>"${d.texto}"</p>
      <div class="testimonial-header" style="margin-top:18px;margin-bottom:0">
        <img class="testimonial-avatar" src="${d.foto}" alt="${d.nome}" loading="lazy" onerror="this.style.background='var(--dark-3)'">
        <div class="testimonial-info">
          <h4>${d.nome}</h4>
          <span>${d.cargo}</span>
        </div>
      </div>
    </div>
  `).join('');
}

async function loadTestimonials() {
  const data = await fetchData('/api/depoimentos');
  if (data) { state.depoimentos = data; renderTestimonials(data); }
}

// ===== MODAL =====
function openModal(id) {
  const p = state.produtos.find(x => x.id === id);
  if (!p) return;
  document.getElementById('modalBody').innerHTML = `
    <div class="modal-content-inner">
      <div class="modal-img">
        <img src="${p.imagem}" alt="${p.nome}" onerror="this.src='https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&h=380&fit=crop'">
      </div>
      <div class="modal-details">
        <div class="modal-cat">${catLabel(p.categoria)}</div>
        <h3>${p.nome}</h3>
        <div class="modal-specs">
          <h4>Especificações:</h4>
          <ul>${p.specs.map(s => `<li>${s}</li>`).join('')}</ul>
        </div>
        <div class="modal-guarantee"><i class="fas fa-shield-alt"></i> ${p.garantia}</div>
        <div class="modal-actions">
          <a href="https://wa.me/5589994142575?text=Olá! Tenho interesse no produto: ${encodeURIComponent(p.nome)}" target="_blank" class="btn btn-whatsapp">
            <i class="fab fa-whatsapp"></i> Falar pelo WhatsApp
          </a>
        </div>
      </div>
    </div>
  `;
  document.getElementById('productModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('productModal').classList.remove('open');
  document.body.style.overflow = '';
}

function initModal() {
  document.getElementById('modalClose').addEventListener('click', closeModal);
  document.getElementById('productModal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeModal();
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
}

// ===== CART =====
function saveCart() {
  localStorage.setItem('techpro-cart', JSON.stringify(state.cart));
}

function updateCartBadge() {
  const total = state.cart.reduce((sum, i) => sum + i.qty, 0);
  document.getElementById('cartBadge').textContent = total;
}

function addToCart(id) {
  const p = state.produtos.find(x => x.id === id);
  if (!p) return;
  const existing = state.cart.find(i => i.id === id);
  if (existing) existing.qty++;
  else state.cart.push({ id: p.id, nome: p.nome, preco: p.preco, imagem: p.imagem, qty: 1 });
  saveCart();
  updateCartBadge();
  renderCart();
  openCart();
  showToast(`"${p.nome}" adicionado ao carrinho!`);
}

function removeFromCart(id) {
  state.cart = state.cart.filter(i => i.id !== id);
  saveCart();
  updateCartBadge();
  renderCart();
}

function renderCart() {
  const container = document.getElementById('cartItems');
  const footer = document.getElementById('cartFooter');
  if (state.cart.length === 0) {
    container.innerHTML = '<p class="cart-empty"><i class="fas fa-box-open"></i><br>Seu carrinho está vazio</p>';
    footer.style.display = 'none';
    return;
  }
  const total = state.cart.reduce((sum, i) => sum + i.preco * i.qty, 0);
  container.innerHTML = state.cart.map(i => `
    <div class="cart-item">
      <img class="cart-item-img" src="${i.imagem}" alt="${i.nome}" onerror="this.style.background='var(--dark-3)'">
      <div class="cart-item-info">
        <h4>${i.nome}</h4>
        <div class="cart-item-price">${i.qty}x ${formatBRL(i.preco)}</div>
      </div>
      <button class="cart-item-remove" data-id="${i.id}"><i class="fas fa-trash"></i></button>
    </div>
  `).join('');
  container.querySelectorAll('.cart-item-remove').forEach(btn => {
    btn.addEventListener('click', () => removeFromCart(parseInt(btn.dataset.id)));
  });
  document.getElementById('cartTotal').textContent = formatBRL(total);
  footer.style.display = 'block';

  // Update WhatsApp cart link
  const itemsList = state.cart.map(i => `• ${i.qty}x ${i.nome} — ${formatBRL(i.preco * i.qty)}`).join('\n');
  const msg = encodeURIComponent(`Olá! Gostaria de finalizar o pedido:\n\n${itemsList}\n\nTotal: ${formatBRL(total)}`);
  footer.querySelector('.btn-whatsapp').href = `https://wa.me/5589994142575?text=${msg}`;
}

function openCart() {
  document.getElementById('cartSidebar').classList.add('open');
  document.getElementById('cartOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  document.getElementById('cartSidebar').classList.remove('open');
  document.getElementById('cartOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

function initCart() {
  document.getElementById('btnCart').addEventListener('click', openCart);
  document.getElementById('cartClose').addEventListener('click', closeCart);
  document.getElementById('cartOverlay').addEventListener('click', closeCart);
  updateCartBadge();
  renderCart();
}

// ===== TOAST =====
function showToast(msg) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<i class="fas fa-check-circle"></i> ${msg}`;
  toast.style.cssText = `
    position:fixed; bottom:30px; left:50%; transform:translateX(-50%);
    background:var(--success); color:#fff; padding:12px 24px;
    border-radius:50px; font-size:0.88rem; font-weight:600;
    display:flex; align-items:center; gap:8px;
    z-index:9999; box-shadow:0 8px 24px rgba(0,0,0,0.3);
    animation: fadeInUp 0.3s ease;
  `;
  document.body.appendChild(toast);
  setTimeout(() => toast.style.animation = 'fadeOutDown 0.3s ease forwards', 2700);
  setTimeout(() => toast.remove(), 3000);
}

// Add toast animations
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeInUp { from { opacity:0; transform:translateX(-50%) translateY(20px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }
  @keyframes fadeOutDown { from { opacity:1; transform:translateX(-50%) translateY(0); } to { opacity:0; transform:translateX(-50%) translateY(20px); } }
`;
document.head.appendChild(style);

// ===== CONTACT FORM =====
function initContactForm() {
  const form = document.getElementById('contactForm');
  const feedback = document.getElementById('formFeedback');
  const btnSubmit = document.getElementById('btnSubmit');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    feedback.className = 'form-feedback';
    feedback.style.display = 'none';
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';

    const data = {
      nome: form.nome.value,
      email: form.email.value,
      telefone: form.telefone.value,
      servico: form.servico.value,
      mensagem: form.mensagem.value,
    };

    try {
      const res = await fetch('/api/contato', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (res.ok) {
        feedback.className = 'form-feedback success';
        feedback.innerHTML = `<i class="fas fa-check-circle"></i> ${json.mensagem}`;
        form.reset();
      } else {
        throw new Error(json.erro || 'Erro desconhecido');
      }
    } catch (err) {
      feedback.className = 'form-feedback error';
      feedback.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${err.message || 'Erro ao enviar. Tente pelo WhatsApp.'}`;
    } finally {
      btnSubmit.disabled = false;
      btnSubmit.innerHTML = '<i class="fas fa-paper-plane"></i> Enviar Mensagem';
      feedback.style.display = 'block';
      feedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  });
}

// ===== SCROLL ANIMATIONS =====
function observeAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), i * 80);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.animate-on-scroll:not(.visible)').forEach(el => observer.observe(el));
}

// ===== ACTIVE NAV LINK =====
function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  window.addEventListener('scroll', () => {
    const y = window.scrollY + 80;
    sections.forEach(sec => {
      const link = document.querySelector(`.nav-links a[href="#${sec.id}"]`);
      if (link) link.classList.toggle('active', y >= sec.offsetTop && y < sec.offsetTop + sec.offsetHeight);
    });
  });
}

// ===== PHONE MASK =====
function initPhoneMask() {
  const tel = document.getElementById('telefone');
  if (!tel) return;
  tel.addEventListener('input', () => {
    let v = tel.value.replace(/\D/g, '').slice(0, 11);
    if (v.length <= 10) v = v.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    else v = v.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
    tel.value = v;
  });
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', async () => {
  initNav();
  initHero();
  initModal();
  initCart();
  initContactForm();
  initActiveNav();
  initPhoneMask();
  observeAnimations();

  await Promise.all([loadProducts(), loadServices(), loadTestimonials()]);
});

// Expose para uso no HTML inline
window.addToCart = addToCart;
window.closeModal = closeModal;
