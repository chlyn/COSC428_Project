const canvas = document.getElementById("graphCanvas");
const container = document.getElementById("graph-container");
const ctx = canvas.getContext("2d");

const runBtn = document.getElementById("runAlgoBtn");

let cellSize; 
let rows, cols;

const MAP = [
  "###########################",
  "#S   ###       ###       ##",
  "###  ##  ##### ### ##### ##",
  "#     ####     ###     # ##",
  "# ### #### ### ####### # ##",
  "# ###      ###       # # ##",
  "##### ####### ###### # # ##",
  "#     ###   #    ### #    #",
  "### # ### # #### ### ######",
  "### #     #      #        #",
  "### ####### #### ####### ##",
  "#       ###          ###  #",
  "# ####### ######### ###  ##",
  "#   ###               #G###",
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
  return ch === " " || ch === "S" || ch === "G";
}

function resizeCanvas() {
  const rect = container.getBoundingClientRect();
  const containerW = rect.width;
  const containerH = rect.height;

  // Maze ratio (width/height)
  const mazeRatio = cols / rows;
  const containerRatio = containerW / containerH;

  let drawW, drawH;

  // If container is wider than maze ratio → match height
  if (containerRatio > mazeRatio) {
    drawH = containerH;
    drawW = drawH * mazeRatio;
  } else {
    // If container is taller → match width
    drawW = containerW;
    drawH = drawW / mazeRatio;
  }

  // Round down and recompute cell size
  drawW = Math.floor(drawW);
  drawH = Math.floor(drawH);
  cellSize = Math.floor(drawW / cols);

  // Now force canvas size to match MAZE, not the container
  canvas.width  = cellSize * cols;
  canvas.height = cellSize * rows;

  // CSS size matches pixel size (important!)
  canvas.style.width  = canvas.width + "px";
  canvas.style.height = canvas.height + "px";

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

// bfs place holder
function bfsPath(start, goal) {
  const q = [];
  const visited = new Set();
  const parent = new Map();

  const startKey = `${start.r},${start.c}`;
  const goalKey = `${goal.r},${goal.c}`;

  q.push(start);
  visited.add(startKey);

  const dirs = [
    { dr: -1, dc: 0 },
    { dr: 1, dc: 0 },
    { dr: 0, dc: -1 },
    { dr: 0, dc: 1 },
  ];

  while (q.length > 0) {
    const cur = q.shift();
    const curKey = `${cur.r},${cur.c}`;
    if (curKey === goalKey) break;

    for (const { dr, dc } of dirs) {
      const nr = cur.r + dr;
      const nc = cur.c + dc;
      if (!isWalkable(nr, nc)) continue;
      const nKey = `${nr},${nc}`;
      if (!visited.has(nKey)) {
        visited.add(nKey);
        parent.set(nKey, curKey);
        q.push({ r: nr, c: nc });
      }
    }
  }

  // reconstruct path
  const path = [];
  let curKey = goalKey;
  if (!parent.has(curKey) && curKey !== startKey) {
    console.warn("No path found from S to G");
    return null;
  }

  while (curKey !== startKey) {
    const [r, c] = curKey.split(",").map(Number);
    path.push({ r, c });
    curKey = parent.get(curKey);
  }
  path.push(start);
  path.reverse();
  return path;
}

// anination
let animationId = null;

function animatePath(path) {
  if (!path) return;

  let idx = 0;
  const speedMs = 120; // step delay

  function step() {
    drawMaze();

    const pos = path[idx];
    const x = pos.c * cellSize;
    const y = pos.r * cellSize;

    // draw "agent" / cursor
    ctx.fillStyle = "rgb(255,255,255)";
    ctx.beginPath();
    ctx.arc(
      x + cellSize / 2,
      y + cellSize / 2,
      cellSize * 0.3,
      0,
      Math.PI * 2
    );
    ctx.fill();

    idx++;
    if (idx < path.length) {
      animationId = setTimeout(step, speedMs);
    }
  }

  // cancel any previous animation
  if (animationId !== null) {
    clearTimeout(animationId);
    animationId = null;
  }

  step();
}

runBtn.addEventListener("click", () => {
  const algo = document.getElementById("algoSelect").value;
  let path;

  if (algo === "dijkstra") {
    path = dijkstraPath(start, goal);     
  } else if (algo === "bellmanford") {
    path = bellmanFordPath(start, goal); 
  }

  if (!path) {
    alert("No path found.");
    return;
  }

  animatePath(path);
});



