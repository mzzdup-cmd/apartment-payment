document.addEventListener("DOMContentLoaded", () => {

  console.log("JS START");

  const CORRECT_PASSWORD = "1234";

  const loginBtn = document.getElementById("loginBtn");
  const password = document.getElementById("password");
  const error = document.getElementById("error");

  const loginScreen = document.getElementById("loginScreen");
  const app = document.getElementById("app");

  loginBtn.addEventListener("click", () => {

    console.log("CLICK");

    if (password.value === CORRECT_PASSWORD) {

      loginScreen.style.display = "none";
      app.style.display = "block";

      // тест графика (потом расширим)
      const ctx = document.getElementById("paymentChart");

      if (ctx) {
        new Chart(ctx, {
          type: "line",
          data: {
            labels: ["Янв", "Фев", "Мар"],
            datasets: [{
              label: "Выплаты",
              data: [10000, 20000, 30000]
            }]
          }
        });
      }

    } else {
      error.innerText = "Неверный пароль";
    }

  });

});
let chart;

function updateChart(payments) {
  const canvas = document.getElementById("paymentChart");
  if (!canvas) return;

  const labels = [];
  const data = [];

  // собираем данные
  for (let i = 0; i < 120; i++) {
    const item = payments[i];

    labels.push(i + 1); // просто номер месяца
    data.push(Number(item?.amount || 0));
  }

  // если график уже есть — удаляем
  if (chart) {
    chart.destroy();
  }

  chart = new Chart(canvas, {
    type: "line",
    data: {
      labels: labels,
      datasets: [{
        label: "Выплаты",
        data: data,
        borderWidth: 2,
        tension: 0.3, // делает линию плавной
        pointRadius: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}
