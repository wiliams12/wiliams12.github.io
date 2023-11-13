var GRID_SIZE = 3;

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

class Sudoku {
    constructor(tiles){
        this.tiles = tiles;
        this.numbers = [];
        for (let i = 1; i <= GRID_SIZE**2; i++){
            this.numbers.push(i);
        }
        this.preemitiveSets = this.makePreemtiveSets(this.tiles);
        this.makeTiles();
    }

    // checks the correctness of the puzzle
    // O(N) complexity where N = number of tiles; but in practice, it is close to O(1)
    check(tiles){
        var valid = true;
        for (let i = 0; i < GRID_SIZE**2; i++) {
            var numbersInRow = [];
            var numbersInColumn = [];
            for (let j = 0; j < GRID_SIZE**2; j++) {
                if (numbersInRow.includes(tiles[i][j]) && tiles[i][j] != 0){ // good
                    valid = false;
                }
                else {
                    numbersInRow.push(tiles[i][j]);
                }
                if (numbersInColumn.includes(tiles[j][i]) && tiles[j][i] != 0) { // good
                    valid = false;
                }
                else {
                    numbersInColumn.push(tiles[j][i]);
                }
            }
        }
        for (let x = 0; x < GRID_SIZE; x++) { // good
            for (let y = 0; y < GRID_SIZE; y++) {
                var numbersInBox = [];
                for (let i = 0; i < GRID_SIZE; i++) {
                    for (let j = 0; j < GRID_SIZE; j++) {
                        if (numbersInBox.includes(tiles[x*GRID_SIZE+i][y*GRID_SIZE+j]) && tiles[x*GRID_SIZE+i][y*GRID_SIZE+j] != 0) {
                            valid = false;
                        }
                        else {
                            numbersInBox.push(tiles[x*GRID_SIZE+i][y*GRID_SIZE+j]);
                        }
                    }
                }
            }
        }
        return valid;
    }

    // first solution using recursion
    // O(!N) tiem complexity where N = number of tiles; also O(!N) space complexity
    solve(tiles) {
        if (tiles.length != 0){
            for (let i = 0; i < GRID_SIZE**2; i++){
                for (let j = 0; j < GRID_SIZE**2; j++){
                    if (tiles[i][j] == 0) {
                        let newArr = tiles.map((row)=>[...row]);
                        for (let number of this.numbers) {
                            newArr[i][j] = number;
                            if (this.check(newArr)) {
                                let res = this.solve(newArr);
                                if (res.length != 0) {
                                    tiles = newArr.map((row)=>[...row]);
                                    break;
                                }
                            }
                        }
                    }
                }
            }
            for (let i = 0; i < GRID_SIZE**2; i++){ // brute force na hulváta
                for (let j = 0; j < GRID_SIZE**2; j++){
                    if (tiles[i][j] == 0) {
                        return [];
                    }
                }
            }
        }
        if (this.check(tiles)) {
            return tiles;
        }
        return [];
    }
    // Second solution implementing preemtive sets
    // If pSets are correct pass them in. Else let the solve() make them correct for you.
    // Could make them automaticaly, but it is not the fastest way.
    solve(tiles, pSets=undefined) {
        if (!this.check(tiles)) {
            return [];
        }
        if (pSets === undefined) {
            pSets = this.makePreemtiveSets(tiles);
        }
        return this.backtrack(tiles, pSets);
    }

    backtrack(tiles, pSets) {
        if (tiles.length != 0 && pSets.length != 0) {
            if (!checkForElement(0, tiles)) {
                return tiles;
            }
            var newPSets = pSets.map(x=>[ ...x ]);
            var newTiles = tiles.map(x=>[ ...x ]);
            while (true) {
                let location = this.findSingleton(newPSets);
                if (location === undefined) {
                    break;
                } 
                else {
                    let newEnv = this.enterValue(newTiles,newPSets,location);
                    newTiles = newEnv[0];
                    newPSets = newEnv[1];
                }
            }
            for (let i = 0; i < GRID_SIZE**2; i++) {
                for (let j = 0; j < GRID_SIZE**2; j++) {
                    if (newTiles[i][j] == 0) {
                        for (let num of newPSets[i][j]) {
                            newTiles[i][j] = num;
                            if (this.check(newTiles)) {
                                let originalPSets = newPSets.map(x=>[ ...x ]);
                                this.enterValue(newTiles, newPSets, {'row':i, 'col':j, 'value': num});
                                let res = this.backtrack(newTiles, newPSets);
                                if (res.length != 0) {
                                    return res;
                                }
                                newPSets = originalPSets;
                            }
                            newTiles[i][j] = 0;
                        }
                        //* if It can't have a valid value, this is a wrong way to go
                        return [];
                    }
                }
            }
            //* If no value is = to 0, then it comes through to this line of code and should return 👍.
            return newTiles;
        }
        return [];
    }

