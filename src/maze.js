// ------- KEY FOR MAZE ------- //
//
// # = wall
// S = start
// G = goal
// . = light cost
// ~ = higher cost
// (space) = normal walkable tile


// ------- MAP LAYOUT ------- //

export const MAP = [
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

// Returning the number of rows and columns in the map
export function getDims(map = MAP) {
  return { rows: map.length, cols: map[0].length };
}

// Search the map for the FIRST occurrence of a given character (as in the start or goal)
export function findChar(map, ch) {
  const { rows, cols } = getDims(map);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (map[r][c] === ch) return { r, c };
    }
  }
  return null;
}

// Checking if the Mario is allowed to move onto a tile
export function isWalkable(map, r, c) {
  const { rows, cols } = getDims(map);
  if (r < 0 || c < 0 || r >= rows || c >= cols) return false;
  const ch = map[r][c];
  return ch === " " || ch === "S" || ch === "G" || ch === "." || ch === "~";
}

// Assigning the step cost based on the tile type
// Normal = 1, Higher cost (~) = 5
export function getCellWeight(ch) {
  return ch === "~" ? 5 : 1;
}

// Making sure the canvas fits the window
export function resizeCanvasToContainer({ canvas, container, map = MAP }) {
  const { rows, cols } = getDims(map);
  const rect = container.getBoundingClientRect();

  const maxCellW = rect.width / cols;
  const maxCellH = rect.height / rows;
  const cellSize = Math.floor(Math.min(maxCellW, maxCellH));

  canvas.width = cellSize * cols;
  canvas.height = cellSize * rows;

  return { cellSize, rows, cols };
}

// Drawing walls, open space, start point, and goal image in the map
export function drawMaze({ ctx, canvas, cellSize, map = MAP, goalImg, goalReady }) {
  const { rows, cols } = getDims(map);

  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const ch = map[r][c];
      const x = c * cellSize;
      const y = r * cellSize;

      // Walls
      ctx.fillStyle = (ch === "#") ? "rgb(0,40,120)" : "rgb(0,0,0)";
      ctx.fillRect(x, y, cellSize, cellSize);

      // Start circle
      if (ch === "S") {
        ctx.fillStyle = "rgb(255,230,0)";
        ctx.beginPath();
        ctx.arc(x + cellSize/2, y + cellSize/2, cellSize * 0.3, 0, Math.PI*2);
        ctx.fill();
      }

      // Goal image
      if (ch === "G" && goalReady) {
        const size = cellSize * 0.9;
        const drawX = x + (cellSize - size) / 2;
        const drawY = y + (cellSize - size) / 2;
        ctx.drawImage(goalImg, drawX, drawY, size, size);
      }
    }
  }
}
