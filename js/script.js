document.addEventListener('DOMContentLoaded',()=>{
  const TELEGRAM_BOT_TOKEN = '8640333357:AAFVxCRANEpG88Jmt63YzyKahXeP6Ddh1Bo';
  const TELEGRAM_CHAT_ID = '1818763651';

  let toastTimer = null;
  function showToast(message, type = 'success'){
    let toast = document.getElementById('site-toast');
    if (!toast){
      toast = document.createElement('div');
      toast.id = 'site-toast';
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.toggle('toast-error', type === 'error');
    toast.classList.add('toast-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('toast-visible'), 2800);
  }

  const orderBtns=document.querySelectorAll('button[data-item]');
  const categoryBtns=document.querySelectorAll('.category-btn');
  const scrollButtons=document.querySelectorAll('[data-scroll-target]');
  const burgerToggle=document.getElementById('burger-toggle');
  const navMenu=document.querySelector('.nav');
  const header=document.querySelector('.site-header');
  let lastScrollY = window.scrollY;

  const productImageMap = {
    fries: 'https://images.unsplash.com/photo-1576107232684-1279f390859f?auto=format&fit=crop&w=600&q=80',
    burger: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
    shake: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=600&q=80',
    brownie: 'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?auto=format&fit=crop&w=600&q=80',
    icecream: 'https://images.unsplash.com/photo-1551024709-8f23befc6b5d?auto=format&fit=crop&w=600&q=80',
    wings: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=600&q=80',
    drinks: 'https://images.unsplash.com/photo-1542444459-db195aae2c3f?auto=format&fit=crop&w=600&q=80'
  };

  const dotCanvas = document.getElementById('dotfield-canvas');
  const dotCtx = dotCanvas?.getContext('2d');
  const dotState = {
    dots: [],
    dotRadius: 3.2,
    dotSpacing: 30,
    cursorRadius: 180,
    bulgeStrength: 48,
    glowRadius: 110,
    mouseX: -9999,
    mouseY: -9999,
    active: false,
    dpr: 1,
    tick: 0,
  };

  function resizeDotCanvas(){
    if (!dotCanvas || !dotCtx) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    dotCanvas.width = w * dotState.dpr;
    dotCanvas.height = h * dotState.dpr;
    dotCanvas.style.width = `${w}px`;
    dotCanvas.style.height = `${h}px`;
    dotCtx.setTransform(dotState.dpr, 0, 0, dotState.dpr, 0, 0);
    buildDotGrid(w, h);
  }

  function initBlurText(){
    const elements = document.querySelectorAll('.blur-text');
    if (!elements.length) return;

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -10%' });

    elements.forEach(el => {
      const animateBy = el.dataset.animateBy || 'words';
      const direction = el.dataset.direction || 'top';
      const delay = Number(el.dataset.delay || 200);
      const text = el.textContent.trim();
      if (!text) return;

      const segments = animateBy === 'letters' ? Array.from(text) : text.split(' ');
      el.textContent = '';
      if (direction === 'bottom') el.classList.add('blur-text-bottom');

      segments.forEach((segment, index) => {
        const span = document.createElement('span');
        span.className = 'blur-text-segment';
        span.textContent = segment === ' ' ? '\u00A0' : segment;
        span.style.transitionDelay = `${(index * delay) / 1000}s`;
        el.appendChild(span);
        if (animateBy === 'words' && index < segments.length - 1) {
          el.appendChild(document.createTextNode(' '));
        }
      });
      observer.observe(el);
    });
  }

  function buildDotGrid(w, h){
    const step = dotState.dotRadius * 2 + dotState.dotSpacing;
    const cols = Math.ceil(w / step) + 1;
    const rows = Math.ceil(h / step) + 1;
    const padX = (w - cols * step) / 2;
    const padY = (h - rows * step) / 2;
    const dots = [];
    for (let row = 0; row < rows; row++){
      for (let col = 0; col < cols; col++){
        dots.push({
          x: padX + col * step + step / 2,
          y: padY + row * step + step / 2,
          ox: padX + col * step + step / 2,
          oy: padY + row * step + step / 2,
          vx: 0,
          vy: 0,
        });
      }
    }
    dotState.dots = dots;
  }

  function updateDotField(){
    if (!dotCanvas || !dotCtx) return;
    const { dots, dotRadius, cursorRadius, bulgeStrength, mouseX, mouseY, active, tick } = dotState;
    const w = dotCanvas.clientWidth;
    const h = dotCanvas.clientHeight;
    dotCtx.globalCompositeOperation = 'source-over';
    dotCtx.clearRect(0, 0, w, h);
    dotCtx.fillStyle = 'rgba(255, 246, 226, 0.14)';
    dotCtx.fillRect(0, 0, w, h);
    dotCtx.fillStyle = 'rgba(28,16,6,0.16)';
    dotCtx.shadowBlur = 10;
    dotCtx.shadowColor = 'rgba(230,67,44,0.35)';
    dotCtx.globalCompositeOperation = 'lighter';

    const drift = Math.sin(tick * 0.004) * 3;
    for (let i = 0, len = dots.length; i < len; i++) {
      const dot = dots[i];
      const dx = mouseX - dot.ox;
      const dy = mouseY - dot.oy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const maxDist = cursorRadius;
      let tx = dot.ox + Math.cos((dot.ox + dot.oy) * 0.015 + tick * 0.004) * drift;
      let ty = dot.oy + Math.sin((dot.ox - dot.oy) * 0.01 + tick * 0.004) * drift;
      if (active && dist < maxDist) {
        const force = (1 - dist / maxDist) * bulgeStrength;
        const angle = Math.atan2(dy, dx);
        tx += Math.cos(angle) * force;
        ty += Math.sin(angle) * force;
      }
      dot.vx += (tx - dot.x) * 0.08;
      dot.vy += (ty - dot.y) * 0.08;
      dot.vx *= 0.9;
      dot.vy *= 0.9;
      dot.x += dot.vx;
      dot.y += dot.vy;
      dotCtx.beginPath();
      dotCtx.arc(dot.x, dot.y, dotRadius, 0, Math.PI * 2);
      dotCtx.fill();
    }

    dotState.tick += 1;
    requestAnimationFrame(updateDotField);
  }

  function onDotPointerMove(e){
    dotState.mouseX = e.pageX;
    dotState.mouseY = e.pageY;
    dotState.active = true;
  }

  function onDotPointerLeave(){
    dotState.active = false;
  }

  document.querySelectorAll('.menu-card, .deals-card, .burger-card').forEach(card => {
    card.classList.add('magic-card');

    card.addEventListener('click', (event) => {
      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const maxDistance = Math.max(
        Math.hypot(x, y),
        Math.hypot(x - rect.width, y),
        Math.hypot(x, y - rect.height),
        Math.hypot(x - rect.width, y - rect.height)
      );

      const ripple = document.createElement('span');
      ripple.className = 'card-ripple';
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;
      ripple.style.width = `${maxDistance * 2}px`;
      ripple.style.height = `${maxDistance * 2}px`;
      card.appendChild(ripple);
      setTimeout(() => ripple.remove(), 900);
    });
  });

  resizeDotCanvas();
  initBlurText();
  window.addEventListener('resize', resizeDotCanvas);
  document.addEventListener('pointermove', onDotPointerMove, { passive: true });
  document.addEventListener('mousemove', onDotPointerMove, { passive: true });
  document.addEventListener('pointerleave', onDotPointerLeave, { passive: true });
  window.addEventListener('blur', onDotPointerLeave);
  requestAnimationFrame(updateDotField);

  // Cart elements
  const cartBtn=document.getElementById('cart-btn');
  const cartCount=document.getElementById('cart-count');
  const cartPanel=document.getElementById('cart-panel');
  const cartItemsWrap=document.getElementById('cart-items');
  const closeCart=document.getElementById('close-cart');
  const cartTotalEl=document.getElementById('cart-total');
  const orderForm=document.getElementById('order-form');
  const deliveryTypeSelect=document.getElementById('delivery-type');
  const addressGroup=document.getElementById('address-group');
  const addressInput=document.getElementById('address-input');

  let cart = JSON.parse(localStorage.getItem('fastbite_cart')||'[]');

  function saveCart(){
    localStorage.setItem('fastbite_cart', JSON.stringify(cart));
  }

  function updateBadge(){
    const qty = cart.reduce((s,i)=>s+i.quantity,0);
    cartCount.textContent = qty;
  }

  function renderCart(){
    cartItemsWrap.innerHTML = '';
    if(cart.length===0){
      cartItemsWrap.innerHTML = '<p class="cart-empty">Корзина пуста</p>';
      cartTotalEl.textContent = '0';
      return;
    }
    let total=0;
    cart.forEach((it, idx)=>{
      total += it.price * it.quantity;
      const div = document.createElement('div');
      div.className = 'cart-item';
      div.innerHTML = `
        <img src="${it.img || 'img/logo.png'}" alt="${it.title}">
        <div class="meta">
          <h4>${it.title}</h4>
          <div class="qty-controls">
            <button class="qty-btn" data-action="decrease" data-idx="${idx}">−</button>
            <span>${it.quantity}</span>
            <button class="qty-btn" data-action="increase" data-idx="${idx}">+</button>
          </div>
          <p>${it.price * it.quantity} ₽</p>
        </div>
        <button class="remove" data-idx="${idx}">✕</button>
      `;
      cartItemsWrap.appendChild(div);
    });
    cartTotalEl.textContent = total;

    cartItemsWrap.querySelectorAll('.remove').forEach(btn=>{
      btn.addEventListener('click',()=>{
        const i = Number(btn.dataset.idx);
        cart.splice(i,1);
        saveCart(); renderCart(); updateBadge();
      });
    });

    cartItemsWrap.querySelectorAll('.qty-btn').forEach(btn=>{
      btn.addEventListener('click',()=>{
        const i = Number(btn.dataset.idx);
        const action = btn.dataset.action;
        if(action === 'increase'){
          cart[i].quantity += 1;
        } else if(action === 'decrease'){
          cart[i].quantity -= 1;
          if(cart[i].quantity <= 0){
            cart.splice(i,1);
          }
        }
        saveCart(); renderCart(); updateBadge();
      });
    });
  }

  function openCartPanel(){
    cartPanel.classList.remove('hidden');
    cartPanel.setAttribute('aria-hidden','false');
    renderCart();
  }

  function closeCartPanel(){
    cartPanel.classList.add('hidden');
    cartPanel.setAttribute('aria-hidden','true');
  }

  orderBtns.forEach(btn=>{
    btn.addEventListener('click',()=>{
      const key = btn.dataset.item;
      const price = Number(btn.dataset.price||0);
      const title = btn.dataset.title || key;
      let img = productImageMap[key] || 'img/logo.png';
      const card = btn.closest('.menu-card, .deals-card');
      const cardImg = card?.querySelector('img.menu-photo, img')?.getAttribute('src');
      if (cardImg) img = cardImg;
      const found = cart.find(c=>c.key===key);
      if(found){ found.quantity += 1; }
      else { cart.push({key, title, price, quantity:1, img}); }
      saveCart(); updateBadge();
      openCartPanel();
    });
  });

  scrollButtons.forEach(btn=>{
    btn.addEventListener('click',()=>{
      const targetSelector = btn.dataset.scrollTarget;
      if (!targetSelector) return;
      const target = document.querySelector(targetSelector);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      navMenu?.classList.remove('open');
    });
  });

  burgerToggle?.addEventListener('click', ()=>{
    navMenu?.classList.toggle('open');
  });

  document.querySelectorAll('.nav a').forEach(link => {
    link.addEventListener('click', ()=> navMenu?.classList.remove('open'));
  });

  window.addEventListener('scroll', ()=>{
    const currentScroll = window.scrollY;
    if (currentScroll > lastScrollY && currentScroll > 80) {
      header?.classList.add('header-hidden');
      navMenu?.classList.remove('open');
    } else {
      header?.classList.remove('header-hidden');
    }
    lastScrollY = currentScroll;
  }, { passive: true });

  deliveryTypeSelect.addEventListener('change',()=>{
    const visible = deliveryTypeSelect.value === 'delivery';
    addressGroup.classList.toggle('hidden', !visible);
    if (!visible) {
      addressInput.value = '';
    }
  });

  orderForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (cart.length === 0) {
      showToast('Корзина пуста', 'error');
      return;
    }

    const formData = new FormData(orderForm);
    const customerName = formData.get('customerName')?.toString().trim() || 'Без имени';
    const phone = formData.get('phone')?.toString().trim() || 'Не указан';
    const deliveryType = formData.get('deliveryType')?.toString() || 'Не выбрано';
    const address = formData.get('address')?.toString().trim() || 'Не указан';

    const itemsText = cart.map(item => `• ${item.title} ×${item.quantity} — ${item.price * item.quantity} руб.`).join('\n');
    const deliveryLabel = deliveryType === 'delivery' ? `Доставка (${address})` : 'Самовывоз';
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const message = `🔔 Новый заказ!\nКлиент: ${customerName} (${phone})\nТип: ${deliveryLabel}\n---\n${itemsText}\n---\nИтого: ${total} руб.`;

    try {
      const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: 'HTML'
        })
      });

      if (!response.ok) {
        throw new Error('Telegram request failed');
      }

      cart = [];
      saveCart();
      updateBadge();
      renderCart();
      orderForm.reset();
      addressGroup.classList.add('hidden');
      closeCartPanel();
      showToast('Спасибо за заказ! Мы свяжемся с вами.');
    } catch (error) {
      console.error(error);
      showToast('Не удалось отправить заказ. Попробуйте позже.', 'error');
    }
  });

  cartBtn.addEventListener('click',()=>{
    openCartPanel();
  });
  closeCart.addEventListener('click',()=>{
    closeCartPanel();
  });

  categoryBtns.forEach(btn=>{
    btn.addEventListener('click',()=>{
      document.querySelectorAll('.category-btn').forEach(tab=>tab.classList.remove('active'));
      btn.classList.add('active');
      const category = btn.dataset.category;
      let visibleIndex = 0;
      document.querySelectorAll('.menu-card').forEach(card=>{
        if(category === 'all' || card.dataset.category === category){
          card.classList.remove('show');
          card.style.display = 'flex';
          const delay = visibleIndex * 60;
          visibleIndex += 1;
          setTimeout(()=>requestAnimationFrame(()=>card.classList.add('show')), delay);
        } else {
          card.classList.remove('show');
          card.style.display = 'none';
        }
      });
    });
  });

  // Initially reveal visible cards (лёгкий каскад по индексу)
  document.querySelectorAll('.menu-card').forEach((card, index)=>{
    if(card.style.display !== 'none'){
      const delay = index * 70;
      setTimeout(()=>requestAnimationFrame(()=>card.classList.add('show')), delay);
    }
  });

  // initial render
  updateBadge(); renderCart();
})