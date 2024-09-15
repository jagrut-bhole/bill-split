//login and sign-up script code
const form = document.querySelector("form");

//errors
const nameError = document.querySelector(".name.error");
const emailError = document.querySelector(".email.error");
const usernameError = document.querySelector(".username.error");
const passwordError = document.querySelector(".password.error");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // reset errors
  nameError.textContent = "";
  usernameError.textContent = "";
  emailError.textContent = "";
  passwordError.textContent = "";

  //getting values
  const name = form.name.value;
  const username = form.username.value;
  const email = form.email.value;
  const password = form.password.value;

  try {
    const res = await fetch("/signup", {
      method: "POST",
      body: JSON.stringify({
        name,
        username,
        email,
        password,
      }),
      headers: { "Content-type": "application/json" },
    });
    const data = await res.json();
    console.log(data);
    if (data.errors) {
      nameError.textContent = data.errors.name;
      emailError.textContent = data.errors.email;
      usernameError.textContent = data.errors.username;
      passwordError.textContent = data.errors.password;
    }
    if (data.user) {
      location.assign('/');
    }
  } catch (err) {
    console.error(err);
  }
});
