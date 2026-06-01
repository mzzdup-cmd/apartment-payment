document.addEventListener('DOMContentLoaded', function() {

  // Настройки
  const TOTAL_AMOUNT = 2400000;
  const PASSWORD = '1234';
  const START_DATE = new Date(2026, 8, 1); // Сентябрь 2026
  const MONTHS_COUNT = 120;

  const monthNames = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];

  // 1. Создаем форму входа и показываем её сразу
  const loginForm = document.createElement('div');
  loginForm.className = 'login-form';
  loginForm.innerHTML = `
    <h3>Вход</h3>
    <input type="password" id="password" placeholder="Введите пароль" required>
    <button id="loginBtn">Войти</button>
  `;
  document.body.appendChild(loginForm);

  // 2. Обработчик входа
  document.getElementById('loginBtn').addEventListener('click', function(e) {
    const pass = document.getElementById('password').value;
    if (pass === PASSWORD) {
      loginForm.remove(); // Убираем форму
      createApp(); // Создаем весь интерфейс
    } else {
      alert('Неверный пароль');
    }
  });

  // 3. Функция создания всего интерфейса (вызывается только после входа)
  function createApp() {
    const appContainer = document.createElement('div');
    appContainer.className = 'app-container';

    // Блок с информацией
    const paymentInfo = document.createElement('div');
    paymentInfo.innerHTML = `
      <div class="payment-title">Оплата квартиры</div>
      <div class="total-value-remaining">2 400 000 ₽</div>
      <div class="progress-bar">
        <div class="progress-fill" style="width: 0%;"></div>
        <div class="progress-text">0% (0 ₽)</div>
      </div>
      <div class="total-value">0 ₽</div>
    `;

    // Блок графика
    const chartBlock = document.createElement('div');
    chartBlock.innerHTML = `
      <h3>График выплат</h3>
      <canvas id="paymentChart"></canvas>
    `;

    // Блок месяцев
    const monthsBlock = document.createElement('div');
    monthsBlock.id = 'months';
    monthsBlock.innerHTML = '<h3>Платежи по месяцам</h3>';

    // Собираем всё
    appContainer.appendChild(paymentInfo);
    appContainer.appendChild(chartBlock);
    appContainer.appendChild(monthsBlock);
    document.body.appendChild(appContainer);

    generatePayments();
  }

 function generatePayments() {
  const monthlyPayment = TOTAL_AMOUNT / MONTHS_COUNT;
  const labels = [];
  const data = [];

  // Получаем контейнер для месяцев
  const monthsBlock = document.getElementById('months');

  // Генерируем строки с месяцами
  for (let i = 0; i < MONTHS_COUNT; i++) {
    const date = new Date(START_DATE);
    date.setMonth(date.getMonth() + i);
    const monthName = monthNames[date.getMonth()];
    const year = date.getFullYear();

    const row = document.createElement('div');
    row.className = 'payment-row';

    // 1. Название месяца
    const monthNameEl = document.createElement('div');
    monthNameEl.className = 'month-name';
    monthNameEl.textContent = `${monthName} ${year}`;

    // 2. Желаемая сумма (серым цветом)
    const desiredAmount = document.createElement('div');
    desiredAmount.className = 'desired-amount';
    desiredAmount.textContent = `\${monthlyPayment.toFixed(2)} ₽`;

    // 3. Поле ввода внесенной суммы
    const input = document.createElement('input');
    input.type = 'number';
    input.min = '0';
    input.className = 'payment-input';

    // 4. Чекбокс "Сумма внесена"
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'payment-checkbox';

    const checkboxLabel = document.createElement('label');
    checkboxLabel.htmlFor = `check-\${i}`;
    checkboxLabel.textContent = 'Сумма внесена';

    // Собираем строку
    row.appendChild(monthNameEl);
    row.appendChild(desiredAmount);
    row.appendChild(input);
    row.appendChild(checkbox);
    row.appendChild(checkboxLabel);

    monthsBlock.appendChild(row);

    // Для графика
    labels.push(`${monthName} ${year}`);
    data.push(0); // Начальное значение платежа
  }

  // --- СОЗДАНИЕ ГРАФИКА ---
  const ctx = document.getElementById('paymentChart').getContext('2d');
  const paymentChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Платежи',
        data: data,
        borderColor: 'rgb(54, 162, 235)',
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        tension: 0.1,
        borderWidth: 3
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          ticks: { stepSize: 200000 }
        }
      }
    }
  });

  // --- ЛОГИКА ПЕРЕСЧЕТА ---
  function recalculateBalance() {
    let totalPaid = 0;

    const inputs = document.querySelectorAll('.payment-input');
    inputs.forEach(input => {
      if (input.value !== '') {
        totalPaid += parseFloat(input.value);
      }
    });

    // Обновляем прогресс-бар и текст
    const percent = ((totalPaid / TOTAL_AMOUNT) * 100).toFixed(2);
    document.querySelector('.progress-text').textContent = `${percent}% (${totalPaid.toFixed(2)} ₽)`;
    document.querySelector('.progress-fill').style.width = `\${percent}%`;
    document.querySelector('.total-value').textContent = totalPaid.toFixed(2) + ' ₽';
    document.querySelector('.total-value-remaining').textContent = (TOTAL_AMOUNT - totalPaid).toFixed(2) + ' ₽';

    // Обновляем данные на графике
    paymentChart.data.datasets.data = Array.from(inputs, input => parseFloat(input.value) || 0);
    paymentChart.update();
  }

  // Подключаем обработчики
  const inputs = document.querySelectorAll('.payment-input');
  inputs.forEach(input => {
    input.addEventListener('input', recalculateBalance);
  });

  const checkboxes = document.querySelectorAll('.payment-checkbox');
  checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', recalculateBalance);
  });

  // Первый запуск пересчета
  recalculateBalance();
}
}