    // value syntax: {row: " ", col: " ", num: " "}
    enterValue(tiles,pSets,value) {
        var newPSets = pSets.map(x=>[ ...x ]);
        var newTiles = tiles.map(x=>[ ...x ]);
        newTiles[value['row']][value['col']] = value['num'];
        this.updatePreemtiveSets(newPSets, newTiles, [value['row'], value['col']]);
        return [newTiles, newPSets];
    }

    // creates tiles as DOM elements
    makeTiles(tiles){
        let gridBox = document.getElementById('grid');
        for (let i = 0; i < GRID_SIZE**2; i++){
            let row = document.createElement('div');
            for (let j = 0; j < GRID_SIZE**2; j++){
                let tile = document.createElement('div');
                if (this.tiles[i][j] != 0) {
                    tile.innerHTML = this.tiles[i][j];
                }
                row.appendChild(tile);
            }
            gridBox.appendChild(row);
        }
    }

    // makes preemtive sets
    makePreemtiveSets(tiles){
        let pSets = Array(GRID_SIZE**2).fill().map(() => Array(GRID_SIZE**2).fill().map(()=>[ ...this.numbers ]));
        for (let i = 0; i < GRID_SIZE**2; i++) {
            var inRow = [];
            var inCol = [];
            for (let j = 0; j < GRID_SIZE**2; j++) {
                if (!inRow.includes(tiles[i][j]) && tiles[i][j] != 0){
                    inRow.push(tiles[i][j]);
                }
                if (!inCol.includes(tiles[j][i]) && tiles[j][i] != 0) {
                    inCol.push(tiles[j][i]);
                }
            }
            // change preemtive sets
            // There is something in those two for loops that interferes with solve()
            for (let j = 0; j < GRID_SIZE**2; j++) {
                if (tiles[i][j] != 0) {
                    pSets[i][j] = [];
                }
                else {
                    for (let num of inRow) {
                        removeElement(num, pSets[i][j]);
                    }
                }
                if (tiles[j][i] != 0) {
                    pSets[j][i] = [];
                }
                else {
                    for (let num of inCol) {
                        removeElement(num, pSets[j][i]);
                    }
                }
            }
        }
        for (let x = 0; x < GRID_SIZE; x++) {
            for (let y = 0; y < GRID_SIZE; y++) {
                var inBox = [];
                for (let i = 0; i < GRID_SIZE; i++) {
                    for (let j = 0; j < GRID_SIZE; j++) {
                        if (!inBox.includes(tiles[x*GRID_SIZE+i][y*GRID_SIZE+j]) && tiles[x*GRID_SIZE+i][y*GRID_SIZE+j] != 0) {
                            inBox.push(tiles[x*GRID_SIZE+i][y*GRID_SIZE+j]);
                        }
                    }
                }
                for (let i = 0; i < GRID_SIZE; i++) {
                    for (let j = 0; j < GRID_SIZE; j++) {
                        if (tiles[x*GRID_SIZE+i][y*GRID_SIZE+j] != 0) {
                            pSets[x*GRID_SIZE+i][y*GRID_SIZE+j] = [];
                        }
                        else {
                            for (let num of inBox) {
                                removeElement(num, pSets[x*GRID_SIZE+i][y*GRID_SIZE+j]);
                            }
                        }
                    }
                }
            }
        }
        return pSets;
    }

    // updates preemtive sets
    // tile = coordinates of the tile in the format [row,col]
    updatePreemtiveSets(pSets,tiles, tile) {
        pSets[tile[0]][tile[1]] = [];
        let num = tiles[tile[0]][tile[1]];
        for (let i = 0; i < GRID_SIZE**2; i++) {
            removeElement(num, pSets[tile[0]][i]) // row
            removeElement(num, pSets[i][tile[1]]); // col
        }
        let mapping = {};
        for (let q = 0; q < GRID_SIZE; q++) {
            for (let i = 0; i < GRID_SIZE; i++) {
                mapping[q+i*GRID_SIZE] = i;
            }
        }
        let x = mapping[tile[0]]; // row
        let y = mapping[tile[1]]; // col
        for (let i = 0; i < GRID_SIZE; i++) {
            for (let j = 0; j < GRID_SIZE; j++) {
                removeElement(num, pSets[x*GRID_SIZE+i][y*GRID_SIZE+j]); // box
            }
        }
    }

    // finds the first singleton a formats its location to an object
    findSingleton(pSets) {
        for (let i = 0; i < GRID_SIZE**2; i++) {
            for (let j = 0; j < GRID_SIZE**2; j++) {
                if (pSets[i][j].length == 1) {
                    return {
                        'row': i, 
                        'col': j,
                        'num': pSets[i][j][0]
                    };
                }
            }
        }
        return undefined;
    }

    fillBoard(tiles) {
        for (let i = 0; i < GRID_SIZE**2; i++) {
            let row = document.querySelector(`#grid > div:nth-child(${i + 1})`);
            for (let j = 0; j < GRID_SIZE**2; j++) {
                let tile = row.querySelector(`div:nth-child(${j + 1})`);
                tile.innerHTML = tiles[i][j];
            }
        }
    }

