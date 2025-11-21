const canvas = document.getElementById("graphCanvas");
const container = document.getElementById("graph-container");
const ctx = canvas.getContext("2d");

const runBtn = document.getElementById("runBtn");
const pauseBtn = document.getElementById("pauseBtn");

let isPaused = false;
let isRunning = false;

pauseBtn.addEventListener("click", () => {
  if (!isRunning) return;

  isPaused = !isPaused;
  pauseBtn.textContent = isPaused ? "Resume" : "Pause";

  if (!isPaused && animationState) {
    requestAnimationFrame(animationLoop);
  }
});

let animationState = null;

let cellSize; 
let rows, cols;

const MAP = [
  "###########################",
  "#S   ###   ~~  ###      .##",
  "###  ##  ##### ### ##### ##",
  "#  .. ####     ###   ~ # ##",
  "# ### #### ### ####### # ##",
  "# ###      ###    .. # # ##",
  "##### ####### ###### # # ##",
  "#     ### ..      ##      #",
  "### # ### # #### ### ######",
  "### #  ..       . #      .#",
  "### ####### #### ####### ##",
  "#     ~ ###   ~      ###  #",
  "# ####### ######### ###  ##",
  "#   ###         .      G###",
  "###########################",
];

rows = MAP.length;
cols = MAP[0].length;

function findChar(ch) {
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (MAP[r][c] === ch) return { r, c };
    }
  }
  return null;
}

const start = findChar("S");
const goal = findChar("G");

function isWalkable(r, c) {
  if (r < 0 || c < 0 || r >= rows || c >= cols) return false;
  const ch = MAP[r][c];
  return ch === " " || ch === "S" || ch === "G" || ch === "." || ch === "~";
}

function getCellWeight(ch) {
  if (ch === "~") return 5;
  return 1; 
}

function resizeCanvas() {
  const rect = container.getBoundingClientRect();
  const containerW = rect.width;
  const containerH = rect.height;

  const maxCellW = containerW / cols;
  const maxCellH = containerH / rows;

  cellSize = Math.floor(Math.min(maxCellW, maxCellH));

  // Canvas size is exactly maze size in pixels
  canvas.width  = cellSize * cols;
  canvas.height = cellSize * rows;

  // // Match CSS size to drawing size
  // canvas.style.width  = canvas.width + "px";
  // canvas.style.height = canvas.height + "px";

  drawMaze();
}

function drawMaze() {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const ch = MAP[r][c];
      const x = c * cellSize;
      const y = r * cellSize;

      if (ch === "#") {
        ctx.fillStyle = "rgb(0,40,120)";
      } else {
        ctx.fillStyle = "rgb(0,0,0)";
      }
      ctx.fillRect(x, y, cellSize, cellSize);

      if (ch === "S") {
        ctx.fillStyle = "rgb(255,230,0)";   
        ctx.beginPath();
        ctx.arc(
          x + cellSize / 2,
          y + cellSize / 2,
          cellSize * 0.3,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }

      if (ch === "G") {
        ctx.fillStyle = "rgb(255,120,180)";  
        ctx.beginPath();
        ctx.arc(
          x + cellSize / 2,
          y + cellSize / 2,
          cellSize * 0.3,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
    }
  }
}

function startAnimation(exploredCells, pathCells) {
  // reset animation flags
  isPaused = false;
  isRunning = true;
  pauseBtn.textContent = "Pause";

  // build the animation state
  animationState = {
    phase: "exploringMaze",
    exploredCells: exploredCells,
    pathCells: pathCells,
    currentExploreIndex: 0,
    currentPathIndex: 0,

    lastFrameTime: 0,

    exploreDelay: 15,
    pathDelay: 120
  };

  requestAnimationFrame(animationLoop);
}


function animationLoop(timestamp) {
  // Stop if paused or finished
  if (!animationState || isPaused) return;

  const state = animationState;

  const timeSinceLastFrame = timestamp - state.lastFrameTime;

  // Showing the exploration order
  if (state.phase === "exploringMaze") {

    if (timeSinceLastFrame >= state.exploreDelay) {
      state.lastFrameTime = timestamp;

      drawMaze();

      // Shade every explored cell so far
      for (
        let exploreIndex = 0;
        exploreIndex <= state.currentExploreIndex &&
        exploreIndex < state.exploredCells.length;
        exploreIndex++
      ) {
        const exploredCell = state.exploredCells[exploreIndex];

        const pixelX = exploredCell.c * cellSize;
        const pixelY = exploredCell.r * cellSize;

        ctx.fillStyle = "rgba(152, 118, 254, 0.88)";
        ctx.fillRect(pixelX, pixelY, cellSize, cellSize);
      }

      state.currentExploreIndex++;

      // Done exploring di move on to path drawing
      if (state.currentExploreIndex >= state.exploredCells.length) {
        state.phase = "drawingShortestPath";
        state.lastFrameTime = timestamp;
      }
    }
  }

  // Animating the shortest path
  else if (state.phase === "drawingShortestPath") {

    if (timeSinceLastFrame >= state.pathDelay) {
      state.lastFrameTime = timestamp;

      drawMaze();

      // Draw faint exploration shading behind the path
      for (let i = 0; i < state.exploredCells.length; i++) {
        const exploredCell = state.exploredCells[i];

        const pixelX = exploredCell.c * cellSize;
        const pixelY = exploredCell.r * cellSize;

        ctx.fillStyle = "rgba(140, 100, 255, 0.20)";
        ctx.fillRect(pixelX, pixelY, cellSize, cellSize);
      }

      // Draw mario at the current step of the path
      // todo: replace with mario lololol
      const currentPathCell = state.pathCells[state.currentPathIndex];
      const pixelX = currentPathCell.c * cellSize;
      const pixelY = currentPathCell.r * cellSize;

      ctx.fillStyle = "white";
      ctx.beginPath();
      ctx.arc(
        pixelX + cellSize / 2,
        pixelY + cellSize / 2,
        cellSize * 0.30,
        0,
        Math.PI * 2
      );
      ctx.fill();

      state.currentPathIndex++;

      // Finished walking the path
      if (state.currentPathIndex >= state.pathCells.length) {
        isRunning = false;
        animationState = null;
        pauseBtn.textContent = "Pause";
        return;
      }
    }
  }

  requestAnimationFrame(animationLoop);
}

runBtn.addEventListener("click", () => {
  const algo = document.getElementById("algoSelect").value;
  let result;

  if (algo === "dijkstra") {
    result = dijkstraPath(MAP, start, goal);
  } else {
    result = bellmanFordPath(MAP, start, goal);
  }

  if (!result.path) {
    alert("No path found.");
    return;
  }

  startAnimation(result.explored, result.path);
});


// do not remove
window.addEventListener("load", resizeCanvas);
window.addEventListener("resize", resizeCanvas);

// === DECKTOP DATE & TIME ===
function updateDateTime() {
  const now = new Date();

  const weekday = now.toLocaleDateString("en-US", { weekday: "short" });
  const month   = now.toLocaleDateString("en-US", { month: "short" });
  const day     = now.getDate(); // numeric day, no comma
  const time    = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });

  // No commas anywhere
  const formatted = `${weekday} ${month} ${day} • ${time}`;

  document.getElementById("datetime").textContent = formatted;
}

updateDateTime();
setInterval(updateDateTime, 1000);
