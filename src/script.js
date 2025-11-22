
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

import { MAP, findChar, resizeCanvasToContainer, drawMaze } from "./maze.js";
import { createAnimator } from "./animation.js";
import { wirePauseButton, wireRunButton, startDesktopClock } from "./ui.js";

// ------- DOM -------
const canvas = document.getElementById("graphCanvas");
const container = document.getElementById("graph-container");
const ctx = canvas.getContext("2d");

const runBtn = document.getElementById("runBtn");
const pauseBtn = document.getElementById("pauseBtn");
const algoSelect = document.getElementById("algoSelect");

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

// ------- Animator -------
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
  }
});


// ------- Algorithm runner -------
function runAlgorithm(algoName) {
  if (algoName === "dijkstra") {
    return dijkstraPath(MAP, start, goal);
  }
  return bellmanFordPath(MAP, start, goal);
}

wirePauseButton(pauseBtn, animator);
wireRunButton(runBtn, algoSelect, runAlgorithm, animator);

window.addEventListener("load", resizeAndRedraw);
window.addEventListener("resize", resizeAndRedraw);

startDesktopClock(
  document.getElementById("date"),
  document.getElementById("time")
);
