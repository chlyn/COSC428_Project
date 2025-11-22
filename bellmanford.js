export function bellmanFordPath(MAP, startPos, goalPos) {
  const rows = MAP.length;
  const cols = MAP[0].length;
  const totalCells = rows * cols;

  const REALLY_BIG = 999999999;

  // turn (row, col) into one number so Bellman-Ford can use it
  function cellToId(row, col) {
    return row * cols + col;
  }

  // turn an id back into (row, col)
  function idToCell(id) {
    return {
      r: Math.floor(id / cols),
      c: id % cols
    };
  }

  // walls are not walkable
  function isWalkable(row, col) {
    if (row < 0 || col < 0 || row >= rows || col >= cols) return false;

    const ch = MAP[row][col];
    return ch !== "#";
  }


function getCellWeight(ch) {
  if (ch === "~") return 5;
  return 1;
}

const edges = [];

// build edges (all edges in maze)
for (let row = 0; row < rows; row++) {
  for (let col = 0; col < cols; col++) {

    // Skip walls
    if (!isWalkable(row, col)) continue;

    const here = cellToId(row, col);

    // Check up, down, left, right manually
    const neighbors = [
      { r: row - 1, c: col }, // up
      { r: row + 1, c: col }, // down
      { r: row, c: col - 1 }, // left
      { r: row, c: col + 1 } // right
    ];

    for (let nb of neighbors) {
      if (!isWalkable(nb.r, nb.c)) continue;

      const there = cellToId(nb.r, nb.c);
      const tileChar = MAP[nb.r][nb.c];
      const weight = getCellWeight(tileChar); // 1 or 5

      edges.push({
        from: here,
        to: there,
        w: weight
      });
    }
  }
}

  const dist = new Array(totalCells).fill(REALLY_BIG);
  const parent = new Array(totalCells).fill(null);

  const startId = cellToId(startPos.r, startPos.c);
  const goalId  = cellToId(goalPos.r, goalPos.c);

  dist[startId] = 0;

  // store the order of improvements so we can animate exploration
  const explored = [];

  // relaxation
  for (let round = 0; round < totalCells - 1; round++) {

    let didAnythingChange = false;

    for (const edge of edges) {
      const u = edge.from;
      const v = edge.to;
      const w = edge.w;

      // if u is still unreachable, skip it
      if (dist[u] === REALLY_BIG) continue;

      const newDistance = dist[u] + w;

      if (newDistance < dist[v]) {
        dist[v] = newDistance;
        parent[v] = u;
        didAnythingChange = true;

        explored.push(idToCell(v));
      }
    }

    // if nothing changed leave
    if (!didAnythingChange) break;
  }

  if (dist[goalId] === REALLY_BIG) {
    return { path: null, explored };
  }

  // final path for animation
  const path = [];
  let cur = goalId;

  while (cur !== null) {
    path.push(idToCell(cur));
    if (cur === startId) break;
    cur = parent[cur];
  }

  path.reverse();

  return { path, explored };
}
