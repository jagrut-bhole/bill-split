//login and sign-up script code
const form = document.querySelector("form");

//errors
const emailError = document.querySelector(".email.error");
const passwordError = document.querySelector(".password.error");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // reset errors
  emailError.textContent = "";
  passwordError.textContent = "";

  //getting values
  const email = form.email.value;
  const password = form.password.value;

  try {
    const res = await fetch("/login", {
      method: "POST",
      body: JSON.stringify({
        email,
        password,
      }),
      headers: { "Content-type": "application/json" },
    });
    const data = await res.json();
    console.log(data);
    if (data.errors) {
      emailError.textContent = data.errors.email;
      passwordError.textContent = data.errors.password;
    }
    if (data.user) {
      location.assign('/');
    }
  } catch (err) {
    console.error(err);
  }
});
