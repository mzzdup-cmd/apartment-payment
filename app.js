const CORRECT_PASSWORD = “1234”;
/* =========================
НАСТРОЙКИ
========================= */
const TOTAL = 2400000;
const MONTH_PAYMENT = 20000;
const MONTHS_COUNT = TOTAL / MONTH_PAYMENT;
const START_YEAR = 2026;
/* =========================
FIREBASE
========================= */
const firebaseConfig = {
apiKey: “AIzaSyC-3krnSTHSeDcEPjMrI_fklf_BylTFAGA”,
authDomain: “apartment-payment.firebaseapp.com”,
projectId: “apartment-payment”,
storageBucket: “apartment-payment.firebasestorage.app”,
messagingSenderId: “335389444987”,
appId: “1:335389444987:web:4e5e38ace539de7fd60bde”,
measurementId: “G-3LXY8Z2BCP”
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const docRef = db.collection(“payments”).doc(“main”);
/* =========================
UI
========================= */
const loginScreen = document.getElementById(“loginScreen”);
const appScreen = document.getElementById(“app”);
const loginBtn = document.getElementById(“loginBtn”);
const error = document.getElementById(“error”);
const monthsContainer = document.getElementById(“months”);
const balanceEl = document.getElementById(“balance”);
const exportBtn = document.getElementById(“exportBtn”);
let payments = {};
let chart = null;
/* =========================
LOGIN
========================= */
loginBtn.addEventListener(“click”, () => {
const pass = document.getElementById(“password”).value;
if (pass === CORRECT_PASSWORD) {
loginScreen.classList.add("hidden");
appScreen.classList.remove("hidden");

startRealtime();
} else {
error.textContent = "Неверный пароль";
}
});
/* =========================
BALANCE
========================= */
function calculatePaid() {
let paid = 0;
Object.values(payments).forEach(item => {
paid += Number(item.amount || 0);
});
return paid;
}
function calculateBalance() {
return TOTAL - calculatePaid();
}
function updateBalance() {
const paid = calculatePaid();
const balance = calculateBalance();
balanceEl.textContent =
balance.toLocaleString(“ru-RU”) + “ ₽”;
const percent =
Math.min(
100,
Math.round((paid / TOTAL) * 100)
);
const fill =
document.getElementById(“progressFill”);
const text =
document.getElementById(“progressText”);
fill.style.width = percent + “%”;
text.textContent =
“Выплачено: “ +
percent +
“% (” +
paid.toLocaleString(“ru-RU”) +
“ ₽)”;
updateChart(paid, balance);
}
/* =========================
CHART
========================= */
function updateChart(paid, balance) {
const ctx =
document
.getElementById(“paymentChart”)
.getContext(“2d”);
if (chart) {
chart.destroy();
}
chart = new Chart(ctx, {
type: "doughnut",

data: {

  labels: [
    "Выплачено",
    "Остаток"
  ],

  datasets: [{
    data: [
      paid,
      balance
    ]
  }]

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
/* =========================
FIRESTORE
========================= */
function startRealtime() {
docRef.onSnapshot((doc) => {
payments =
  doc.exists
    ? (doc.data().payments || {})
    : {};

render();
});
}
/* =========================
EXCEL
========================= */
function exportExcel() {
const rows = [];
for (let i = 0; i < MONTHS_COUNT; i++) {
const date =
  new Date(START_YEAR, i);

const monthName =
  date.toLocaleString("ru-RU", {
    month: "long",
    year: "numeric"
  });

const payment =
  payments[i] || {};

rows.push({

  "Месяц": monthName,
  "План": MONTH_PAYMENT,
  "Факт": payment.amount || "",
  "Оплачено":
    payment.paid ? "Да" : "Нет"

});
}
const worksheet =
XLSX.utils.json_to_sheet(rows);
const workbook =
XLSX.utils.book_new();
XLSX.utils.book_append_sheet(
workbook,
worksheet,
“Платежи”
);
XLSX.writeFile(
workbook,
“payments.xlsx”
);
}
if (exportBtn) {
exportBtn.addEventListener(
“click”,
exportExcel
);
}
/* =========================
SAVE
========================= */
function saveToFirestore() {
docRef.set({
payments
});
}
/* =========================
RENDER
========================= */
function render() {
monthsContainer.innerHTML = “”;
for (
let i = 0;
i < MONTHS_COUNT;
i++
) {
const date =
  new Date(
    START_YEAR,
    i
  );
  const monthName =
  date.toLocaleString(
    "ru-RU",
    {
      month: "long",
      year: "numeric"
    }
  );

if (!payments[i]) {

  payments[i] = {

    amount: "",
    paid: false

  };

}

const div =
  document.createElement("div");

div.className = "month";

if (payments[i].paid) {
  div.classList.add("paid");
}

div.innerHTML = `
  <div class="month-title">
    ${monthName}
  </div>

  <div class="plan">
    План: ${MONTH_PAYMENT.toLocaleString("ru-RU")} ₽
  </div>

  <input
    type="number"
    class="amountInput"
    value="${payments[i].amount}"
    placeholder="Факт внесения">

  <div class="checkbox-row">

    <input
      type="checkbox"
      class="paidCheckbox"
      ${payments[i].paid ? "checked" : ""}>

    <span>
      Оплачено
    </span>

  </div>
`;

const amountInput =
  div.querySelector(".amountInput");

const checkbox =
  div.querySelector(".paidCheckbox");

function save() {

  payments[i].amount =
    amountInput.value;

  payments[i].paid =
    checkbox.checked;

  saveToFirestore();

  updateBalance();

}

amountInput.addEventListener(
  "input",
  save
);

checkbox.addEventListener(
  "change",
  save
);

monthsContainer.appendChild(div);
}
updateBalance();
}
/* =========================
SERVICE WORKER
========================= */
if (“serviceWorker” in navigator) {
navigator.serviceWorker
.register(“sw.js”)
.catch(console.error);
}