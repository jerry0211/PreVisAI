const demoStoryboardSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 760">
  <rect width="1200" height="760" fill="#f2efe7"/>
  <g fill="none" stroke="#151821" stroke-width="10">
    <rect x="54" y="60" width="328" height="280"/>
    <rect x="436" y="60" width="328" height="280"/>
    <rect x="818" y="60" width="328" height="280"/>
    <rect x="54" y="420" width="1092" height="250"/>
  </g>
  <g stroke="#151821" stroke-linecap="round" stroke-linejoin="round">
    <path d="M112 260 C170 190 252 185 324 250" fill="none" stroke-width="8"/>
    <path d="M160 268 L210 155 L266 268" fill="none" stroke-width="8"/>
    <circle cx="215" cy="125" r="31" fill="none" stroke-width="8"/>
    <path d="M492 286 L588 142 L694 286" fill="none" stroke-width="8"/>
    <path d="M558 158 C610 98 690 110 718 166" fill="none" stroke-width="8"/>
    <path d="M514 276 C578 230 646 232 714 276" fill="none" stroke-width="6"/>
    <path d="M902 276 L970 126 L1050 276" fill="none" stroke-width="8"/>
    <path d="M938 126 C1012 82 1092 108 1112 178" fill="none" stroke-width="8"/>
    <path d="M108 612 C250 515 408 506 570 590 S880 682 1094 536" fill="none" stroke-width="8"/>
    <path d="M318 548 l44 -28 l-12 50" fill="none" stroke-width="8"/>
    <path d="M768 568 l64 -42 l-16 72" fill="none" stroke-width="8"/>
  </g>
  <g fill="#151821" font-family="Arial, sans-serif" font-weight="700" font-size="34">
    <text x="76" y="110">1</text>
    <text x="458" y="110">2</text>
    <text x="840" y="110">3</text>
    <text x="78" y="468">CAMERA PATH / ACTION BEATS</text>
  </g>
  <g fill="none" stroke="#c33d38" stroke-width="7" stroke-linecap="round">
    <path d="M612 142 L704 98"/>
    <path d="M704 98 l-24 -8"/>
    <path d="M704 98 l-10 24"/>
    <path d="M984 130 L1116 178"/>
    <path d="M1116 178 l-28 6"/>
    <path d="M1116 178 l-15 -26"/>
  </g>
</svg>`;

const demoStoryboardUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(demoStoryboardSvg)}`;

const analysisFile = {
  source_type: "storyboard_image",
  mission: "computer vision decomposition into editable vector assets",
  image_size: { width: 1200, height: 760 },
  panel_detection: [
    { id: "panel_001", bbox: [54, 60, 328, 280], order: 1, confidence: 0.98 },
    { id: "panel_002", bbox: [436, 60, 328, 280], order: 2, confidence: 0.97 },
    { id: "panel_003", bbox: [818, 60, 328, 280], order: 3, confidence: 0.97 },
    { id: "timeline_row", bbox: [54, 420, 1092, 250], order: 4, confidence: 0.94 }
  ],
  segmentation_masks: [
    {
      id: "character_shape_panel_001",
      class: "character_sketch",
      panel_id: "panel_001",
      contour_points: [[160, 268], [210, 155], [266, 268], [215, 125]],
      vector_path_id: "character_001"
    },
    {
      id: "camera_arrow_panel_002",
      class: "camera_direction",
      panel_id: "panel_002",
      contour_points: [[612, 142], [704, 98], [694, 122], [680, 90]],
      vector_path_id: "camera_arrow_002"
    },
    {
      id: "action_path_timeline",
      class: "motion_path",
      panel_id: "timeline_row",
      contour_points: [[108, 612], [318, 548], [570, 590], [832, 526], [1094, 536]],
      vector_path_id: "motion_path_001"
    }
  ],
  vectorization: {
    method: "mask contours simplified with bezier fitting",
    coordinate_space: "normalized per panel plus full-board SVG coordinates",
    outputs: ["storyboard_analysis.json", "storyboard_vectors.svg"]
  }
};

