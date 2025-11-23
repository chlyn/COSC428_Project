// ------- IMPORTS ------- //

// Importing algorithms
import { dijkstraPath } from './algorithms/dijkstra.js';
import { bellmanFordPath } from "./algorithms/bellmanford.js";

// Importing all Mario sprite and animation helpers
import {
  MARIO_FRAMES,
  JUMP_FRAMES,
  marioSheet,
  marioJumpSheet,
  marioReady,
  marioJumpReady,
  resetMarioFrames,
  advanceMarioFrames,
  advanceMarioFramesOnce,
  drawMario
} from "./mario.js";

// Importing maze drawings
import { MAP, findChar, resizeCanvasToContainer, drawMaze, getCellWeight } from "./maze.js";

// Importing graph animation
import { createAnimator } from "./animation.js";

// Importing UI functions
import { wirePauseButton, wireRunButton, startDesktopClock, updateComplexityUI, updateAlgoSelectImg } from "./ui.js";


// ------- DOM REFERENCES ------- //

// Canvas and container setup
const canvas = document.getElementById("graphCanvas");
const container = document.getElementById("graph-container");
const ctx = canvas.getContext("2d");

// Controls
const algoSelect = document.getElementById("algoSelect");
const algoSelectImg   = document.getElementById("algoSelectImg");
const runBtn = document.getElementById("runBtn");
const pauseBtn = document.getElementById("pauseBtn");
pauseBtn.disabled = true;

// Theoretical Stats Row (Time & Space Complexities)
const timeStatEl = document.getElementById("timeStat");
const spaceStatEl = document.getElementById("spaceStat");

// Measured Stats Row (Runtime, Explored, Path Length, Path Cost)
const runtimeStatEl = document.getElementById("runtimeStat");
const exploredStatEl = document.getElementById("exploredStat");
const pathLenStatEl = document.getElementById("pathLenStat");
const pathCostStatEl = document.getElementById("pathCostStat");

// Theoretical Stats Values (Time & Space Complexities)
const timeValEl = document.getElementById("timeVal");
const spaceValEl = document.getElementById("spaceVal");

// Measured Stats Values (Runtime, Explored, Path Length, Path Cost)
const runtimeValEl = document.getElementById("runtimeVal");
const exploredValEl = document.getElementById("exploredVal");
const pathLenValEl = document.getElementById("pathLenVal");
const pathCostValEl = document.getElementById("pathCostVal");


// ------- LOAD GOAL IMAGE ------- //

const goalImage = new Image();
goalImage.src = "assets/icons/goal.png";
let goalReady = false;

// Once image loads then redraw maze for the goal to appear
goalImage.onload = () => { 
  goalReady = true; 
  resizeAndRedraw(); 
};


// ------- MAP START/GOAL ------- //

const start = findChar(MAP, "S");
const goal = findChar(MAP, "G");


// ------- CANVAS RESIZING & REDRAW ------- //

let cellSize = 1;

// Resize canvas to fit the window and redraw the maze
function resizeAndRedraw() {

  const dims = resizeCanvasToContainer({ canvas, container, map: MAP });
  cellSize = dims.cellSize;

  drawMaze({
    ctx,
    canvas,
    cellSize,
    map: MAP,
    goalImg: goalImage,
    goalReady
  });

}

// Draw Maze
const drawMazeNow = () =>
  drawMaze({ ctx, canvas, cellSize, map: MAP, goalImg: goalImage, goalReady });


// ------- STATS HELPERS ------- //

// Computing path total movement cost using the tile weights
function computePathCost(path) {
  if (!path || path.length === 0) return 0;

  let cost = 0;
  for (let i = 1; i < path.length; i++) {
    const { r, c } = path[i];
    cost += getCellWeight(MAP[r][c]);
  }
  return cost;
}

