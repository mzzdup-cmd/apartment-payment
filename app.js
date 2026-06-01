// 1. Подключение Chart.js (убедитесь, что в HTML есть <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>)

// 2. Форма входа (Пароль для доступа)
const loginForm = document.createElement('div');
loginForm.className = 'login-form';
loginForm.innerHTML = `
  <h3>Вход</h3>
  <input type="password" id="password" placeholder="Введите пароль" required>
  <button id="loginBtn">Войти</button>
`;
document.querySelector('.app-container').prepend(loginForm); // Добавляем форму в начало

document.getElementById('loginBtn').addEventListener('click', function(e) {
  const pass = document.getElementById('password').value;
  if (pass === '12345') { // Пример пароля
    loginForm.style.display = 'none'; // Скрываем форму после входа
    generatePayments(); // Запускаем генерацию платежей
  } else {
    alert('Неверный пароль');
  }
});

// 3. Функция генерации платежей и графика
function generatePayments() {
  // Создаем список месяцев
  const monthsContainer = document.getElementById('months');
  monthsContainer.innerHTML = ''; // Очищаем перед заполнением

  const totalAmount = 2400000; // Общая сумма
  const monthlyPayment = totalAmount / 12; // Платеж в месяц

  for (let i = 1; i <= 12; i++) {
    const monthCard = document.createElement('div');
    monthCard.className = 'month-card';
    monthCard.innerHTML = `
      <div class="month-title">Месяц \${i}</div>
      <input class="amount-input" type="number" placeholder="Сумма платежа" 
             value="\${monthlyPayment}" min="0">
    `;
    monthsContainer.appendChild(monthCard);
  }

  // 4. Настройка графика выплат
  const ctx = document.getElementById('paymentChart').getContext('2d');
  const labels = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
  const data = Array(12).fill(monthlyPayment); // Массив из 12 одинаковых значений

  const paymentChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Платежи',
        data: data,
        borderColor: 'rgb(54, 162, 235)',
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        tension: 0.1
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          ticks: { stepSize: 500000 }
        }
      }
    }
  });

  // 5. Обновление баланса при изменении ввода
  document.querySelectorAll('.amount-input').forEach(input => {
    input.addEventListener('input', updateTotal);
  });

  function updateTotal() {
    const inputs = document.querySelectorAll('.amount-input');
    let paid = 0;
    inputs.forEach(input => {
      paid += parseFloat(input.value) || 0;
    });
    const total = 2400000;
    const remaining = total - paid;
    const percent = ((paid / total) * 100).toFixed(2);

    document.querySelector('.total-value').textContent = paid.toFixed(0) + ' ₽';
    document.querySelector('.progress-text').textContent = `${percent}% (${paid.toFixed(0)} ₽)`;
    document.querySelector('.progress-fill').style.width = `\${percent}%`;
    document.querySelector('.total-value-remaining').textContent = remaining.toFixed(0) + ' ₽';
  }

  // Вызываем первый раз для отображения начальных значений
  updateTotal();
}
