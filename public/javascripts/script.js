//main landing page script code
// document.getElementById("navigate-button").onclick = function(){
//   window.location.href = "/signup";
// };

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();

    document.querySelector(this.getAttribute("href")).scrollIntoView({
      behavior: "smooth",
    });
  });
});


