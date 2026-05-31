document.addEventListener("DOMContentLoaded", () => {

  const CORRECT_PASSWORD = "1234";

  const loginBtn = document.getElementById("loginBtn");
  const password = document.getElementById("password");
  const error = document.getElementById("error");

  const loginScreen = document.getElementById("loginScreen");
  const app = document.getElementById("app");

  const balanceEl = document.getElementById("balance");
  const monthsContainer = document.getElementById("months");

  const TOTAL = 2400000;

  let payments = {};

  let chart;

  // 🔥 FIREBASE
  const firebaseConfig = {
    apiKey: "AIzaSyC-3krnSTHSeDcEPjMrI_fklf_BylTFAGA",
    authDomain: "apartment-payment.firebaseapp.com",
    projectId: "apartment-payment",
    storageBucket: "apartment-payment.firebasestorage.app",
    messagingSenderId: "335389444987",
    appId: "1:335389444987:web:4e5e38ace539de7fd60bde"
  };

  firebase.initializeApp(firebaseConfig);
  const db = firebase.firestore();
  const docRef = db.collection("payments").doc("main");

  // 🔐 LOGIN
  loginBtn.addEventListener("click", () => {

    if (password.value === CORRECT_PASSWORD) {
      loginScreen.style.display = "none";
      app.style.display = "block";

      startRealtime();
    } else {
      error.innerText = "Неверный пароль";
    }

  });

  // 💰 БАЛАНС
  function updateBalance() {
    let paid = 0;

    Object.values(payments).forEach(p => {
      paid += Number(p.amount || 0);
    });

    const balance = TOTAL - paid;

    balanceEl.innerText = balance.toLocaleString("ru-RU") + " ₽";
  }

  // 📊 РЕНДЕР МЕСЯЦЕВ
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

        <input type="number"
          class="amountInput"
          value="${payments[i].amount}"
          placeholder="Сумма">

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

        docRef.set({ payments });

        updateBalance();
        updateChart();
      }

      input.addEventListener("input", save);
      checkbox.addEventListener("change", save);

      monthsContainer.appendChild(div);
    }

    updateBalance();
  }

  // 📊 ГРАФИК
  function updateChart() {

    const canvas = document.getElementById("paymentChart");
    if (!canvas) return;

    const labels = [];
    const data = [];

    for (let i = 0; i < 120; i++) {
      labels.push(i + 1);
      data.push(Number(payments[i]?.amount || 0));
    }

    if (chart) chart.destroy();

    chart = new Chart(canvas, {
      type: "line",
      data: {
        labels,
        datasets: [{
          label: "Выплаты",
          data,
          borderWidth: 2,
          tension: 0.3
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  // 🔥 FIREBASE LISTENER
  function startRealtime() {
    docRef.onSnapshot((doc) => {
      payments = doc.exists ? doc.data().payments : {};

      render();
      updateChart();
    });
  }

});
