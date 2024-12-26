document.addEventListener('DOMContentLoaded', () => {
    const gridContainer = document.getElementById('grid-container');

    const clearButton = document.getElementById('clear');

    const runButton = document.getElementById('run');

    const resetPathsButton = document.getElementById('reset-paths');

    const toggleModeButton = document.getElementById('toggle-mode');


    const speedSlider = document.getElementById('speed');

    const algorithmSelect = document.getElementById('algorithm');
     
    const rows = 20;
    const cols = 20;
    let start = [0, 0];
    let end = [19, 19];
    let isStartSet = false;
    let isEndSet = false;
    let timeoutId;
    let speed = 50;
    let mode = ''; 

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const cell = document.createElement('div');
            cell.classList.add('grid-cell');
            cell.dataset.row = row;
            cell.dataset.col = col;
            
            cell.addEventListener('click', () => handleCellClick(cell, row, col));

            gridContainer.appendChild(cell);
        }
    }

    function handleCellClick(cell, row, col) {
        if (mode === 'start-end') {
            if(cell.classList.contains('obstacle')) {
                return;
            }
            if (!isStartSet) {
                clearStartEndCells();    
                cell.classList.add('start');
                start = [row, col];
                isStartSet = true;
            } else if (!isEndSet) {
                cell.classList.add('end');
                end = [row, col];
                isEndSet = true;
            } else {
                isStartSet = false;
                isEndSet = false;
                clearStartEndCells();
            }
        } else if (mode === 'obstacle') {
            if(cell.classList.contains('start') || cell.classList.contains('end')) return;
            cell.classList.toggle('obstacle');
        }
    }

    function clearStartEndCells() {
        const cells = document.querySelectorAll('.grid-cell');
        cells.forEach(cell => {
            cell.classList.remove('start', 'end');
        });
    }

    clearButton.addEventListener('click', clearGrid);
    
    let should_stop=false;
    let running=false;

    runButton.addEventListener('click', () => {
        if(should_stop){
            should_stop=false;
            running=false;
        }
        if(running){
            should_stop=true;
            return;
        }
        running=true;
        const algorithm = algorithmSelect.value;
        resetPaths();
         {
            if (algorithm === 'dijkstra') {
                runDijkstra(start, end); 
                } 
            else if (algorithm === 'astar') {
                runAStar(start, end); 
                }
        }
    });
    
    resetPathsButton.addEventListener('click', resetPaths);
    toggleModeButton.addEventListener('click', () => {
        mode = mode === 'obstacle' ? 'start-end' : 'obstacle';
        toggleModeButton.textContent = mode === 'obstacle' ? 'Set Obstacles' : 'Set Start/End';
    });
    speedSlider.addEventListener('input', () => {
        speed = 500-parseInt(speedSlider.value);
    });



    function clearGrid() {
        should_stop=true;
        const cells = document.querySelectorAll('.grid-cell');
        cells.forEach(cell => {
            cell.classList.remove('start', 'end', 'path', 'obstacle', 'shortest-path');
        });
        isStartSet = false;
        isEndSet = false;
        clearTimeout(timeoutId);
    }

    function resetPaths() {
        should_stop=true;
        const cells = document.querySelectorAll('.grid-cell');
        cells.forEach(cell => {
            cell.classList.remove('path', 'shortest-path');
        });
        setTimeout(500);
    }

    function runDijkstra(start, end) {
        should_stop=false;
        const queue = [];
        const distances = Array.from({ length: rows }, () => Array(cols).fill(Infinity));
        const previous = Array.from({ length: rows }, () => Array(cols).fill(null));
        distances[start[0]][start[1]] = 0;
        queue.push({ row: start[0], col: start[1], distance: 0 });

        const directions = [
            [-1, 0], [1, 0], // Up, Down
            [0, -1], [0, 1]  // Left, Right
        ];

        function step() {
            if(should_stop) return;

            if (queue.length > 0) {
                const { row, col, distance } = queue.shift();
                const cell = document.querySelector(`.grid-cell[data-row='${row}'][data-col='${col}']`);
                if (cell && !cell.classList.contains('start') && !cell.classList.contains('end')) {
                    cell.classList.add('path');
                    cell.classList.add('present_cell'); 
                }

                for (const [dx, dy] of directions) {
                    const newRow = row + dx;
                    const newCol = col + dy;

                    if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols) {
                        if (document.querySelector(`.grid-cell[data-row='${newRow}'][data-col='${newCol}']`).classList.contains('obstacle')) {
                            continue;
                        }
                        const newDistance = distance + 1;
                        if (newDistance < distances[newRow][newCol]) {
                            distances[newRow][newCol] = newDistance;
                            previous[newRow][newCol] = [row, col];
                            queue.push({ row: newRow, col: newCol, distance: newDistance });
                        }
                    }
                }

                setTimeout(() => { 
                    cell.classList.remove('present_cell'); 
                    if (row === end[0] && col === end[1]) { 
                        highlightShortestPath(previous, start, end); 
                        running=false;
                        return; 
                        } 
                    timeoutId = setTimeout(step, speed); 
                }, speed);
            }
        }

        step();
    }

    function runAStar(start, end) {
        should_stop=false;
        const queue = [];
        const gScores = Array.from({ length: rows }, () => Array(cols).fill(Infinity));
        const fScores = Array.from({ length: rows }, () => Array(cols).fill(Infinity));
        const previous = Array.from({ length: rows }, () => Array(cols).fill(null));
        gScores[start[0]][start[1]] = 0;
        fScores[start[0]][start[1]] = heuristic(start, end);
        queue.push({ row: start[0], col: start[1], fScore: fScores[start[0]][start[1]] });

        const directions = [
            [-1, 0], [1, 0], // Up, Down
            [0, -1], [0, 1]  // Left, Right
        ];

        function step() {
            if(should_stop) return;

            if (queue.length > 0) {
                queue.sort((a, b) => a.fScore - b.fScore); // Sort by fScore
                const { row, col } = queue.shift();
                const cell = document.querySelector(`.grid-cell[data-row='${row}'][data-col='${col}']`);
                if (cell && !cell.classList.contains('start') && !cell.classList.contains('end')) {
                    cell.classList.add('path');
                    cell.classList.add('present_cell');
                }
                for (const [dx, dy] of directions) {
                    const newRow = row + dx;
                    const newCol = col + dy;
                    const temp_cell = document.querySelector(`.grid-cell[data-row='${newRow}'][data-col='${newCol}']`);

                    if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols) {
                        if (document.querySelector(`.grid-cell[data-row='${newRow}'][data-col='${newCol}']`).classList.contains('obstacle')) {
                            continue;
                        }
                        const tentativeGScore = gScores[row][col] + 1;
                        if (tentativeGScore < gScores[newRow][newCol]) {
                            gScores[newRow][newCol] = tentativeGScore;
                            fScores[newRow][newCol] = tentativeGScore + heuristic([newRow, newCol], end);
                            previous[newRow][newCol] = [row, col];
                            queue.push({ row: newRow, col: newCol, fScore: fScores[newRow][newCol] });
                        }
                    }
                    
    
                }
                setTimeout(() => { 
                    cell.classList.remove('present_cell'); 
                    if (row === end[0] && col === end[1]) { 
                        highlightShortestPath(previous, start, end);
                        running=false; 
                        return; 
                        } 
                    timeoutId = setTimeout(step, speed); 
                }, speed);
            }
        }

        step();
    }

    function heuristic([x1, y1], [x2, y2]) {
        return Math.abs(x1 - x2) + Math.abs(y1 - y2); // Manhattan Distance
    }

    function highlightShortestPath(previous, start, end) {
        let [row, col] = end;
        while (previous[row][col] !== null) {
            const cell = document.querySelector(`.grid-cell[data-row='${row}'][data-col='${col}']`);
            if (cell && !cell.classList.contains('start') && !cell.classList.contains('end')) {
                cell.classList.add('shortest-path');
            }
            [row, col] = previous[row][col];
        }
    }
});