// Update stats values 
function showStats(stats) {
  
  // If no stats are stored then show default placeholders
  if (!stats) {
    runtimeValEl.textContent  = "— ms";
    exploredValEl.textContent = "—";
    pathLenValEl.textContent  = "—";
    pathCostValEl.textContent = "—";
    return;
  }

  // If stats exist then apply values in the UI
  runtimeValEl.textContent  = `${stats.runtimeMs.toFixed(2)} ms`;
  exploredValEl.textContent = stats.exploredCount;
  pathLenValEl.textContent  = stats.pathLength;
  pathCostValEl.textContent = stats.pathCost;
  
}


// ------- ANIMATOR SETUP ------- //

// Show measured stats exactly when shortest-path drawing begins
let lastResult = null;

// Creating animator  
const animator = createAnimator({
  ctx,
  canvas,
  drawMaze: drawMazeNow,
  cellSizeRef: () => cellSize,

  // Passing all Mario animation assets
  marioAssets: {
    MARIO_FRAMES,
    JUMP_FRAMES,
    marioSheet,
    marioJumpSheet,

    get marioReady() { return marioReady; },
    get marioJumpReady() { return marioJumpReady; },

    resetMarioFrames,
    advanceMarioFrames,
    advanceMarioFramesOnce,
    drawMario
  },

  // When shortest-path drawing start then show the stats
  onShortestPathStart: () => {
  if (animator.pendingStats) showStats(animator.pendingStats);  
  },

  // When the animation is complete then update control buttons
  isComplete: () => {
    pauseBtn.disabled = true;

    const runImg = runBtn.querySelector("img");
    runBtn.dataset.mode = "replay";
    runImg.src = "assets/buttons/replay.png";
    runImg.alt = "Replay";
  }

});

// Storing stats until the animation animation starts path-drawing phase
animator.pendingStats = null;


// ------- ALGORITHM EXECUTION ------- //

// Running the selected algorithm and record runtime measurements
function runAlgorithm(algoName) {
  
  // Recording the initial time before finding a path
  const t0 = performance.now();

  // Running the algorithm that was selected
  let result;
  if (algoName === "dijkstra") {
    result = dijkstraPath(MAP, start, goal);
  } else {
    result = bellmanFordPath(MAP, start, goal);
  }

  // Recording the final time after finding a path and calculating runtime
  const t1 = performance.now();
  const runtimeMs = t1 - t0;


  // Store all stats to result and return 
  result.stats = result?.path ? {
    runtimeMs,
    exploredCount: result.explored.length,
    pathLength: result.path.length,
    pathCost: computePathCost(result.path)
  } : { runtimeMs };

  return result;
}


// ------- UI WIRING ------- //

// Connecting run and pause buttons to the animation
wirePauseButton(pauseBtn, animator);
wireRunButton(runBtn, pauseBtn, algoSelect, runAlgorithm, animator, showStats);

// Redrawing the maze on load and resizing window
window.addEventListener("load", resizeAndRedraw);
window.addEventListener("resize", resizeAndRedraw);

// Initializing complexity
updateComplexityUI(timeValEl, spaceValEl, algoSelect.value);

// Initializing UI dropdown image
updateAlgoSelectImg(algoSelectImg, algoSelect.value);

// Dropdown functionality
algoSelect.addEventListener("change", () => {
  const algoValue = algoSelect.value;

  // Updating stats and dropdown UI
  updateComplexityUI(timeValEl, spaceValEl, algoValue);
  updateAlgoSelectImg(algoSelectImg, algoValue);

  // Reseting animation state whenever the algorithm changes
  animator.reset();
  showStats(null);

  // Reseting the Run button back to default
  const runImg = runBtn.querySelector("img");
  runBtn.dataset.mode = "run";
  runImg.src = "assets/buttons/run.png";
  runImg.alt = "Run";

  // Enabling Run button once an algorithm is selected
  if (algoValue) {
    runBtn.disabled = false;
  } else {
    runBtn.disabled = true;
  }

  // Disabling Pause button until Run button is selected
  pauseBtn.disabled = true;

});

// Starting desktop clock
startDesktopClock(
  document.getElementById("date"),
  document.getElementById("time")
);
