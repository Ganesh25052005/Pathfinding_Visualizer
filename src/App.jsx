import { useState, useEffect, useRef } from "react";
import Board from "./components/Board";
import ControlPanel from "./components/ControlPanel";
import { dijkstra, aStar, reconstructPath } from "./lib/algorithm";
import useGridSize from "./hook/UseGridSize";

function App() {
  const size = useGridSize();
  const [grid, setGrid] = useState([]);
  const [start, setStart] = useState(null);
  const [end, setEnd] = useState(null);
  const [obstacles, setObstacles] = useState(new Set());

  const [mode, setMode] = useState("obstacle");
  const [algorithm, setAlgorithm] = useState("dijkstra");
  const [speed, setSpeed] = useState(50);
  const [isRunning, setIsRunning] = useState(false);

  const stopRef = useRef(false);

  // Reset grid on size change
  useEffect(() => {
    resetGrid();
  }, [size]);

  const resetGrid = () => {
    setGrid(Array.from({ length: size }, () => Array(size).fill("empty")));
    setStart(null);
    setEnd(null);
    setObstacles(new Set());
    stopRef.current = false;
    setIsRunning(false);
  };

  const clearPaths = () => {
    setGrid((prev) =>
      prev.map((row) =>
        row.map((cell) =>
          ["visited", "frontier", "path"].includes(cell) ? "empty" : cell
        )
      )
    );
    stopRef.current = false;
  };

  const handleCellClick = (r, c) => {
    const newGrid = grid.map((row) => [...row]);
    const key = `${r}-${c}`;

    if (mode === "start-end") {
      if (!start) {
        setStart([r, c]);
        newGrid[r][c] = "start";
      } else if (!end && !(r === start[0] && c === start[1])) {
        setEnd([r, c]);
        newGrid[r][c] = "end";
      }
    } else if (mode === "obstacle") {
      if (newGrid[r][c] === "obstacle") {
        newGrid[r][c] = "empty";
        setObstacles((prev) => {
          const ns = new Set(prev);
          ns.delete(key);
          return ns;
        });
      } else if (newGrid[r][c] === "empty") {
        newGrid[r][c] = "obstacle";
        setObstacles((prev) => new Set(prev).add(key));
      }
    }
    setGrid(newGrid);
  };

  const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

  const animateAlgorithm = async (visitedOrder, path) => {
    setIsRunning(true);
    stopRef.current = false;
    const newGrid = grid.map((row) => [...row]);

    for (const [r, c, type] of visitedOrder) {
      if (stopRef.current) break;
      if (!["start", "end", "obstacle"].includes(newGrid[r][c])) {
        newGrid[r][c] = type;
        setGrid(newGrid.map((row) => [...row]));
      }
      await sleep(speed);
    }

    for (const [r, c] of path) {
      if (stopRef.current) break;
      if (!["start", "end"].includes(newGrid[r][c])) {
        newGrid[r][c] = "path";
        setGrid(newGrid.map((row) => [...row]));
      }
      await sleep(speed);
    }

    setIsRunning(false);
  };

  const handleRun = async () => {
    if (!start || !end) return;
    clearPaths();

    let result;
    if (algorithm === "dijkstra") {
      result = dijkstra(start, end, size, size, obstacles);
    } else {
      result = aStar(start, end, size, size, obstacles);
    }

    const path = reconstructPath(result.previous, end);
    await animateAlgorithm(result.visitedOrder, path);
  };

  const handleStop = () => {
    stopRef.current = true;
    setIsRunning(false);
  };

  return (
    <div className="min-h-screen bg-slate-800 flex items-center justify-center p-4">
      <div className="flex flex-col md:flex-row gap-6 w-full max-w-6xl">
        <div className="flex-1 flex justify-center items-center">
          <Board grid={grid} onCellClick={handleCellClick} />
        </div>
        <div className="w-full md:w-[300px]">
          <ControlPanel
            mode={mode}
            setMode={setMode}
            algorithm={algorithm}
            setAlgorithm={setAlgorithm}
            speed={speed}
            setSpeed={setSpeed}
            onRun={handleRun}
            onStop={handleStop}
            onClearPaths={clearPaths}
            onClearGrid={resetGrid}
            isRunning={isRunning}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
