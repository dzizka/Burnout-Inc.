// A* na dlaždicovej mriežke poschodia (4 smery). Postavy sa navzájom neblokujú.

/**
 * @param {{ width: number, height: number, isWalkable: (x: number, y: number) => boolean }} floor
 * @param {{x: number, y: number}} start
 * @param {{x: number, y: number}} goal
 * @returns {{x: number, y: number}[] | null} cesta bez štartovej dlaždice; [] ak už stojí v cieli
 */
export function findPath(floor, start, goal) {
  if (start.x === goal.x && start.y === goal.y) return [];
  if (!floor.isWalkable(goal.x, goal.y)) return null;

  const w = floor.width;
  const key = (x, y) => y * w + x;
  const h = (x, y) => Math.abs(x - goal.x) + Math.abs(y - goal.y);

  const startKey = key(start.x, start.y);
  const gScore = new Map([[startKey, 0]]);
  const cameFrom = new Map();
  // Malé mriežky (desiatky dlaždíc) – stačí jednoduchý zoznam namiesto haldy.
  const open = [{ x: start.x, y: start.y, f: h(start.x, start.y) }];
  const closed = new Set();

  while (open.length) {
    let best = 0;
    for (let i = 1; i < open.length; i++) if (open[i].f < open[best].f) best = i;
    const current = open.splice(best, 1)[0];
    const currentKey = key(current.x, current.y);
    if (current.x === goal.x && current.y === goal.y) return reconstruct(cameFrom, currentKey, w);
    if (closed.has(currentKey)) continue;
    closed.add(currentKey);

    for (const [dx, dy] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ]) {
      const nx = current.x + dx;
      const ny = current.y + dy;
      if (!floor.isWalkable(nx, ny)) continue;
      const nKey = key(nx, ny);
      if (closed.has(nKey)) continue;
      const g = gScore.get(currentKey) + 1;
      if (g < (gScore.get(nKey) ?? Infinity)) {
        gScore.set(nKey, g);
        cameFrom.set(nKey, currentKey);
        open.push({ x: nx, y: ny, f: g + h(nx, ny) });
      }
    }
  }
  return null;
}

function reconstruct(cameFrom, endKey, w) {
  const path = [];
  let k = endKey;
  while (cameFrom.has(k)) {
    path.push({ x: k % w, y: Math.floor(k / w) });
    k = cameFrom.get(k);
  }
  return path.reverse();
}