    clearBoard() {
        this.tiles = Array(GRID_SIZE**2).fill().map(() => Array(GRID_SIZE**2).fill(0));
        this.preemitiveSets = Array(GRID_SIZE**2).fill().map(() => Array(GRID_SIZE**2).fill().map(()=>[ ...this.numbers ]));
        for (let i = 0; i < GRID_SIZE**2; i++) {
            let row = document.querySelector(`#grid > div:nth-child(${i + 1})`);
            for (let j = 0; j < GRID_SIZE**2; j++) {
                let tile = row.querySelector(`div:nth-child(${j + 1})`);
                tile.innerHTML = "";
            }
        }
    }
    // shotens the preemtive sets
    // ! doesn't do a shit
    // ? probably just ignore; it is long and useless
    /*shorten(pSets) {
        var newPSets = pSets.map(x=>[ ...x ]);
        for (let i = 0; i < GRID_SIZE**2; i++) {
            for (let j = 0; j < GRID_SIZE**2; j++) {
                let matches = [];
                let current = pSets[i][j]
                for (let x = 0; x < GRID_SIZE**2; x++) {
                    if (x != j) {
                        if (pSets[i][x].length < current.length) {
                            let valid = true
                            for (let num of pSets[i][x]) {
                                if (!num in current) {
                                    valid = false;
                                    break;
                                }
                            }
                            if (valid) {
                                matches.push(pSets[i][x]);
                            }
                        }
                    }
                }
                if (current.length == matches.length) {
                        for (let i = 0; i < GRID_SIZE**2; i++) {
                            for (let j = 0; j < GRID_SIZE**2; j++) {
                                if (!pSets[i][j] in matches) {
                                    for (let el of current) {
                                        removeElement(el, pSets);
                                    }
                                }
                            }
                        }
                    }
                // does the cols
                matches = [];
                current = pSets[j][i]
                for (let x = 0; x < GRID_SIZE**2; x++) {
                    if (x != j) {
                        if (pSets[x][i].length < current.length) {
                            let valid = true
                            for (let num of pSets[x][i]) {
                                if (!num in current) {
                                    valid = false;
                                    break;
                                }
                            }
                            if (valid) {
                                matches.push(pSets[x][i]);
                            }
                        }
                    }
                }
                if (current.length == matches.length) {
                    for (let i = 0; i < GRID_SIZE**2; i++) {
                        for (let j = 0; j < GRID_SIZE**2; j++) {
                            if (!pSets[j][i] in matches) {
                                for (let el of current) {
                                    removeElement(el, pSets);
                                }
                            }
                        }
                    }
                }
            }
        }
        // does the boxes
        for (let x = 0; x < GRID_SIZE; x++) {
            for (let y = 0; y < GRID_SIZE; y++) {
                let matches = [];
                for (let i = 0; i < GRID_SIZE; i++) {
                    for (let j = 0; j < GRID_SIZE; j++) {
                        let current = pSets[x*GRID_SIZE+i][y*GRID_SIZE+j];
                        for (let n = 0; n < GRID_SIZE; n++) {
                            for (let m = 0; m < GRID_SIZE; m++) {
                                if (m != j && n != i) {
                                    if (pSets[x*GRID_SIZE+n][y*GRID_SIZE+m].length < current.length) {
                                        let valid = true;
                                        for (let num of pSets[x*GRID_SIZE+n][y*GRID_SIZE+m]) {
                                            if (!num in current) {
                                                valid = false;
                                                break;
                                            }
                                        }
                                        if (valid) {
                                            matches.push([x*GRID_SIZE+n][y*GRID_SIZE+m]);
                                        }
                                    }
                                }  
                            } 
                        }
                        if (current.length == matches.length) {
                            for (let i = 0; i < GRID_SIZE**2; i++) {
                                for (let j = 0; j < GRID_SIZE**2; j++) {
                                    if (!pSets[j][i] in matches) {
                                        for (let el of current) {
                                            removeElement(el, pSets);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }*/
}

// var sudoku = new Sudoku();

// solution = sudoku.solve(sudoku.tiles, sudoku.preemitiveSets);
// console.log(solution);

// move to app.js
// make helpers.js

// returns 0 if an element is removed and 1 if not
// can be done with "array.splice(array.indexOf(element),1)"
function removeElement(element, array) {
    let l = array.length;
    for (let i = 0; i < l; i++) {
        if (array[i] === element) {
            array.splice(i,1);
            return 0;
        }
    }
    return 1;
}

function checkForElement(element, array) {
    for (let row of array) {
        for (let i of row) {
            if (i == element) { // maybe === are better, but when checking for numbers, == should work just fine
                return true;
            }
        }
    }
    return false;
}

export default Sudoku;