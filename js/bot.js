const { Telegraf } = require('telegraf');
const { createClient } = require('@supabase/supabase-js');

// --- НАСТРОЙКИ И ДАННЫЕ ПРОЕКТА ---
const BOT_TOKEN = '8640333357:AAFVxCRANEpG88Jmt63YzyKahXeP6Ddh1Bo';
const SUPABASE_URL = 'https://sabewbxhdarihphyjoze.supabase.co';
const SUPABASE_SECRET_KEY = 'sb_secret_3L_K_2OtzxXGlNz2vD6Lqg_Hliugxa4';
const ADMIN_ID = 1818763651; // Твой Telegram ID

// ИНИЦИАЛИЗАЦИЯ (прямое подключение)
const bot = new Telegraf(BOT_TOKEN);
const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY);

// Проверка прав администратора
const checkAdmin = (ctx) => {
  if (ctx.from.id !== ADMIN_ID) {
    ctx.reply('⛔ Доступ запрещён. Вы не являетесь администратором.');
    return false;
  }
  return true;
};

// ==========================================
// КОМАНДЫ БОТА
// ==========================================

// /start
bot.start((ctx) => {
  if (!checkAdmin(ctx)) return;
  ctx.reply(
    `👋 Привет, Админ!\n\n` +
    `Доступные команды управления меню FastBite:\n\n` +
    `➕ /add Название | Описание | Цена | Категория | Ссылка_на_фото\n` +
    `📋 /list — Посмотреть все товары\n` +
    `🗑 /delete ID — Удалить товар по ID\n\n` +
    `Доступные категории: burgers, sets, drinks, snacks, dessert`
  );
});

// Добавление товара: /add Название | Описание | Цена | Категория | Ссылка
bot.command('add', async (ctx) => {
  if (!checkAdmin(ctx)) return;

  const rawText = ctx.message.text.replace('/add', '').trim();
  const parts = rawText.split('|').map((item) => item.trim());

  if (parts.length < 5) {
    return ctx.reply(
      '⚠️ Неверный формат!\n\nИспользуй:\n`/add Название | Описание | Цена | Категория | Ссылка_на_фото`',
      { parse_mode: 'Markdown' }
    );
  }

  const [title, description, priceStr, category, image_url] = parts;
  const price = parseInt(priceStr, 10);

  if (isNaN(price)) {
    return ctx.reply('⚠️ Ошибка: Цена должна быть числом!');
  }

  const { data, error } = await supabase
    .from('products')
    .insert([{ title, description, price, category, image_url }]);

  if (error) {
    console.error('Ошибка Supabase:', error);
    return ctx.reply(`❌ Ошибка сохранения в базе: ${error.message}`);
  }

  ctx.reply(`✅ Товар **"${title}"** успешно добавлен на сайт!`, { parse_mode: 'Markdown' });
});

// Просмотр текущего списка меню
bot.command('list', async (ctx) => {
  if (!checkAdmin(ctx)) return;

  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .order('id', { ascending: true });

  if (error) {
    return ctx.reply(`❌ Ошибка базы данных: ${error.message}`);
  }

  if (!products || products.length === 0) {
    return ctx.reply('📭 В базе данных пока нет товаров.');
  }

  let message = '📋 **Текущее меню на сайте:**\n\n';
  products.forEach((item) => {
    message += `🔹 **ID: ${item.id}** — ${item.title} (${item.price} ₽)\n`;
    message += `   Категория: \`${item.category}\` \n\n`;
  });

  ctx.reply(message, { parse_mode: 'Markdown' });
});

// Удаление товара по ID
bot.command('delete', async (ctx) => {
  if (!checkAdmin(ctx)) return;

  const productId = ctx.message.text.split(' ')[1];
  if (!productId) {
    return ctx.reply('⚠️ Укажите ID товара для удаления. Пример: `/delete 5`', { parse_mode: 'Markdown' });
  }

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', productId);

  if (error) {
    return ctx.reply(`❌ Ошибка при удалении: ${error.message}`);
  }

  ctx.reply(`🗑 Товар с ID **${productId}** успешно удалён с сайта!`, { parse_mode: 'Markdown' });
});

// ==========================================
// ЗАПУСК И ОБРАБОТКА ОШИБОК
// ==========================================
bot.catch((err, ctx) => {
  console.error(`Ошибка для бота ${ctx.updateType}:`, err);
});

bot.launch().then(() => {
  console.log('🤖 Бот-админка FastBite успешно запущен!');
}).catch((err) => {
  console.error('Ошибка запуска бота:', err);
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));