console.log("JS ЗАГРУЗИЛСЯ");

document.addEventListener("DOMContentLoaded", () => {

  const btn = document.getElementById("loginBtn");
  const error = document.getElementById("error");

  btn.addEventListener("click", () => {
    console.log("КНОПКА НАЖАТА");
    error.innerText = "JS работает";
  });

});
