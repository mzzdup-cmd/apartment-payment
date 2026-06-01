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

  // 4. Генерация платежей и графика
  function generatePayments() {
    const monthlyPayment = TOTAL_AMOUNT / MONTHS_COUNT;
    const labels = [];
    const data = [];

    for (let i = 0; i < MONTHS_COUNT; i++) {
      const date = new Date(START_DATE);
      date.setMonth(START_DATE.getMonth() + i);
      const monthIndex = date.getMonth();
      const monthName = monthNames[monthIndex];
      const year = date.getFullYear();

      labels.push(`${monthName} ${year}`);
      data.push(monthlyPayment);

      // Создаем карточку
      const monthCard = document.createElement('div');
      monthCard.className = 'month-card';
      monthCard.innerHTML = `
        <div class="month-title">${monthName} ${year}</div>
        <input class="amount-input" type="number" 
               value="\${monthlyPayment.toFixed(2)}" min="0" step="0.01">
      `;
      document.getElementById('months').appendChild(monthCard);
    }

    // Создаем график
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

    // Логика обновления
    document.querySelectorAll('.amount-input').forEach(input => {
      input.addEventListener('input', updateTotal);
    });

    function updateTotal() {
      const inputs = document.querySelectorAll('.amount-input');
      let paid = 0;
      inputs.forEach(input => paid += parseFloat(input.value) || 0);
      const remaining = TOTAL_AMOUNT - paid;
      const percent = ((paid / TOTAL_AMOUNT) * 100).toFixed(2);

      document.querySelector('.total-value').textContent = paid.toFixed(2) + ' ₽';
      document.querySelector('.progress-text').textContent = `${percent}% (${paid.toFixed(2)} ₽)`;
      document.querySelector('.progress-fill').style.width = `\${percent}%`;
      document.querySelector('.total-value-remaining').textContent = remaining.toFixed(2) + ' ₽';

      paymentChart.data.datasets.data = Array.from(inputs, input => parseFloat(input.value) || 0);
      paymentChart.update();
    }

    updateTotal();
  }
});
