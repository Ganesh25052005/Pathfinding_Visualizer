import React from "react";

function ControlPanel({
  mode,
  setMode,
  algorithm,
  setAlgorithm,
  speed,
  setSpeed,
  onRun,
  onStop,
  onClearPaths,
  onClearGrid,
  isRunning,
}) {
  return (
    <div className="bg-slate-700 text-white p-4 rounded-xl shadow-lg flex flex-col gap-4">
      {/* Algorithm Select */}
      <div>
        <label className="block text-sm mb-1">Algorithm</label>
        <select
          value={algorithm}
          onChange={(e) => setAlgorithm(e.target.value)}
          className="w-full p-2 rounded bg-slate-800 border border-slate-600 focus:outline-none"
        >
          <option value="dijkstra">Dijkstra</option>
          <option value="astar">A*</option>
        </select>
      </div>

      {/* Mode Select */}
      <div>
        <label className="block text-sm mb-1">Mode</label>
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value)}
          className="w-full p-2 rounded bg-slate-800 border border-slate-600 focus:outline-none"
        >
          <option value="start-end">Set Start/End</option>
          <option value="obstacle">Set Obstacles</option>
        </select>
      </div>

      {/* Speed Slider */}
      <div>
        <label className="block text-sm mb-1">
          Speed: {speed} ms / step
        </label>
        <input
          type="range"
          min="10"
          max="200"
          step="10"
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
          className="w-full"
        />
      </div>

      {/* Buttons */}
      <div className="flex flex-col gap-2">
        {!isRunning ? (
          <button
            onClick={onRun}
            className="w-full py-2 bg-green-600 hover:bg-green-700 rounded-lg"
          >
            ▶ Run
          </button>
        ) : (
          <button
            onClick={onStop}
            className="w-full py-2 bg-red-600 hover:bg-red-700 rounded-lg"
          >
            ■ Stop
          </button>
        )}

        <button
          onClick={onClearPaths}
          className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
        >
          Clear Paths
        </button>

        <button
          onClick={onClearGrid}
          className="w-full py-2 bg-gray-500 hover:bg-gray-600 rounded-lg"
        >
          Clear Grid
        </button>
      </div>
    </div>
  );
}

export default ControlPanel;
