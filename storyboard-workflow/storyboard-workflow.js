const outputFiles = {
  vectors: {
    path: "../outputs/scene_vectors.json",
    filename: "scene_vectors.json",
    type: "application/json"
  },
  prompt: {
    path: "../outputs/video_prompt.txt",
    filename: "video_prompt.txt",
    type: "text/plain"
  }
};

const inputFiles = {
  scenario: "../inputs/scenario.txt",
  match: "../inputs/scenario-match.json"
};

const storyboardPreview = document.querySelector("#storyboardPreview");
const storyboardFile = document.querySelector("#storyboardFile");
const uploadDrop = document.querySelector(".upload-drop");
const scenarioWindow = document.querySelector("#scenarioWindow");
const scenarioText = document.querySelector("#scenarioText");
const analyzeButton = document.querySelector("#analyzeButton");
const generateButton = document.querySelector("#generateButton");
const outputGrid = document.querySelector("#outputGrid");
const vectorOutput = document.querySelector("#vectorOutput");
const promptOutput = document.querySelector("#promptOutput");
const progressBar = document.querySelector("#progressBar");
const statusPill = document.querySelector("#statusPill");
const newProjectButton = document.querySelector("#newProjectButton");
const projectListItems = document.querySelector("#projectListItems");

const defaultProjects = ["Orbital Witness", "Glass Desert", "Signal Room"];

let loadedOutputs = {
  vectors: "",
  prompt: ""
};

let scenarioSource = "";
let scenarioMatch = null;

function getProjects() {
  const savedProjects = JSON.parse(localStorage.getItem("projects") || "null");
  return savedProjects || defaultProjects;
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
      sessionStorage.setItem("projectName", name);
      setStatus(`${name} selected`);
    });
    projectListItems.append(button);
  });
}

function setStatus(text) {
  statusPill.lastChild.textContent = ` ${text}`;
}

async function loadOutputFile(key) {
  const response = await fetch(outputFiles[key].path);

  if (!response.ok) {
    throw new Error(`Could not load ${outputFiles[key].path}`);
  }

  return response.text();
}

async function loadOutputs() {
  const [vectors, prompt] = await Promise.all([
    loadOutputFile("vectors"),
    loadOutputFile("prompt")
  ]);

  loadedOutputs = { vectors, prompt };
}

async function loadScenario() {
  const [scenarioResponse, matchResponse] = await Promise.all([
    fetch(inputFiles.scenario),
    fetch(inputFiles.match)
  ]);

  if (!scenarioResponse.ok) {
    throw new Error(`Could not load ${inputFiles.scenario}`);
  }

  if (!matchResponse.ok) {
    throw new Error(`Could not load ${inputFiles.match}`);
  }

  scenarioSource = sessionStorage.getItem("projectScenario") || await scenarioResponse.text();
  scenarioMatch = await matchResponse.json();
  scenarioText.textContent = scenarioSource;
}

function escapeHtml(text) {
  return text.replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    };

    return entities[character];
  });
}

function highlightScenarioMatch() {
  if (!scenarioSource || !scenarioMatch) {
    return;
  }

  const startIndex = scenarioSource.indexOf(scenarioMatch.highlight_start);
  const endIndex = scenarioSource.indexOf(scenarioMatch.highlight_end, startIndex);

  if (startIndex === -1 || endIndex === -1) {
    setStatus("Scenario match could not be found");
    return;
  }

  const highlightEnd = endIndex + scenarioMatch.highlight_end.length;
  const before = scenarioSource.slice(0, startIndex);
  const match = scenarioSource.slice(startIndex, highlightEnd);
  const after = scenarioSource.slice(highlightEnd);

  scenarioText.innerHTML = `${escapeHtml(before)}<mark class="scenario-match">${escapeHtml(match)}</mark>${escapeHtml(after)}`;
  scenarioWindow.classList.add("searching");
  scenarioWindow.querySelector(".scenario-match").scrollIntoView({
    block: scenarioMatch.scroll_block || "center",
    behavior: "smooth"
  });

  window.setTimeout(() => {
    scenarioWindow.classList.remove("searching");
  }, 2200);
}

function downloadFile(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function finishAnalysis() {
  vectorOutput.textContent = loadedOutputs.vectors;
  promptOutput.textContent = loadedOutputs.prompt;
  outputGrid.hidden = false;
  progressBar.style.width = "100%";
  setStatus("Video AI package ready");
  generateButton.disabled = false;
  analyzeButton.disabled = false;
}

async function runAnalysis() {
  outputGrid.hidden = true;
  progressBar.style.width = "18%";
  setStatus("Detecting storyboard panels");
  generateButton.disabled = true;
  analyzeButton.disabled = true;

  try {
    await loadOutputs();
  } catch (error) {
    progressBar.style.width = "0%";
    setStatus("Output files could not be loaded");
    generateButton.disabled = false;
    analyzeButton.disabled = false;
    console.error(error);
    return;
  }

  window.setTimeout(() => {
    progressBar.style.width = "58%";
    setStatus("Extracting motion vectors");
  }, 450);

  window.setTimeout(() => {
    progressBar.style.width = "86%";
    setStatus("Composing video prompt");
  }, 950);

  window.setTimeout(finishAnalysis, 1450);
}

storyboardFile.addEventListener("change", () => {
  const [file] = storyboardFile.files;

  if (!file) {
    return;
  }

  storyboardPreview.src = URL.createObjectURL(file);
  uploadDrop.classList.add("has-image");
  outputGrid.hidden = true;
  progressBar.style.width = "0%";
  setStatus(`Searching scenario for ${file.name}`);
  scenarioReady.then(highlightScenarioMatch);
});

analyzeButton.addEventListener("click", runAnalysis);
generateButton.addEventListener("click", runAnalysis);

document.querySelectorAll("[data-file]").forEach((button) => {
  button.addEventListener("click", async () => {
    const key = button.dataset.file;

    if (!loadedOutputs[key]) {
      try {
        loadedOutputs[key] = await loadOutputFile(key);
      } catch (error) {
        setStatus("Output file could not be loaded");
        console.error(error);
        return;
      }
    }

    downloadFile(outputFiles[key].filename, loadedOutputs[key], outputFiles[key].type);
  });
});

const scenarioReady = loadScenario().catch((error) => {
  scenarioText.textContent = "Scenario could not be loaded.";
  setStatus("Scenario file could not be loaded");
  console.error(error);
});

newProjectButton.addEventListener("click", () => {
  window.location.href = "../project-setup/index.html";
});

renderProjects();
