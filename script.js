// Функция автоматического создания и скачивания файла скина
function downloadSkin(filename) {
    // Текст внутри файла, который скачает пользователь
    const content = `=========================================
RobloSkin Setup Config
Файл: ${filename}
=========================================

Инструкция по установке:
1. Запустите Roblox и откройте Avatar Editor.
2. Используйте ID предметов, указанные ниже, или импортируйте через конфигуратор:
   - Accessory ID: [9842103948]
   - Shirt/Pants ID: [4820194812]
3. Наслаждайтесь обновленным образом!

Спасибо, что используете RobloSkin!`;

    // Создаем виртуальный файл для скачивания
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    
    // Инициируем скачивание
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Освобождаем память
    URL.revokeObjectURL(url);

    // Показываем красивое всплывающее уведомление (Toast)
    showToast();
}

// Функция показа анимации уведомления
function showToast() {
    const toast = document.getElementById('toast');
    toast.classList.add('show');
    
    // Автоматически скрываем через 3 секунды
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}