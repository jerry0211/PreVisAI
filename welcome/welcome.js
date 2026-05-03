const userGreeting = document.querySelector("#userGreeting");
const statProjects = document.querySelector("#statProjects");

const PROJECT_SETUP_URL = "../project-setup/index.html";
const LOGIN_URL = "../login/index.html";
const LINGER_MS = 800;

const defaultProjects = ["Orbital Witness", "Glass Desert", "Signal Room"];

function getProjectCount() {
  const saved = JSON.parse(localStorage.getItem("projects") || "null");
  return (saved || defaultProjects).length;
}

function nameFromEmail(email) {
  const local = (email || "").split("@")[0] || "";
  const cleaned = local.replace(/[._-]+/g, " ").trim();
  if (!cleaned) {
    return "filmmaker";
  }
  return cleaned.replace(/\b\w/g, (c) => c.toUpperCase());
}

const email = sessionStorage.getItem("currentUser");

if (!email) {
  // Direct hit on /welcome/ without signing in — bounce back to login.
  window.location.replace(LOGIN_URL);
} else {
  userGreeting.textContent = nameFromEmail(email);
  statProjects.textContent = getProjectCount();

  window.setTimeout(() => {
    window.location.href = PROJECT_SETUP_URL;
  }, LINGER_MS);
}
