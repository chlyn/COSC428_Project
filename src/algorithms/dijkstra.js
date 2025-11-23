export function dijkstraPath(MAP, startPos, goalPos) {

    // Identifying the size of the maze
    const rows = MAP.length;
    const cols = MAP[0].length;
    const totalCells = rows * cols;

    // Placeholder value used before relaxation (infinity)
    const REALLY_BIG = 999999999;


    // ------- HELPER FUNCTIONS ------- //

    // Converting (row, col) into a node id (one number) so Dijkstra can use it
    function cellToId(row, col) {
        return row * cols + col;
    }

    // Converting node id back into (row, col) for the animation
    function idToCell(id) {
        return {
        r: Math.floor(id / cols),
        c: id % cols
        };
    }

    // Making sure walls are not walkable 
    function isWalkable(row, col) {
        if (row < 0 || col < 0 || row >= rows || col >= cols) return false;
        const ch = MAP[row][col];
        return ch !== "#";
    }

    // Identifying the cost of the tile
    // Tile weight: ~ = 5, everything else walkable = 1
    function getCellWeight(ch) {
        if (ch === "~") return 5;
        return 1;
    }


    // ------- DIJKSTRA ------- //

    // Data Structures
    const dist = new Array(totalCells).fill(REALLY_BIG);    // Distance from start to each single node
    const parent = new Array(totalCells).fill(null);        // Stores the final shortest path in general for animation
    const visited = new Array(totalCells).fill(false);      // Stores the final shortest distance for each individual node so we never process them again

    // Identifing the start and goal positions
    const startId = cellToId(startPos.r, startPos.c);
    const goalId  = cellToId(goalPos.r, goalPos.c);

    dist[startId] = 0;

    // For animation: record the order we discover / improve nodes
    const explored = [];

    // Priority Queue: the node with the smallesf distance will always be choosen
    let queue = [{ id: startId, dist: 0 }];

    // Main Dijkstra Algorithm
    while (queue.length > 0) {
        
        // Expanding to the closest unxplored node first
        queue.sort((a, b) => a.dist - b.dist);
        const { id: u } = queue.shift();

        // Skip the node if we already visited this node
        if (visited[u]) continue;
        visited[u] = true;

        // If we reached the goal, then stop early
        if (u === goalId) break;

        // Converting (row, col) back to node id
        const { r, c } = idToCell(u);

        // Identifying four neighbors in each direction
        const neighbors = [
            { r: r - 1, c },   // Up
            { r: r + 1, c },   // Down
            { r, c: c - 1 },   // Left
            { r, c: c + 1 }    // Right
        ];

        // Exploring each neighboring nodes
        for (const nb of neighbors) {

            // Checking if the tile is walkable
            if (!isWalkable(nb.r, nb.c)) continue;

            // Converting (row, col) position of the neighboring nodes position to node id to store
            const v = cellToId(nb.r, nb.c);
            
            // Identifying the tile cost
            const tileChar = MAP[nb.r][nb.c];
            const w = getCellWeight(tileChar); // 1 or 5
            
            // Computing the new distance
            const newDistance = dist[u] + w;

            // Relaxation
            if (newDistance < dist[v]) {

                // If new distance is shorter then update node cost
                dist[v] = newDistance;
                parent[v] = u;

                // Record explored nodes for animation
                explored.push({ r: nb.r, c: nb.c });

                // Push neighboring node into the priority queue
                queue.push({ id: v, dist: newDistance });
            }
        }
    }

    // If goal is still unreachable, then no path exists
    if (dist[goalId] === REALLY_BIG) {
        return { path: null, explored };
    }

    // Redraw the final path from goal back to start for animation
    const path = [];
    let cur = goalId;

    while (cur !== null) {
        path.push(idToCell(cur));
        if (cur === startId) break;
        cur = parent[cur];
    }

    path.reverse();

    // Return the path, stats to animation 
    return { path, explored };
}