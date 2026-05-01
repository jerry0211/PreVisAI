const dialog = document.querySelector("#scenarioDialog");
const dialogTitle = document.querySelector("#dialogTitle");
const projectName = document.querySelector("#projectName");
const scenarioFile = document.querySelector("#scenarioFile");
const scenarioPreview = document.querySelector("#scenarioPreview");
const continueButton = document.querySelector("#continueButton");
const projectListItems = document.querySelector("#projectListItems");

const defaultProjects = ["Orbital Witness", "Glass Desert", "Signal Room"];

let scenarioText = "";

function getProjects() {
  const savedProjects = JSON.parse(localStorage.getItem("projects") || "null");
  return savedProjects || defaultProjects;
}

function saveProjects(projects) {
  localStorage.setItem("projects", JSON.stringify(projects));
}

function addProject(name) {
  const projects = getProjects();

  if (!projects.includes(name)) {
    projects.unshift(name);
    saveProjects(projects);
  }
}

function renderProjects() {
  projectListItems.innerHTML = "";

  getProjects().forEach((name) => {
    const button = document.createElement("button");
    button.className = "project-item";
    button.type = "button";
    button.dataset.project = name;
    button.textContent = name;
    button.addEventListener("click", () => {
      openScenarioDialog(name);
    });
    projectListItems.append(button);
  });
}

function openScenarioDialog(name = "") {
  scenarioText = "";
  dialogTitle.textContent = name ? `Project: ${name}` : "New Project";
  projectName.value = name;
  scenarioFile.value = "";
  scenarioPreview.textContent = "Upload a .txt scenario file.";
  continueButton.disabled = true;
  dialog.showModal();
}

document.querySelector("#newProjectButton").addEventListener("click", () => {
  openScenarioDialog();
});

scenarioFile.addEventListener("change", async () => {
  const [file] = scenarioFile.files;

  if (!file) {
    return;
  }

  scenarioText = await file.text();
  scenarioPreview.textContent = scenarioText;
  continueButton.disabled = false;
});

continueButton.addEventListener("click", (event) => {
  event.preventDefault();

  const name = projectName.value.trim() || "Untitled Project";

  addProject(name);
  renderProjects();
  sessionStorage.setItem("projectName", name);
  sessionStorage.setItem("projectScenario", scenarioText);
  window.location.href = "../storyboard-workflow/index.html";
});

renderProjects();
