import React from "react";

function Board({ grid, onCellClick }) {
  if (!grid || grid.length === 0) return null;

  const rows = grid.length;
  const cols = grid[0].length;

  return (
    <div
      className="grid gap-[1px] bg-gray-600"
      style={{
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, 1fr)`,
      }}
    >
      {grid.map((row, r) =>
        row.map((cell, c) => {
          let color = "bg-white";
          if (cell === "start") color = "bg-green-500";
          else if (cell === "end") color = "bg-red-500";
          else if (cell === "obstacle") color = "bg-gray-800";
          else if (cell === "visited") color = "bg-blue-400";
          else if (cell === "frontier") color = "bg-yellow-400";
          else if (cell === "path") color = "bg-purple-500";

          return (
            <div
              key={`${r}-${c}`}
              className={`w-6 h-6 ${color} cursor-pointer`}
              onClick={() => onCellClick(r, c)}
            />
          );
        })
      )}
    </div>
  );
}

export default Board;
