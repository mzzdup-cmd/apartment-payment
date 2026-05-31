document.addEventListener("DOMContentLoaded", () => {
  console.log("JS ЗАПУСТИЛСЯ");

  const loginBtn = document.getElementById("loginBtn");
  const password = document.getElementById("password");
  const error = document.getElementById("error");

  const loginScreen = document.getElementById("loginScreen");
  const app = document.getElementById("app");

  loginBtn.addEventListener("click", () => {
    console.log("КЛИК");

    if (password.value === "1234") {
      loginScreen.style.display = "none";
      app.style.display = "block";
    } else {
      error.innerText = "Неверный пароль";
    }
  });
});
