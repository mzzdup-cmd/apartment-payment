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
