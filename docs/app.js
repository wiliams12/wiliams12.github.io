import Sudoku from './sudoku.js';

 //Array(GRID_SIZE**2).fill().map(() => Array(GRID_SIZE**2).fill(0));
var testTiles = [
    [2,0,4,5,0,1,0,0,0],
    [0,0,0,9,2,8,0,0,0],
    [0,5,0,0,0,0,0,0,1],
    [1,6,0,0,0,0,0,3,2],
    [0,2,0,0,1,0,0,9,0],
    [4,3,0,0,0,0,0,8,6],
    [8,0,0,0,0,0,0,4,0],
    [0,0,0,7,5,2,0,0,0],
    [0,0,0,8,0,9,6,0,3]
   ]

var currentlyOn = 0;
var sudoku = new Sudoku(testTiles);

// let solution = sudoku.solve(sudoku.tiles, sudoku.preemitiveSets)
// sudoku.fillBoard(solution);

document.getElementById("solve").addEventListener("click", function(){
    let solution = sudoku.solve(sudoku.tiles)
    if (solution.length != 0) {
        sudoku.fillBoard(solution);
    }
    else {
        window.alert('This puzzle has no solution.')
    }
});

document.getElementById("clear").addEventListener("click", function(){
    sudoku.clearBoard();
});

for (let i = 0; i < 9; i++) {
    let row = document.querySelector(`#grid > div:nth-child(${i + 1})`);
    for (let j = 0; j < 9; j++) {
        let tile = row.querySelector(`div:nth-child(${j + 1})`);
        tile.addEventListener('click',function handleInput() {
            if (currentlyOn != 0) {
                tile.innerHTML = currentlyOn;
            }
            else {
                tile.innerHTML = "";
            }
            sudoku.tiles[i][j] = currentlyOn;
        });
    }
}

let numbers = document.querySelectorAll('.num-button');
for (let num of numbers) {
    if (num.id == 0) {
        num.style['background-color'] = '#F3B664';
    }
    num.addEventListener('click', function setCurrentlyOn() {
        currentlyOn = Number(num.id);
        for (let btn of numbers) {
            btn.style['background-color'] = '#EC8F5E';
        }
        if (num != 0) {
            num.style['background-color'] = '#F3B664';
        }
    });
}
