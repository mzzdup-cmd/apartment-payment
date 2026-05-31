document.addEventListener("DOMContentLoaded", () => {

  const btn = document.getElementById("loginBtn");
  const input = document.getElementById("password");
  const error = document.getElementById("error");
  const login = document.getElementById("loginScreen");
  const app = document.getElementById("app");

  const CORRECT_PASSWORD = "1234";

  btn.addEventListener("click", () => {

    const value = input.value;

    if (value === CORRECT_PASSWORD) {

      login.classList.add("hidden");
      app.classList.remove("hidden");

      console.log("LOGIN OK");

    } else {

      error.innerText = "Неверный пароль";

    }

  });

});
