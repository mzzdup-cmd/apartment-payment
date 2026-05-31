const CORRECT_PASSWORD = "1234";

document.addEventListener("DOMContentLoaded", () => {

  const loginBtn = document.getElementById("loginBtn");
  const error = document.getElementById("error");
  const loginScreen = document.getElementById("loginScreen");
  const app = document.getElementById("app");

  loginBtn.addEventListener("click", () => {

    const pass = document.getElementById("password").value;

    if (pass === CORRECT_PASSWORD) {
      loginScreen.classList.add("hidden");
      app.classList.remove("hidden");
    } else {
      error.innerText = "Неверный пароль";
    }

  });

});
