const CORRECT_PASSWORD = "1234";

const firebaseConfig = {
  apiKey: "AIzaSyC-3krnSTHSeDcEPjMrI_fklf_BylTFAGA",
  authDomain: "apartment-payment.firebaseapp.com",
  projectId: "apartment-payment",
  storageBucket: "apartment-payment.firebasestorage.app",
  messagingSenderId: "335389444987",
  appId: "1:335389444987:web:4e5e38ace539de7fd60bde",
  measurementId: "G-3LXY8Z2BCP"
};

firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();
const docRef = db.collection("payments").doc("main");

const TOTAL_AMOUNT = 2400000;
const MONTHLY_PLAN = 20000;

const loginScreen = document.getElementById("loginScreen");
const appScreen = document.getElementById("app");
const loginBtn = document.getElementById("loginBtn");
const errorEl = document.getElementById("error");

const yearsContainer = document.getElementById("yearsContainer");
const balanceEl = document.getElementById("balance");
const progressText = document.getElementById("progressText");

let chart = null;
let payments = {};

const monthNames = [
  "Январь",
  "Февраль",
  "Март",
  "Апрель",
  "Май",
  "Июнь",
  "Июль",
  "Август",
  "Сентябрь",
  "Октябрь",
  "Ноябрь",
  "Декабрь"
];

loginBtn.addEventListener("click", () => {
  const pass = document.getElementById("password").value;

  if (pass === CORRECT_PASSWORD) {
    loginScreen.classList.add("hidden");
    appScreen.classList.remove("hidden");
    startRealtime();
  } else {
    errorEl.textContent = "Неверный пароль";
  }
});

function startRealtime() {
  docRef.onSnapshot((doc) => {
    if (doc.exists) {
      payments = doc.data().payments || {};
    } else {
      payments = {};
    }

    renderYears();
    updateSummary();
  });
}

function renderYears() {
  yearsContainer.innerHTML = "";

  const years = {};

  let index = 0;

  for (let year = 2026; year <= 2036; year++) {
    years[year] = [];

    let startMonth = 0;
    let endMonth = 11;

    if (year === 2026) {
      startMonth = 8;
    }

    if (year === 2036) {
      endMonth = 7;
    }

    for (let month = startMonth; month <= endMonth; month++) {
      years[year].push({
        index,
        month,
        year
      });

      index++;
    }
  }

  Object.keys(years).forEach((year) => {
    const yearCard = document.createElement("div");
    yearCard.className = "year-card";

    const header = document.createElement("div");
    header.className = "year-header";

    header.innerHTML = `
      <span>${year}</span>
      <span class="arrow ${year == 2026 ? "open" : ""}">
        ▼
      </span>
    `;

    const content = document.createElement("div");
    content.className =
      "year-content " +
      (year == 2026 ? "open" : "");

    header.addEventListener("click", () => {
      content.classList.toggle("open");
      header
        .querySelector(".arrow")
        .classList.toggle("open");
    });

    years[year].forEach((item) => {
      if (!payments[item.index]) {
        payments[item.index] = {
          amount: "",
          paid: false
        };
      }

      const monthRow = document.createElement("div");
      monthRow.className = "month-row";

      monthRow.innerHTML = `
        <div class="month-name">
          ${monthNames[item.month]}
        </div>

        <div class="plan">
          План: ${MONTHLY_PLAN.toLocaleString("ru-RU")} ₽
        </div>

        <div class="payment-controls">

          <input
            type="number"
            class="amount-input"
            value="${payments[item.index].amount}"
            placeholder="Введите сумму">

          <input
            type="checkbox"
            class="paid-checkbox"
            ${payments[item.index].paid ? "checked" : ""}>

        </div>
      `;

      const amountInput =
        monthRow.querySelector(".amount-input");

      const checkbox =
        monthRow.querySelector(".paid-checkbox");

      function save() {
        payments[item.index] = {
          amount: amountInput.value,
          paid: checkbox.checked
        };

        docRef.set({
          payments: payments
        });

        updateSummary();
      }
      amountInput.addEventListener("input", save);
      checkbox.addEventListener("change", save);

      content.appendChild(monthRow);
    });

    yearCard.appendChild(header);
    yearCard.appendChild(content);

    yearsContainer.appendChild(yearCard);
  });
}

function updateSummary() {
  let paidTotal = 0;

  Object.values(payments).forEach((item) => {
    if (item.paid) {
      paidTotal += Number(item.amount || 0);
    }
  });

  const balance = TOTAL_AMOUNT - paidTotal;

  balanceEl.textContent =
    balance.toLocaleString("ru-RU") + " ₽";

  const percent =
    Math.round((paidTotal / TOTAL_AMOUNT) * 100);

  progressText.textContent =
    "Выплачено: " +
    percent +
    "% (" +
    paidTotal.toLocaleString("ru-RU") +
    " ₽)";

  drawChart(percent);
}

function drawChart(percent) {
  const ctx =
    document
      .getElementById("paymentChart")
      .getContext("2d");

  if (chart) {
    chart.destroy();
  }

  chart = new Chart(ctx, {
    type: "doughnut",

    data: {
      labels: [
        "Выплачено",
        "Осталось"
      ],

      datasets: [
        {
          data: [
            percent,
            100 - percent
          ],

          backgroundColor: [
            "#22c55e",
            "#e5e7eb"
          ],

          borderWidth: 0
        }
      ]
    },

    options: {
      responsive: true,

      plugins: {
        legend: {
          position: "bottom"
        }
      }
    }
  });
}

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js");
}
