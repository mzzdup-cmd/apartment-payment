document.addEventListener("DOMContentLoaded", () => {
  const CORRECT_PASSWORD = "1234";

  const loginBtn = document.getElementById("loginBtn");
  const passwordInput = document.getElementById("password");
  const error = document.getElementById("error");

  const loginScreen = document.getElementById("loginScreen");
  const app = document.getElementById("app");

  const monthsContainer = document.getElementById("months");
  const balanceEl = document.getElementById("balance");
  const progressFill = document.getElementById("progressFill");
  const progressText = document.getElementById("progressText");
  const exportBtn = document.getElementById("exportBtn");

  const TOTAL = 2400000;

  let payments = {};
  let chart;

  // LOGIN
  loginBtn.addEventListener("click", () => {
    if (passwordInput.value === CORRECT_PASSWORD) {
      loginScreen.style.display = "none";
      app.style.display = "block";
      start();
    } else {
      error.innerText = "Неверный пароль";
    }
  });

  function start() {
    render();
    updateBalance();
    updateChart();
  }

  function render() {
    monthsContainer.innerHTML = "";

    for (let i = 0; i < 120; i++) {
      if (!payments[i]) {
        payments[i] = { amount: "", paid: false };
      }

      const div = document.createElement("div");
      div.className = "month";

      div.innerHTML = `
        <div class="month-title">Месяц ${i + 1}</div>
        <input type="number" value="${payments[i].amount}" placeholder="Сумма" class="amountInput">
        <label class="checkbox-row">
          <input type="checkbox" ${payments[i].paid ? "checked" : ""}>
          оплачено
        </label>
      `;

      const input = div.querySelector("input[type='number']");
      const checkbox = div.querySelector("input[type='checkbox']");

      function save() {
        payments[i].amount = input.value;
        payments[i].paid = checkbox.checked;
        updateBalance();
        updateChart();
      }

      input.addEventListener("input", save);
      checkbox.addEventListener("change", save);

      monthsContainer.appendChild(div);
    }
  }

  function updateBalance() {
    let paid = 0;

    Object.values(payments).forEach(p => {
      paid += Number(p.amount || 0);
    });

    const remaining = TOTAL - paid;
    const percent = Math.round((paid / TOTAL) * 100);

    balanceEl.innerText = remaining.toLocaleString("ru-RU") + " ₽";
    progressFill.style.width = percent + "%";
    progressText.innerText = `Выплачено: ${percent}% (${paid.toLocaleString("ru-RU")} ₽)`;
  }

  function updateChart() {
    const ctx = document.getElementById("paymentChart");
    if (!ctx) return;

    const labels = [];
    const data = [];

    for (let i = 0; i < 120; i++) {
      labels.push(i + 1);
      data.push(Number(payments[i]?.amount || 0));
    }

    if (chart) chart.destroy();

    chart = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [{
          label: "Выплаты",
          data,
          borderColor: "#2563eb",
          backgroundColor: "rgba(37, 99, 235, 0.1)",
          borderWidth: 2,
          tension: 0.3
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

  // Excel export
  exportBtn.addEventListener("click", () => {
    const data = [["Месяц", "Сумма", "Оплачено"]];

    for (let i = 0; i < 120; i++) {
      data.push([
        i + 1,
        payments[i]?.amount || 0,
        payments[i]?.paid ? "Да" : "Нет"
      ]);
    }

    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Payments");
    XLSX.writeFile(wb, "payments.xlsx");
  });
});
