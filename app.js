document.addEventListener('DOMContentLoaded', function() {
  // Настройки
  const TOTAL_AMOUNT = 2400000; // Общая сумма
  const PASSWORD = '1234'; // Пароль для входа
  const START_DATE = new Date(2026, 8, 1); // Сентябрь 2026 (месяц 8, т.к. в JS январь = 0)
  const MONTHS_COUNT = 120; // 10 лет вперёд

  // Мапы для названий месяцев
  const monthNames = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];

  // 1. Создаём форму входа
  const loginForm = document.createElement('div');
  loginForm.className = 'login-form';
  loginForm.innerHTML = `
    <h3>Вход</h3>
    <input type="password" id="password" placeholder="Введите пароль" required>
    <button id="loginBtn">Войти</button>
  `;
  document.querySelector('.app-container').prepend(loginForm);

  document.getElementById('loginBtn').addEventListener('click', function(e) {
    const pass = document.getElementById('password').value;
    if (pass === PASSWORD) {
      loginForm.style.display = 'none';
      generatePayments();
    } else {
      alert('Неверный пароль');
    }
  });

  // 2. Функция генерации платежей и графика
  function generatePayments() {
    const monthsContainer = document.getElementById('months');
    monthsContainer.innerHTML = '';

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

      const monthCard = document.createElement('div');
      monthCard.className = 'month-card';
      monthCard.innerHTML = `
        <div class="month-title">${monthName} ${year}</div>
        <input class="amount-input" type="number" placeholder="Сумма платежа"
               value="${monthlyPayment.toFixed(2)}" min="0" step="0.01">
      `;
      monthsContainer.appendChild(monthCard);
    }

    // 3. Настройка графика выплат
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
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: function(tooltipItem) {
                return `${tooltipItem.label}: ${tooltipItem.raw.toFixed(2)} ₽`;
              }
            }
          }
        }
      }
    });

    // 4. Обновление баланса при изменении ввода
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
      document.querySelector('.progress-fill').style.width = `${percent}%`;
      document.querySelector('.total-value-remaining').textContent = remaining.toFixed(2) + ' ₽';

      // Обновляем данные на графике
      paymentChart.data.datasets[0].data = Array.from(inputs, input => parseFloat(input.value) || 0);
      paymentChart.update();
    }

    // Вызываем первый раз для отображения начальных значений
    updateTotal();
  }
});
