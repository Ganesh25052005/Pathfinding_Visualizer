// algorithm.js

// Returns { visitedOrder: [[r, c, "frontier"|"visited"]], previous }
// - "frontier": the node currently being processed (only one at a time).
// - "visited": the node after its neighbors have been enqueued/updated.

export function dijkstra(start, end, rows, cols, obstacles) {
  const directions = [[-1,0],[1,0],[0,-1],[0,1]];
  const distances = Array.from({ length: rows }, () => Array(cols).fill(Infinity));
  const previous = Array.from({ length: rows }, () => Array(cols).fill(null));
  const visitedOrder = [];

  // start at the source
  const queue = [{ row: start[0], col: start[1], dist: 0 }];
  distances[start[0]][start[1]] = 0;

  while (queue.length > 0) {
    // priority by distance (for unit-weight grid you can replace with FIFO queue for BFS)
    queue.sort((a, b) => a.dist - b.dist);
    const { row, col, dist } = queue.shift();

    // current node becomes the single frontier node
    visitedOrder.push([row, col, "frontier"]);

    // if this is the goal we can mark it visited and stop
    if (row === end[0] && col === end[1]) {
      visitedOrder.push([row, col, "visited"]);
      break;
    }

    // expand neighbors (discover)
    for (const [dx, dy] of directions) {
      const nr = row + dx, nc = col + dy;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
        const key = `${nr}-${nc}`;
        if (obstacles.has(key)) continue;

        const nd = dist + 1;
        if (nd < distances[nr][nc]) {
          distances[nr][nc] = nd;
          previous[nr][nc] = [row, col];
          queue.push({ row: nr, col: nc, dist: nd });
          // NOTE: we DO NOT push a "frontier" entry here for the neighbour.
          // The neighbour will become "frontier" only when it is popped later.
        }
      }
    }

    // after adding all neighbors, mark current node as visited
    visitedOrder.push([row, col, "visited"]);
  }

  return { visitedOrder, previous };
}


export function aStar(start, end, rows, cols, obstacles) {
  const directions = [[-1,0],[1,0],[0,-1],[0,1]];
  const g = Array.from({ length: rows }, () => Array(cols).fill(Infinity));
  const f = Array.from({ length: rows }, () => Array(cols).fill(Infinity));
  const previous = Array.from({ length: rows }, () => Array(cols).fill(null));
  const visitedOrder = [];

  const h = ([x1, y1], [x2, y2]) => Math.abs(x1 - x2) + Math.abs(y1 - y2);

  g[start[0]][start[1]] = 0;
  f[start[0]][start[1]] = h(start, end);

  const open = [{ row: start[0], col: start[1], fScore: f[start[0]][start[1]] }];

  while (open.length > 0) {
    // pick smallest fScore
    open.sort((a, b) => a.fScore - b.fScore);
    const { row, col } = open.shift();

    // current node = single frontier node
    visitedOrder.push([row, col, "frontier"]);

    if (row === end[0] && col === end[1]) {
      visitedOrder.push([row, col, "visited"]);
      break;
    }

    for (const [dx, dy] of directions) {
      const nr = row + dx, nc = col + dy;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
        const key = `${nr}-${nc}`;
        if (obstacles.has(key)) continue;

        const tentative = g[row][col] + 1;
        if (tentative < g[nr][nc]) {
          g[nr][nc] = tentative;
          f[nr][nc] = tentative + h([nr, nc], end);
          previous[nr][nc] = [row, col];
          open.push({ row: nr, col: nc, fScore: f[nr][nc] });
          // NOTE: do NOT push "frontier" for neighbour here.
        }
      }
    }

    // after expanding, mark current visited
    visitedOrder.push([row, col, "visited"]);
  }

  return { visitedOrder, previous };
}


export function reconstructPath(previous, end) {
  const path = [];
  let [r, c] = end;
  // If previous[r][c] is null (unreached), loop won't run and empty array is returned.
  while (previous[r] && previous[r][c] !== null) {
    path.push([r, c]);
    [r, c] = previous[r][c];
  }
  return path.reverse();
}
