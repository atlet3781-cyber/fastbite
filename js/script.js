// ==========================================
// НАСТРОЙКА SUPABASE
// ==========================================
const SUPABASE_URL = 'https://sabewbxhdarihphyjoze.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_spRM4yprH08B7fnYQPfP4A_IEubniUa';

// Инициализация Supabase
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ==========================================
// РАБОТА С КОРЗИНОЙ И СОСТОЯНИЕМ
// ==========================================
let cart = JSON.parse(localStorage.getItem('fastbite_cart')) || [];

// Сохранение корзины
function saveCart() {
  localStorage.setItem('fastbite_cart', JSON.stringify(cart));
  updateCartBadge();
}

// Обновление счетчика товаров в шапке
function updateCartBadge() {
  const badge = document.querySelector('.cart-count');
  if (badge) {
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    badge.textContent = totalCount;
    badge.style.display = totalCount > 0 ? 'inline-block' : 'none';
  }
}

// Добавление товара в корзину
function addToCart(productId, title, price, image) {
  const existingItem = cart.find(item => item.id === productId);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ id: productId, title, price, image, quantity: 1 });
  }
  saveCart();
}

// ==========================================
// ЗАГУЗКА И ОТРИСОВКА ТОВАРОВ ИЗ SUPABASE
// ==========================================
async function renderProductsFromSupabase() {
  const cardsContainer = document.querySelector('.cards') || document.querySelector('.menu-grid');

  if (!cardsContainer) {
    console.error('Ошибка: На странице не найден контейнер для карточек (.cards или .menu-grid)!');
    return;
  }

  // Показываем индикатор загрузки
  cardsContainer.innerHTML = '<div class="loading-spinner">Загрузка меню...</div>';

  try {
    const { data: products, error } = await supabaseClient
      .from('products')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      console.error('Ошибка получения данных из Supabase:', error.message);
      cardsContainer.innerHTML = '<p class="error-msg">Ошибка загрузки меню. Попробуйте позже.</p>';
      return;
    }

    if (!products || products.length === 0) {
      cardsContainer.innerHTML = '<p class="empty-msg">В меню пока нет товаров.</p>';
      return;
    }

    // Очищаем контейнер
    cardsContainer.innerHTML = '';

    // Генерируем карточки товаров из БД
    products.forEach(product => {
      const card = document.createElement('div');
      card.className = 'card';
      card.setAttribute('data-category', product.category || 'all');

      card.innerHTML = `
        <div class="card-image">
          <img src="${product.image_url}" alt="${product.title}" loading="lazy">
        </div>
        <div class="card-body">
          <h3 class="card-title">${product.title}</h3>
          <p class="card-description">${product.description || ''}</p>
          <div class="card-footer">
            <span class="card-price">${product.price} ₽</span>
            <button class="btn btn-primary add-to-cart-btn" 
                    data-id="${product.id}" 
                    data-title="${product.title}" 
                    data-price="${product.price}" 
                    data-image="${product.image_url}">
              В корзину
            </button>
          </div>
        </div>
      `;

      cardsContainer.appendChild(card);
    });

    // Навешиваем клики на новые кнопки "В корзину"
    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
      button.addEventListener('click', (e) => {
        const btn = e.currentTarget;
        const id = btn.getAttribute('data-id');
        const title = btn.getAttribute('data-title');
        const price = parseFloat(btn.getAttribute('data-price'));
        const image = btn.getAttribute('data-image');

        addToCart(id, title, price, image);

        // Визуальный отклик кнопки
        btn.textContent = 'Добавлено ✓';
        btn.disabled = true;
        setTimeout(() => {
          btn.textContent = 'В корзину';
          btn.disabled = false;
        }, 1000);
      });
    });

    // Инициализируем фильтрацию по категориям после рендера
    initCategoryFilters();

  } catch (err) {
    console.error('Непредвиденная ошибка:', err);
  }
}

// ==========================================
// ФИЛЬТРАЦИЯ КАТЕГОРИЙ (Burgers, Drinks и т.д.)
// ==========================================
function initCategoryFilters() {
  const filterButtons = document.querySelectorAll('.category-btn, .tab-btn');
  const cards = document.querySelectorAll('.card');

  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      filterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      const selectedCategory = button.getAttribute('data-category');

      cards.forEach(card => {
        const cardCategory = card.getAttribute('data-category');
        if (selectedCategory === 'all' || cardCategory === selectedCategory) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

// ==========================================
// СТАРТ ПРИ ЗАГРУЗКЕ СТРАНИЦЫ
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();
  renderProductsFromSupabase();
});