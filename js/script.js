document.addEventListener('DOMContentLoaded',()=>{
  const TELEGRAM_BOT_TOKEN = '8640333357:AAFVxCRANEpG88Jmt63YzyKahXeP6Ddh1Bo';
  const TELEGRAM_CHAT_ID = '1818763651';

  const orderBtns=document.querySelectorAll('button[data-item]');
  const categoryBtns=document.querySelectorAll('.category-btn');
  const scrollButtons=document.querySelectorAll('[data-scroll-target]');
  const burgerToggle=document.getElementById('burger-toggle');
  const navMenu=document.querySelector('.nav');

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
    dotCtx.fillStyle = 'rgba(255, 244, 210, 0.16)';
    dotCtx.fillRect(0, 0, w, h);
    dotCtx.fillStyle = 'rgba(247,183,39,0.72)';
    dotCtx.shadowBlur = 8;
    dotCtx.shadowColor = 'rgba(247,183,39,0.32)';
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

    const handleMove = (event) => {
      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const relativeX = (x / rect.width) * 100;
      const relativeY = (y / rect.height) * 100;
      const distance = Math.hypot(x - rect.width / 2, y - rect.height / 2);
      const intensity = Math.max(0.05, 1 - distance / Math.max(rect.width, rect.height));

      card.style.setProperty('--glow-x', `${relativeX}%`);
      card.style.setProperty('--glow-y', `${relativeY}%`);
      card.style.setProperty('--glow-intensity', intensity.toFixed(2));
      card.style.setProperty('--tilt-x', `${((0.5 - y / rect.height) * 8).toFixed(2)}deg`);
      card.style.setProperty('--tilt-y', `${((x / rect.width - 0.5) * 8).toFixed(2)}deg`);
      card.classList.add('is-hovered', 'is-tilted');

      if (Math.random() > 0.86) {
        const particle = document.createElement('span');
        particle.className = 'card-particle';
        const tx = (Math.random() - 0.5) * 90;
        const ty = (Math.random() - 0.5) * 90;
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;
        particle.style.setProperty('--tx', `${tx}px`);
        particle.style.setProperty('--ty', `${ty}px`);
        particle.style.animationDuration = `${800 + Math.random() * 400}ms`;
        card.appendChild(particle);
        setTimeout(() => particle.remove(), 1300);
      }
    };

    const resetCard = () => {
      card.classList.remove('is-hovered', 'is-tilted');
      card.style.setProperty('--glow-intensity', '0');
      card.style.setProperty('--tilt-x', '0deg');
      card.style.setProperty('--tilt-y', '0deg');
    };

    card.addEventListener('pointerenter', handleMove);
    card.addEventListener('pointermove', handleMove);
    card.addEventListener('pointerleave', resetCard);
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
        <img src="${it.img||'img/fries.jpg'}" alt="${it.title}">
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
      const img = btn.closest('.menu-card')?.querySelector('img')?.getAttribute('src') || '';
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
      alert('Корзина пуста');
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
      alert('Спасибо за заказ! Мы свяжемся с вами.');
    } catch (error) {
      console.error(error);
      alert('Не удалось отправить заказ. Попробуйте позже.');
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
      document.querySelectorAll('.menu-card').forEach(card=>{
        if(category === 'all' || card.dataset.category === category){
          card.style.display = 'flex';
          requestAnimationFrame(()=>{
            card.classList.add('show');
          });
        } else {
          card.classList.remove('show');
          card.style.display = 'none';
        }
      });
    });
  });

  // Initially reveal visible cards
  document.querySelectorAll('.menu-card').forEach(card=>{
    if(card.style.display !== 'none'){
      requestAnimationFrame(()=>card.classList.add('show'));
    }
  });

  // initial render
  updateBadge(); renderCart();
})