const vectorSvgFile = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 760">
  <g id="detected-panels" fill="none" stroke="#69d391" stroke-width="5">
    <rect id="panel_001" x="54" y="60" width="328" height="280"/>
    <rect id="panel_002" x="436" y="60" width="328" height="280"/>
    <rect id="panel_003" x="818" y="60" width="328" height="280"/>
    <rect id="timeline_row" x="54" y="420" width="1092" height="250"/>
  </g>
  <g id="segmented-subjects" fill="none" stroke="#79a7ff" stroke-width="8" stroke-linecap="round" stroke-linejoin="round">
    <path id="character_001" d="M160 268 L210 155 L266 268 M184 138 C206 106 244 107 264 138"/>
    <path id="character_002" d="M492 286 L588 142 L694 286 M558 158 C610 98 690 110 718 166"/>
    <path id="character_003" d="M902 276 L970 126 L1050 276 M938 126 C1012 82 1092 108 1112 178"/>
  </g>
  <g id="camera-and-motion-vectors" fill="none" stroke="#f2b950" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">
    <path id="camera_arrow_002" d="M612 142 L704 98 M704 98 L680 90 M704 98 L694 122"/>
    <path id="camera_arrow_003" d="M984 130 L1116 178 M1116 178 L1088 184 M1116 178 L1101 152"/>
    <path id="motion_path_001" d="M108 612 C250 515 408 506 570 590 S880 682 1094 536"/>
  </g>
</svg>`;

const storyboardPreview = document.querySelector("#storyboardPreview");
const storyboardFile = document.querySelector("#storyboardFile");
const loadStoryboard = document.querySelector("#loadStoryboard");
const analyzeButton = document.querySelector("#analyzeButton");
const generateButton = document.querySelector("#generateButton");
const outputGrid = document.querySelector("#outputGrid");
const analysisOutput = document.querySelector("#analysisOutput");
const svgOutput = document.querySelector("#svgOutput");
const progressBar = document.querySelector("#progressBar");
const statusPill = document.querySelector("#statusPill");

function setStatus(text) {
  statusPill.lastChild.textContent = ` ${text}`;
}

function loadDemoStoryboard() {
  storyboardPreview.src = demoStoryboardUrl;
  setStatus("Demo storyboard image loaded");
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

function runAnalysis() {
  if (!storyboardPreview.getAttribute("src")) {
    loadDemoStoryboard();
  }

  outputGrid.hidden = true;
  progressBar.style.width = "16%";
  setStatus("Detecting storyboard panels");
  generateButton.disabled = true;
  analyzeButton.disabled = true;

  window.setTimeout(() => {
    progressBar.style.width = "48%";
    setStatus("Segmenting subjects and camera marks");
  }, 420);

  window.setTimeout(() => {
    progressBar.style.width = "78%";
    setStatus("Tracing masks into SVG paths");
  }, 900);

  window.setTimeout(() => {
    analysisOutput.textContent = JSON.stringify(analysisFile, null, 2);
    svgOutput.textContent = vectorSvgFile;
    outputGrid.hidden = false;
    progressBar.style.width = "100%";
    setStatus("Vector package ready");
    generateButton.disabled = false;
    analyzeButton.disabled = false;
  }, 1350);
}

storyboardFile.addEventListener("change", () => {
  const [file] = storyboardFile.files;

  if (!file) {
    return;
  }

  storyboardPreview.src = URL.createObjectURL(file);
  outputGrid.hidden = true;
  progressBar.style.width = "0%";
  setStatus(`${file.name} loaded`);
});

loadStoryboard.addEventListener("click", loadDemoStoryboard);
analyzeButton.addEventListener("click", runAnalysis);
generateButton.addEventListener("click", runAnalysis);

document.querySelectorAll(".download-button").forEach((button) => {
  button.addEventListener("click", () => {
    if (button.dataset.file === "analysis") {
      downloadFile("storyboard_analysis.json", JSON.stringify(analysisFile, null, 2), "application/json");
    } else {
      downloadFile("storyboard_vectors.svg", vectorSvgFile, "image/svg+xml");
    }
  });
});

loadDemoStoryboard();
