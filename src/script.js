import { bellmanFordPath } from "./algorithms/bellmanford.js";
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

import { MAP, findChar, resizeCanvasToContainer, drawMaze, getCellWeight } from "./maze.js";
import { createAnimator } from "./animation.js";
import { wirePauseButton, wireRunButton, startDesktopClock, updateComplexityUI, updateAlgoSelectImg } from "./ui.js";

// ------- DOM -------
const canvas = document.getElementById("graphCanvas");
const container = document.getElementById("graph-container");
const ctx = canvas.getContext("2d");

const algoSelect = document.getElementById("algoSelect");
const algoSelectImg   = document.getElementById("algoSelectImg");
const runBtn = document.getElementById("runBtn");
const pauseBtn = document.getElementById("pauseBtn");
pauseBtn.disabled = true;

// algo stats (theoretical)
const timeStatEl = document.getElementById("timeStat");
const spaceStatEl = document.getElementById("spaceStat");

// algo stats (measured)
const runtimeStatEl = document.getElementById("runtimeStat");
const exploredStatEl = document.getElementById("exploredStat");
const pathLenStatEl = document.getElementById("pathLenStat");
const pathCostStatEl = document.getElementById("pathCostStat");

const runtimeValEl = document.getElementById("runtimeVal");
const exploredValEl = document.getElementById("exploredVal");
const pathLenValEl = document.getElementById("pathLenVal");
const pathCostValEl = document.getElementById("pathCostVal");

const timeValEl = document.getElementById("timeVal");
const spaceValEl = document.getElementById("spaceVal");



// ------- Images -------
const goalImage = new Image();
goalImage.src = "assets/icons/goal.png";
let goalReady = false;
goalImage.onload = () => { goalReady = true; resizeAndRedraw(); };

// ------- Map start/goal -------
const start = findChar(MAP, "S");
const goal = findChar(MAP, "G");

// ------- Canvas sizing + drawing -------
let cellSize = 1;
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

const drawMazeNow = () =>
  drawMaze({ ctx, canvas, cellSize, map: MAP, goalImg: goalImage, goalReady });

// ------- Helpers for stats -------
function computePathCost(path) {
  if (!path || path.length === 0) return 0;

  let cost = 0;
  for (let i = 1; i < path.length; i++) {
    const { r, c } = path[i];
    cost += getCellWeight(MAP[r][c]);
  }
  return cost;
}

function showStats(stats) {
  if (!stats) {
    runtimeValEl.textContent  = "— ms";
    exploredValEl.textContent = "—";
    pathLenValEl.textContent  = "—";
    pathCostValEl.textContent = "—";
    return;
  }

  runtimeValEl.textContent  = `${stats.runtimeMs.toFixed(2)} ms`;
  exploredValEl.textContent = stats.exploredCount;
  pathLenValEl.textContent  = stats.pathLength;
  pathCostValEl.textContent = stats.pathCost;
}


// ------- Animator -------
// show measured stats exactly when shortest-path drawing begins.
let lastResult = null;

const animator = createAnimator({
  ctx,
  canvas,
  drawMaze: drawMazeNow,
  cellSizeRef: () => cellSize,
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

  onShortestPathStart: () => {
  if (animator.pendingStats) showStats(animator.pendingStats);  
  },

  isComplete: () => {
    pauseBtn.disabled = true;

    const runImg = runBtn.querySelector("img");
    runBtn.dataset.mode = "replay";
    runImg.src = "assets/buttons/replay.png";
    runImg.alt = "Replay";
  }

});

animator.pendingStats = null;

// ------- Algorithm runner -------
function runAlgorithm(algoName) {
  const t0 = performance.now();

  let result;
  if (algoName === "dijkstra") {
    result = dijkstraPath(MAP, start, goal);
  } else {
    result = bellmanFordPath(MAP, start, goal);
  }

  // measuring tiles and time taken
  const t1 = performance.now();
  const runtimeMs = t1 - t0;

  result.stats = result?.path ? {
    runtimeMs,
    exploredCount: result.explored.length,
    pathLength: result.path.length,
    pathCost: computePathCost(result.path)
  } : { runtimeMs };

  return result;
}


// ------- Wire UI -------
wirePauseButton(pauseBtn, animator);
wireRunButton(runBtn, pauseBtn, algoSelect, runAlgorithm, animator, showStats);

window.addEventListener("load", resizeAndRedraw);
window.addEventListener("resize", resizeAndRedraw);

updateComplexityUI(timeValEl, spaceValEl, algoSelect.value);
updateAlgoSelectImg(algoSelectImg, algoSelect.value);

algoSelect.addEventListener("change", () => {
  const algoValue = algoSelect.value;

  updateComplexityUI(timeValEl, spaceValEl, algoValue);
  updateAlgoSelectImg(algoSelectImg, algoValue);

  animator.reset();
  showStats(null);

  const runImg = runBtn.querySelector("img");
  runBtn.dataset.mode = "run";
  runImg.src = "assets/buttons/run.png";
  runImg.alt = "Run";

  if (algoValue) {
    runBtn.disabled = false;
  } else {
    runBtn.disabled = true;
  }

  pauseBtn.disabled = true;

});

startDesktopClock(
  document.getElementById("date"),
  document.getElementById("time")
);
