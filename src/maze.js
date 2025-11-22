// maze.js
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

export function getDims(map = MAP) {
  return { rows: map.length, cols: map[0].length };
}

export function findChar(map, ch) {
  const { rows, cols } = getDims(map);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (map[r][c] === ch) return { r, c };
    }
  }
  return null;
}

export function isWalkable(map, r, c) {
  const { rows, cols } = getDims(map);
  if (r < 0 || c < 0 || r >= rows || c >= cols) return false;
  const ch = map[r][c];
  return ch === " " || ch === "S" || ch === "G" || ch === "." || ch === "~";
}

export function getCellWeight(ch) {
  return ch === "~" ? 5 : 1;
}

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

export function drawMaze({ ctx, canvas, cellSize, map = MAP, goalImg, goalReady }) {
  const { rows, cols } = getDims(map);

  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const ch = map[r][c];
      const x = c * cellSize;
      const y = r * cellSize;

      // walls
      ctx.fillStyle = (ch === "#") ? "rgb(0,40,120)" : "rgb(0,0,0)";
      ctx.fillRect(x, y, cellSize, cellSize);

      // start circle
      if (ch === "S") {
        ctx.fillStyle = "rgb(255,230,0)";
        ctx.beginPath();
        ctx.arc(x + cellSize/2, y + cellSize/2, cellSize * 0.3, 0, Math.PI*2);
        ctx.fill();
      }

      // goal image
      if (ch === "G" && goalReady) {
        const size = cellSize * 0.9;
        const drawX = x + (cellSize - size) / 2;
        const drawY = y + (cellSize - size) / 2;
        ctx.drawImage(goalImg, drawX, drawY, size, size);
      }
    }
  }
}
