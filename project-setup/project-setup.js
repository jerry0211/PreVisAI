const dialog = document.querySelector("#scenarioDialog");
const dialogTitle = document.querySelector("#dialogTitle");
const projectName = document.querySelector("#projectName");
const scenarioFile = document.querySelector("#scenarioFile");
const scenarioPreview = document.querySelector("#scenarioPreview");
const continueButton = document.querySelector("#continueButton");
const projectListItems = document.querySelector("#projectListItems");
const newProjectButton = document.querySelector("#newProjectButton");
const newProjectCard = document.querySelector("#newProjectCard");
const dialogCloseButton = document.querySelector("#dialogCloseButton");

const defaultProjects = ["Orbital Witness", "Glass Desert", "Signal Room"];

const projectMeta = {
  "Orbital Witness": "SF 스릴러 · 씬 4개",
  "Glass Desert": "추리 드라마 · 씬 3개",
  "Signal Room": "단편 첩보물 · 씬 2개"
};

let scenarioText = "";

function getProjects() {
  let savedProjects = null;
  try {
    savedProjects = JSON.parse(localStorage.getItem("projects") || "null");
  } catch {
    savedProjects = null;
  }
  // fall back to defaults on null, non-array, or empty array (otherwise
  // a stale empty list in localStorage would silently kill the demo)
  if (!Array.isArray(savedProjects) || savedProjects.length === 0) {
    return defaultProjects;
  }
  return savedProjects;
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
    const card = document.createElement("button");
    card.className = "project-card";
    card.type = "button";
    card.dataset.project = name;

    const eyebrow = document.createElement("span");
    eyebrow.className = "project-eyebrow";
    eyebrow.textContent = "프로젝트";

    const title = document.createElement("span");
    title.className = "project-title";
    title.textContent = name;

    const foot = document.createElement("span");
    foot.className = "project-foot";

    const meta = document.createElement("span");
    meta.textContent = projectMeta[name] || "시나리오 업로드 완료";

    const arrow = document.createElement("span");
    arrow.className = "project-arrow";
    arrow.textContent = "→";

    foot.append(meta, arrow);
    card.append(eyebrow, title, foot);

    card.addEventListener("click", () => {
      openScenarioDialog(name);
    });

    projectListItems.append(card);
  });
}

function openScenarioDialog(name = "") {
  scenarioText = "";
  dialogTitle.textContent = name ? name : "새 프로젝트";
  projectName.value = name;
  scenarioFile.value = "";
  scenarioPreview.textContent = ".txt 시나리오를 업로드하세요";
  continueButton.disabled = true;
  dialog.showModal();
}

// Guard each binding so the JS still works even if any of these elements
// gets removed from the markup.
if (newProjectButton) {
  newProjectButton.addEventListener("click", () => openScenarioDialog());
}

if (newProjectCard) {
  newProjectCard.addEventListener("click", () => openScenarioDialog());
}

if (dialogCloseButton) {
  dialogCloseButton.addEventListener("click", () => dialog.close("cancel"));
}

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
