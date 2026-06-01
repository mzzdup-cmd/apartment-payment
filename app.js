document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM загружен');

  // Настройки
  const TOTAL_AMOUNT = 2400000;
  const PASSWORD = '1234';
  const START_DATE = new Date(2026, 8, 1); // Сентябрь 2026
  const MONTHS_COUNT = 120;

  const monthNames = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];

  // 1. Создаем полную структуру страницы
  const appContainer = document.querySelector('.app-container');
  
  // Создаем блок с формой входа
  const loginForm = document.createElement('div');
  loginForm.className = 'login-form';
  loginForm.innerHTML = `
    <h3>Вход</h3>
    <input type="password" id="password" placeholder="Введите пароль" required>
    <button id="loginBtn">Войти</button>
  `;

  // Создаем блок с информацией об оплате
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

  // Создаем блок графика
  const chartBlock = document.createElement('div');
  chartBlock.innerHTML = `
    <h3>График выплат</h3>
    <canvas id="paymentChart"></canvas>
  `;

  // Создаем блок месяцев
  const monthsBlock = document.createElement('div');
  monthsBlock.id = 'months';
  monthsBlock.innerHTML = '<h3>Платежи по месяцам</h3>';

  // Собираем всё в контейнер
  appContainer.appendChild(loginForm);
  appContainer.appendChild(paymentInfo);
  appContainer.appendChild(chartBlock);
  appContainer.appendChild(monthsBlock);

  // 2. Скрываем всё, кроме формы входа (инициализация)
  paymentInfo.style.display = 'none';
  chartBlock.style.display = 'none';
  monthsBlock.style.display = 'none';

  // 3. Обработчик входа
  document.getElementById('loginBtn').addEventListener('click', function(e) {
    const pass = document.getElementById('password').value;
    if (pass === PASSWORD) {
      // Показываем спрятанные блоки
      paymentInfo.style.display = 'block';
      chartBlock.style.display = 'block';
      monthsBlock.style.display = 'block';
      loginForm.remove(); // Убираем форму входа
      generatePayments(); // Генерируем контент
    } else {
      alert('Неверный пароль');
    }
  });

  // 4. Функция генерации данных (вызывается только после входа)
  function generatePayments() {
    console.log('Запуск генерации платежей');

    const monthlyPayment = TOTAL_AMOUNT / MONTHS_COUNT;
    const labels = [];
    const data = [];

    // Собираем данные и создаем карточки
    for (let i = 0; i < MONTHS_COUNT; i++) {
      const date = new Date(START_DATE);
      date.setMonth(START_DATE.getMonth() + i);
      const monthIndex = date.getMonth();
      const monthName = monthNames[monthIndex];
      const year = date.getFullYear();

      labels.push(`${monthName} ${year}`);
      data.push(monthlyPayment);

      // Создаем карточку месяца
      const monthCard = document.createElement('div');
      monthCard.className = 'month-card';
      monthCard.innerHTML = `
        <div class="month-title">${monthName} ${year}</div>
        <input class="amount-input" type="number" placeholder="Сумма платежа"
               value="\${monthlyPayment.toFixed(2)}" min="0" step="0.01">
      `;
      document.getElementById('months').appendChild(monthCard);
    }

    // 5. Создаем график
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

    // 6. Логика обновления баланса
    document.querySelectorAll('.amount-input').forEach(input => {
      input.addEventListener('input', updateTotal);
    });

    function updateTotal() {
      const inputs = document.querySelectorAll('.amount-input');
      let paid = 0;
      inputs.forEach(input => {
        paid += parseFloat(input.value) || 0;
      });
      const remaining = TOTAL_AMOUNT - paid;
      const percent = ((paid / TOTAL_AMOUNT) * 100).toFixed(2);

      document.querySelector('.total-value').textContent = paid.toFixed(2) + ' ₽';
      document.querySelector('.progress-text').textContent = `${percent}% (${paid.toFixed(2)} ₽)`;
      document.querySelector('.progress-fill').style.width = `\${percent}%`;
      document.querySelector('.total-value-remaining').textContent = remaining.toFixed(2) + ' ₽';

      // Обновляем график
      paymentChart.data.datasets.data = Array.from(inputs, input => parseFloat(input.value) || 0);
      paymentChart.update();
    }

    updateTotal(); // Первый запуск
  }
});
