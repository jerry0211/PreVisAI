const loginForm = document.querySelector("#loginForm");
const emailInput = document.querySelector("#emailInput");
const passwordInput = document.querySelector("#passwordInput");
const signInButton = document.querySelector("#signInButton");
const authHint = document.querySelector("#authHint");

const WELCOME_URL = "../welcome/index.html";
const MIN_PASSWORD_LENGTH = 6;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function setHint(visible) {
  if (!authHint) return;
  authHint.hidden = !visible;
}

function isFormValid() {
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!EMAIL_REGEX.test(email)) {
    return false;
  }
  if (!password || password.length < MIN_PASSWORD_LENGTH) {
    return false;
  }
  return true;
}

// Block any form submission completely — Enter / autofill must not navigate.
loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
});

[emailInput, passwordInput].forEach((input) => {
  input.addEventListener("input", () => setHint(false));
});

signInButton.addEventListener("click", () => {
  if (!isFormValid()) {
    setHint(true);
    if (typeof loginForm.reportValidity === "function") {
      loginForm.reportValidity();
    }
    return;
  }

  setHint(false);
  signInButton.classList.add("loading");
  signInButton.disabled = true;

  sessionStorage.setItem("currentUser", emailInput.value.trim());

  window.setTimeout(() => {
    window.location.href = WELCOME_URL;
  }, 500);
});
