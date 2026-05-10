
(() => {
  const money = value => `P${Number(value || 0).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}`;
  const $ = (selector, parent=document) => parent.querySelector(selector);
  const $$ = (selector, parent=document) => [...parent.querySelectorAll(selector)];

  document.addEventListener('DOMContentLoaded', () => {
    setActiveNav();
    initAOS();
    initGSAP();
    initTypewriter();
    initSwipers();
    initCounters();
    initCart();
    initWishlist();
    initForms();
    initGalleryFilters();
    initShopFilters();
    initQuiz();
    initAuthTabs();
    initPasswordTools();
    initBreedModal();
    initLoadMore();
  });

  function setActiveNav(){
    const page = document.documentElement.dataset.page;
    $$(`.nav-link[data-page]`).forEach(link => link.classList.toggle('active', link.dataset.page === page));
  }

  function initAOS(){ if (window.AOS) AOS.init({duration:850, once:true, offset:90}); }

  function initGSAP(){
    if (!window.gsap) return;
    gsap.registerPlugin(window.ScrollTrigger || {});
    gsap.from('.site-navbar',{y:-80, opacity:0, duration:.7, ease:'power3.out'});
    gsap.from('.hero-content > *',{y:35, opacity:0, stagger:.12, duration:.9, ease:'power3.out'});
    if (window.ScrollTrigger) {
      gsap.to('.hero-video',{scale:1.12, scrollTrigger:{trigger:'.video-hero', start:'top top', end:'bottom top', scrub:true}});
      gsap.utils.toArray('.explore-card').forEach(card => gsap.from(card,{y:50,opacity:0,scrollTrigger:{trigger:card,start:'top 85%'}}));
    }
  }

  function initTypewriter(){
    const el = $('#typewriter');
    if (!el) return;
    const text = el.dataset.text || '';
    let i = 0;
    const type = () => {
      el.textContent = text.slice(0, i++);
      if (i <= text.length) setTimeout(type, 55);
    };
    type();
  }

  function initSwipers(){
    if (!window.Swiper) return;
    if ($('.breedSwiper')) new Swiper('.breedSwiper',{slidesPerView:1,spaceBetween:24,loop:true,autoplay:{delay:2600},pagination:{el:'.breedSwiper .swiper-pagination',clickable:true},breakpoints:{768:{slidesPerView:2},992:{slidesPerView:3},1280:{slidesPerView:4}}});
    if ($('.testimonialSwiper')) new Swiper('.testimonialSwiper',{slidesPerView:1,spaceBetween:24,loop:true,autoplay:{delay:3600},pagination:{el:'.testimonialSwiper .swiper-pagination',clickable:true},breakpoints:{992:{slidesPerView:2}}});
  }

  function initCounters(){
    const counters = $$('.counter');
    if (!counters.length) return;
    const runCounter = el => {
      const target = Number(el.dataset.target || 0);
      let current = 0;
      const step = Math.max(1, Math.ceil(target / 70));
      const timer = setInterval(() => {
        current += step;
        if (current >= target) { current = target; clearInterval(timer); }
        el.textContent = current.toLocaleString() + (target >= 100 ? '+' : '');
      }, 22);
    };
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.dataset.done) { entry.target.dataset.done = 'true'; runCounter(entry.target); }
    }), {threshold:.5});
    counters.forEach(counter => observer.observe(counter));
  }

  function getCart(){ return JSON.parse(localStorage.getItem('pdp-cart') || '[]'); }
  function saveCart(cart){ localStorage.setItem('pdp-cart', JSON.stringify(cart)); renderCart(); }

  function initCart(){
    renderCart();
    $$('.add-to-cart').forEach(btn => btn.addEventListener('click', event => {
      event.preventDefault();
      const item = {id:btn.dataset.productId, name:btn.dataset.productName, price:Number(btn.dataset.productPrice), image:btn.dataset.productImage, qty:1};
      const cart = getCart();
      const existing = cart.find(product => product.id === item.id);
      if (existing) existing.qty += 1; else cart.push(item);
      saveCart(cart);
      animateCartBadge();
      showToast(`${item.name} added to cart`);
      flyToCart(btn);
    }));
    $('#checkoutBtn')?.addEventListener('click', () => showToast('Checkout demo ready. Connect payment later.'));
  }

  function renderCart(){
    const cart = getCart();
    const holder = $('#cartItems');
    const empty = $('#cartEmpty');
    const badge = $('#cartCount');
    const subtotal = cart.reduce((sum,item) => sum + item.price * item.qty, 0);
    const delivery = cart.length ? 60 : 0;
    if (badge) badge.textContent = cart.reduce((sum,item) => sum + item.qty, 0);
    if (empty) empty.style.display = cart.length ? 'none' : 'block';
    if (holder) {
      holder.innerHTML = cart.map(item => `<div class="cart-row" data-id="${item.id}"><img src="${item.image}" alt="${item.name}"><div><h4>${item.name}</h4><small>${money(item.price)}</small><div class="qty-controls"><button data-cart-action="dec">−</button><span>${item.qty}</span><button data-cart-action="inc">+</button></div></div><button class="remove-item" data-cart-action="remove" aria-label="Remove ${item.name}">×</button></div>`).join('');
      $$('[data-cart-action]', holder).forEach(btn => btn.addEventListener('click', () => updateCart(btn.closest('.cart-row').dataset.id, btn.dataset.cartAction)));
    }
    $('#cartSubtotal') && ($('#cartSubtotal').textContent = money(subtotal));
    $('#cartDelivery') && ($('#cartDelivery').textContent = money(delivery));
    $('#cartTotal') && ($('#cartTotal').textContent = money(subtotal + delivery));
  }

  function updateCart(id, action){
    let cart = getCart();
    const item = cart.find(i => i.id === id);
    if (!item) return;
    if (action === 'inc') item.qty += 1;
    if (action === 'dec') item.qty -= 1;
    if (action === 'remove' || item.qty <= 0) cart = cart.filter(i => i.id !== id);
    saveCart(cart);
    showToast(action === 'remove' ? 'Item removed from cart' : 'Cart updated');
  }

  function animateCartBadge(){ const badge = $('.cart-badge'); if (!badge) return; badge.animate([{transform:'scale(1)'},{transform:'scale(1.18)'},{transform:'scale(1)'}],{duration:360}); }

  function flyToCart(btn){
    const cart = $('.cart-badge');
    if (!cart || !btn) return;
    const dot = document.createElement('span');
    dot.style.cssText = 'position:fixed;width:14px;height:14px;border-radius:50%;background:#D4AF37;z-index:5000;pointer-events:none';
    const b = btn.getBoundingClientRect(); const c = cart.getBoundingClientRect();
    dot.style.left = b.left + b.width/2 + 'px'; dot.style.top = b.top + 'px'; document.body.appendChild(dot);
    dot.animate([{transform:'translate(0,0)',opacity:1},{transform:`translate(${c.left-b.left}px,${c.top-b.top}px) scale(.3)`,opacity:.15}],{duration:650,easing:'cubic-bezier(.2,.8,.2,1)'}).onfinish = () => dot.remove();
  }

  function showToast(message){
    const holder = $('#toastHolder'); if (!holder) return;
    const toast = document.createElement('div'); toast.className = 'custom-toast'; toast.textContent = message;
    holder.appendChild(toast);
    setTimeout(() => { toast.classList.add('hide'); setTimeout(()=>toast.remove(),260); }, 2600);
  }

  function initWishlist(){
    const saved = JSON.parse(localStorage.getItem('pdp-wishlist') || '[]');
    $$('.wishlist-btn').forEach(btn => {
      const icon = btn.querySelector('i');
      if (saved.includes(btn.dataset.productId)) { btn.classList.add('active'); icon?.classList.replace('fa-regular','fa-solid'); }
      btn.addEventListener('click', event => {
        event.preventDefault();
        const list = JSON.parse(localStorage.getItem('pdp-wishlist') || '[]');
        const id = btn.dataset.productId;
        const next = list.includes(id) ? list.filter(x => x !== id) : [...list, id];
        localStorage.setItem('pdp-wishlist', JSON.stringify(next));
        btn.classList.toggle('active'); btn.classList.add('pop');
        icon?.classList.toggle('fa-regular'); icon?.classList.toggle('fa-solid');
        setTimeout(()=>btn.classList.remove('pop'),450);
        showToast(next.includes(id) ? 'Saved to wishlist' : 'Removed from wishlist');
      });
    });
  }

  function initForms(){
    $$('.validate-form').forEach(form => form.addEventListener('submit', event => {
      event.preventDefault();
      const fields = $$('input, textarea, select', form).filter(field => field.type !== 'checkbox');
      let valid = true;
      fields.forEach(field => {
        const ok = field.checkValidity();
        field.classList.toggle('is-valid', ok);
        field.classList.toggle('is-invalid', !ok);
        if (!ok) valid = false;
      });
      const msg = $('.form-message', form);
      const spinner = $('.spinner-border', form);
      const text = $('.btn-text', form);
      if (!valid) { if (msg) { msg.textContent = 'Please fix the highlighted fields.'; msg.style.color = '#c0392b'; } return; }
      spinner?.classList.remove('d-none'); if (text) text.textContent = 'Sending...';
      setTimeout(() => {
        spinner?.classList.add('d-none'); if (text) text.textContent = 'Send Message';
        if (msg) { msg.textContent = 'Success. Your request has been received.'; msg.style.color = '#2e7d32'; }
        form.reset(); fields.forEach(f => f.classList.remove('is-valid'));
        if (window.confetti && form.id === 'contactForm') confetti({particleCount:100, spread:70, origin:{y:.75}});
      }, 850);
    }));
    $$('input, textarea, select').forEach(field => field.addEventListener('input', () => {
      if (!field.closest('.validate-form')) return;
      field.classList.toggle('is-valid', field.checkValidity());
      field.classList.toggle('is-invalid', !field.checkValidity() && field.value.length > 0);
    }));
  }

  function initGalleryFilters(){
    const grid = $('#breedGrid'); if (!grid) return;
    const boxes = $$('[data-filter]');
    const apply = () => {
      const active = boxes.filter(b => b.checked);
      const byGroup = active.reduce((acc,b) => ((acc[b.dataset.filter] ||= []).push(b.value), acc), {});
      let count = 0;
      $$('.breed-item', grid).forEach(card => {
        const show = Object.entries(byGroup).every(([key, values]) => values.some(value => (card.dataset[key] || '').includes(value)));
        card.style.display = show ? '' : 'none'; if (show) count++;
      });
      $('#resultCount') && ($('#resultCount').textContent = count);
    };
    boxes.forEach(b => b.addEventListener('change', apply));
    $('#clearFilters')?.addEventListener('click', () => { boxes.forEach(b => b.checked = false); apply(); });
    $('#sortSelect')?.addEventListener('change', event => {
      const cards = $$('.breed-item', grid);
      const sort = event.target.value;
      cards.sort((a,b)=> sort==='price-low'? a.dataset.price-b.dataset.price : sort==='price-high'? b.dataset.price-a.dataset.price : sort==='name'? a.dataset.name.localeCompare(b.dataset.name) : 0).forEach(card => grid.appendChild(card));
    });
  }

  function initBreedModal(){
    const modal = $('#breedModal'); if (!modal) return;
    modal.addEventListener('show.bs.modal', event => {
      const btn = event.relatedTarget;
      $('#modalBreedName').textContent = btn.dataset.name;
      $('#modalBreedPrice').textContent = btn.dataset.price;
      $('#modalBreedTraits').textContent = btn.dataset.traits;
      $('#modalBreedImage').src = btn.dataset.image;
      $('#modalBreedImage').alt = btn.dataset.name;
    });
  }

  function initShopFilters(){
    const grid = $('#productGrid'); if (!grid) return;
    $$('.category-btn').forEach(btn => btn.addEventListener('click', () => {
      $$('.category-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.category;
      $$('.product-item', grid).forEach(item => {
        const show = cat === 'all' || item.dataset.category === cat;
        item.style.display = show ? '' : 'none';
        if (show) item.animate([{opacity:0, transform:'translateY(18px)'},{opacity:1, transform:'none'}],{duration:300});
      });
    }));
  }

  function initQuiz(){
    const form = $('#quizForm'); if (!form) return;
    let step = 1; const total = 6;
    const showStep = next => {
      step = Math.min(total, Math.max(1, next));
      $$('.quiz-step', form).forEach(s => s.classList.toggle('active', Number(s.dataset.step) === step));
      $('#currentStep').textContent = step;
      $('#progressFill').style.width = `${((step-1)/(total-1))*100}%`;
    };
    $$('.btn-next', form).forEach(btn => btn.addEventListener('click', () => { sessionStorage.setItem('pdp-quiz-step', step+1); showStep(step+1); }));
    $$('.btn-prev', form).forEach(btn => btn.addEventListener('click', () => showStep(step-1)));
    form.addEventListener('change', () => {
      const data = new FormData(form); const saved = {};
      for (const [k,v] of data.entries()) { saved[k] = saved[k] ? [].concat(saved[k], v) : v; }
      sessionStorage.setItem('pdp-quiz-answers', JSON.stringify(saved));
    });
    form.addEventListener('submit', event => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries());
      let result = 'Labrador Retriever'; let image = 'images/breeds/labrador.svg'; let why = 'friendly, balanced and great for many homes';
      if (data.priority === 'security') { result = data.home === 'large-house' ? 'Boerboel' : 'German Shepherd'; image = data.home === 'large-house' ? 'images/breeds/boerboel.svg' : 'images/breeds/german-shepherd.svg'; why = 'protective, loyal and trainable'; }
      else if (data.home === 'apartment') { result = data.grooming === 'high' ? 'Maltese' : 'Jack Russell Terrier'; image = data.grooming === 'high' ? 'images/breeds/maltese.svg' : 'images/breeds/jack-russell.svg'; why = 'compact and suitable for smaller spaces'; }
      else if (data.activity === 'high') { result = 'Siberian Husky'; image = 'images/breeds/husky.svg'; why = 'active, playful and adventure-ready'; }
      const box = $('#quizResult');
      box.innerHTML = `<article class="result-card"><img class="rounded-img mb-3" src="${image}" alt="${result}"><span class="section-label">Your Match</span><h2>${result}</h2><p>This breed is recommended because it is ${why}.</p><div class="d-flex justify-content-center gap-2 flex-wrap"><a class="btn btn-brand" href="gallery.html">View Breed Gallery</a><button class="btn btn-outline-brand" type="button" id="retakeQuiz">Retake Quiz</button></div></article>`;
      box.classList.add('show'); $('#progressFill').style.width = '100%';
      if (window.confetti) confetti({particleCount:160, spread:90, origin:{y:.7}});
      $('#retakeQuiz')?.addEventListener('click', () => { form.reset(); box.classList.remove('show'); showStep(1); sessionStorage.removeItem('pdp-quiz-answers'); });
      box.scrollIntoView({behavior:'smooth', block:'center'});
    });
    showStep(Number(sessionStorage.getItem('pdp-quiz-step')) || 1);
  }

  function initAuthTabs(){
    $$('.auth-tab').forEach(tab => tab.addEventListener('click', () => {
      $$('.auth-tab').forEach(t => t.classList.remove('active')); tab.classList.add('active');
      $$('.auth-panel').forEach(panel => panel.classList.toggle('active', panel.id === `${tab.dataset.auth}Panel`));
    }));
  }

  function initPasswordTools(){
    $$('.toggle-password').forEach(btn => btn.addEventListener('click', () => {
      const input = btn.parentElement.querySelector('input');
      input.type = input.type === 'password' ? 'text' : 'password';
      btn.querySelector('i')?.classList.toggle('fa-eye-slash');
    }));
    const pass = $('#signupPassword'); const bar = $('.strength span');
    pass?.addEventListener('input', () => {
      const v = pass.value; let score = Math.min(100, v.length * 12 + (/[A-Z]/.test(v)?15:0) + (/\d/.test(v)?15:0) + (/[^A-Za-z0-9]/.test(v)?20:0));
      bar.style.width = score + '%'; bar.style.background = score > 70 ? '#2e7d32' : score > 40 ? '#D4AF37' : '#c0392b';
    });
  }

  function initLoadMore(){
    $('#loadMoreBreeds')?.addEventListener('click', e => {
      const btn = e.currentTarget; btn.classList.add('loading');
      setTimeout(() => { btn.classList.remove('loading'); showToast('All available breeds are already displayed.'); }, 900);
    });
  }
})();
