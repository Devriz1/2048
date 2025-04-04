document.addEventListener("DOMContentLoaded", () => {
    const board = document.getElementById("game-board");
    const gameOverDiv = document.getElementById("game-over");
    const restartButton = document.getElementById("restart-button");
    let scoreElement = document.getElementById("score");
    let bestScoreElement = document.getElementById("best-score");

    let grid = Array(4).fill().map(() => Array(4).fill(0));
    let score = 0;
    let bestScore = localStorage.getItem("bestScore") || 0;
    let gameOver = false;

    function initializeGame() {
        score = 0;
        scoreElement.innerText = score;
        bestScoreElement.innerText = bestScore;
        board.innerHTML = "";
        grid = Array(4).fill().map(() => Array(4).fill(0));
        gameOverDiv.style.visibility = "hidden";
        gameOver = false;
        addNewTile();
        addNewTile();
        updateBoard();
    }

    function updateBoard() {
        board.innerHTML = "";
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                let tile = document.createElement("div");
                tile.classList.add("tile");
                if (grid[r][c] !== 0) {
                    tile.innerText = grid[r][c];
                    tile.style.background = getTileColor(grid[r][c]);
                }
                board.appendChild(tile);
            }
        }
        board.appendChild(gameOverDiv);
        scoreElement.innerText = score;

        if (score > bestScore) {
            bestScore = score;
            bestScoreElement.innerText = bestScore;
            localStorage.setItem("bestScore", bestScore);
        }
    }

    function getTileColor(value) {
        const colors = {
            2: "#eee4da", 4: "#ede0c8", 8: "#f2b179",
            16: "#f59563", 32: "#f67c5f", 64: "#f65e3b",
            128: "#edcf72", 256: "#edcc61", 512: "#edc850",
            1024: "#edc53f", 2048: "#edc22e"
        };
        return colors[value] || "#3c3a32";
    }

    function addNewTile() {
        let emptyTiles = [];
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                if (grid[r][c] === 0) emptyTiles.push({ r, c });
            }
        }
        if (emptyTiles.length > 0) {
            let { r, c } = emptyTiles[Math.floor(Math.random() * emptyTiles.length)];
            grid[r][c] = Math.random() > 0.9 ? 4 : 2;
        }
    }

    function move(direction) {
        if (gameOver) return;

        let moved = false;
        let rotated = false;

        if (direction === "ArrowUp") {
            grid = rotateGrid(grid);
            rotated = true;
        } else if (direction === "ArrowDown") {
            grid = rotateGrid(grid);
            grid = grid.map(row => row.reverse());
            rotated = true;
        } else if (direction === "ArrowRight") {
            grid = grid.map(row => row.reverse());
        }

        for (let i = 0; i < 4; i++) {
            let row = grid[i].filter(num => num);
            let newRow = [];

            for (let j = 0; j < row.length; j++) {
                if (row[j] === row[j + 1]) {
                    newRow.push(row[j] * 2);
                    score += row[j] * 2;
                    j++;
                } else {
                    newRow.push(row[j]);
                }
            }

            while (newRow.length < 4) newRow.push(0);
            if (JSON.stringify(grid[i]) !== JSON.stringify(newRow)) moved = true;
            grid[i] = newRow;
        }

        if (rotated) {
            grid = rotateGrid(grid);
            if (direction === "ArrowDown") {
                grid = grid.map(row => row.reverse());
            }
        } else if (direction === "ArrowRight") {
            grid = grid.map(row => row.reverse());
        }

        if (moved) {
            addNewTile();
            updateBoard();
            checkGameOver();
        }
    }

    function rotateGrid(grid) {
        return grid[0].map((_, i) => grid.map(row => row[i]));
    }

    function checkGameOver() {
        if (!grid.flat().includes(0)) {
            for (let r = 0; r < 4; r++) {
                for (let c = 0; c < 4; c++) {
                    if (
                        (r < 3 && grid[r][c] === grid[r + 1][c]) ||
                        (c < 3 && grid[r][c] === grid[r][c + 1])
                    ) {
                        return;
                    }
                }
            }
            gameOverDiv.style.visibility = "visible";
            gameOver = true;
        }
    }

    restartButton.addEventListener("click", initializeGame);
    document.addEventListener("keydown", (e) => move(e.key));
    initializeGame();

    // ✅ Mobile Touch Support
    let startX = null;
    let startY = null;

    document.addEventListener("touchstart", (e) => {
        const touch = e.touches[0];
        startX = touch.clientX;
        startY = touch.clientY;
    });

    document.addEventListener("touchend", (e) => {
        if (startX === null || startY === null) return;

        const touch = e.changedTouches[0];
        const endX = touch.clientX;
        const endY = touch.clientY;

        const deltaX = endX - startX;
        const deltaY = endY - startY;

        const absX = Math.abs(deltaX);
        const absY = Math.abs(deltaY);

        if (Math.max(absX, absY) > 20) {
            if (absX > absY) {
                if (deltaX > 0) move("ArrowRight");
                else move("ArrowLeft");
            } else {
                if (deltaY > 0) move("ArrowDown");
                else move("ArrowUp");
            }
        }

        startX = null;
        startY = null;
    });
});
