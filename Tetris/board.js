// This is an array of piece names for generating new types pieces
const piece_generator = ["piece_long", "piece_long", "piece_l", "piece_l", "piece_r", "piece_r", "piece_s",
                        "piece_s", "piece_z", "piece_z", "piece_t", "piece_t", "piece_square", "piece_square"];

/* This class defines the tetris board that will be used for gameplay. */
class Board {

    constructor(renderer) {

        /* renderer object */
        this.renderer = renderer;

        /* playfield array */
        this.playfield = [];
        // init playfield
        for (var i = 0; i < 22; i++) {
            this.playfield.push([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
        }

        this.tetronimos = [];
        this.currentPiece = null;
        this.linesCleared = 0;
        this.score = 0;

        // this array gets shuffled to ensure every pieces appears twice every 14 pieces.
        this.upcomingPieces = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 12];
        this.upcomingPieces = shuffle(this.upcomingPieces);
        this.upcomingIndex = 0;

    }

    // prints the board to the console
    printBoard() {

        var string = "";
        for (var i = this.playfield.length - 1; i >= 0; i--) {
            string = string + "---------------------\n";
            for (var j = 0; j < this.playfield[i].length; j++) {
                if (j === 0) {
                    string = string + "|";
                }
                string = string + this.playfield[i][j] + "|";
            }
            string = string + "\n";
        }
        string = string + "---------------------\n";
        console.log(string);

    }

    // sets the main piece
    setMainPiece() {

        // reset our random array
        if (this.upcomingIndex == 14) {
            this.upcomingIndex = 0;
            this.upcomingPieces = shuffle(this.upcomingPieces);
        }

        // grab a new piece
        var type = piece_generator[this.upcomingPieces[this.upcomingIndex]];
        this.upcomingIndex++;

        this.currentPiece = new Tetronimo(gl, type, 4, 19, this);
        this.currentRotation = 0;
        this.tetronimos.push(this.currentPiece);
        var boardX = this.currentPiece.boardPos[0];
        var boardY = this.currentPiece.boardPos[1] - 1;
        
        if (type == "piece_t") {
            //console.log("X: " + boardX + " Y: " + boardY);
            this.playfield[boardY][boardX] = 1;
            this.playfield[boardY][boardX - 1] = 1;
            this.playfield[boardY + 1][boardX - 1] = 1;
            this.playfield[boardY][boardX - 2] = 1;

            // sets our current piece coords
            this.pieceCoords = [boardX, boardY, boardX - 1, boardY, boardX - 1, boardY + 1, boardX - 2, boardY];
        } else if (type == "piece_long") {
            //console.log("X: " + boardX + " Y: " + boardY);
            this.playfield[boardY][boardX - 3] = 1;
            this.playfield[boardY][boardX - 2] = 1;
            this.playfield[boardY][boardX - 1] = 1;
            this.playfield[boardY][boardX] = 1;

            // sets our current piece coords
            this.pieceCoords = [boardX - 3, boardY, boardX - 2, boardY, boardX - 1, boardY, boardX, boardY];
        } else if (type == "piece_square") {
            //console.log("X: " + boardX + " Y: " + boardY);
            this.playfield[boardY][boardX] = 1;
            this.playfield[boardY + 1][boardX] = 1;
            this.playfield[boardY][boardX - 1] = 1;
            this.playfield[boardY + 1][boardX - 1] = 1;

            // sets our current piece coords
            this.pieceCoords = [boardX, boardY, boardX, boardY + 1, boardX - 1, boardY, boardX - 1, boardY + 1];
        } else if (type == "piece_s") {
            //console.log("X: " + boardX + " Y: " + boardY);
            this.playfield[boardY][boardX - 2] = 1;
            this.playfield[boardY][boardX - 1] = 1;
            this.playfield[boardY + 1][boardX - 1] = 1;
            this.playfield[boardY + 1][boardX] = 1;

            // sets our current piece coords
            this.pieceCoords = [boardX - 2, boardY, boardX - 1, boardY, boardX - 1, boardY + 1, boardX, boardY + 1];
        } else if (type == "piece_z") {
            //console.log("X: " + boardX + " Y: " + boardY);
            this.playfield[boardY][boardX] = 1;
            this.playfield[boardY][boardX - 1] = 1;
            this.playfield[boardY + 1][boardX - 1] = 1;
            this.playfield[boardY + 1][boardX - 2] = 1;

            // sets our current piece coords
            this.pieceCoords = [boardX, boardY, boardX - 1, boardY, boardX - 1, boardY + 1, boardX - 2, boardY + 1];
        } else if (type == "piece_l") {
            //console.log("X: " + boardX + " Y: " + boardY);
            this.playfield[boardY + 1][boardX] = 1;
            this.playfield[boardY][boardX] = 1;
            this.playfield[boardY][boardX - 1] = 1;
            this.playfield[boardY][boardX - 2] = 1;

            // sets our current piece coords
            this.pieceCoords = [boardX, boardY, boardX - 1, boardY, boardX - 2, boardY, boardX, boardY + 1];
        } else if (type == "piece_r") {
            //console.log("X: " + boardX + " Y: " + boardY);
            this.playfield[boardY + 1][boardX - 2] = 1;
            this.playfield[boardY][boardX] = 1;
            this.playfield[boardY][boardX - 1] = 1;
            this.playfield[boardY][boardX - 2] = 1;

            // sets our current piece coords
            this.pieceCoords = [boardX, boardY, boardX - 1, boardY, boardX - 2, boardY, boardX - 2, boardY + 1];
        }

        var tempRender = this.currentPiece.getRenderables();
        for (var i = 0; i < tempRender.length; i++) {
            this.renderer.addObject(tempRender[i]);
        }

        this.printBoard();
        this.timeout = window.setTimeout(this.gravity.bind(this), 2000);

    }

    // gets the main piece
    getMainPiece() {
        return this.currentPiece;
    }

    // attempts to move the piece left
    attemptLeft() {

        if (this.currentPiece == null || this.currentPiece == undefined)
            return;

        // check every x coord
        for (var i = 0; i < this.pieceCoords.length; i += 2) {
            if (this.pieceCoords[i] - 1 < 0) {
                console.log("Could not move left! 1");
                return false;
            } else {

                if (this.playfield[this.pieceCoords[i + 1]][this.pieceCoords[i] - 1] == 1) {

                    // check to see if the new coords are part of the old piece
                    var dupe = false;
                    for (var j = 0; j < this.pieceCoords.length; j += 2) {

                        if (this.pieceCoords[i] - 1 == this.pieceCoords[j] && this.pieceCoords[i + 1] == this.pieceCoords[j + 1]) {
                            dupe = true;
                            break;
                        }

                    }

                    if (!dupe) {
                        console.log("Could not move left! 2");
                        return false;
                    }
                }
            }
        }

        // move left
        for (var i = 0; i < this.pieceCoords.length; i += 2) {
            this.playfield[this.pieceCoords[i + 1]][this.pieceCoords[i]] = 0;
            this.pieceCoords[i] -= 1;
            this.playfield[this.pieceCoords[i + 1]][this.pieceCoords[i]] = 1;
        }
        this.currentPiece.translate(-1, 0);

    }

    // attempts to move the piece right
    attemptRight() {

        if (this.currentPiece == null || this.currentPiece == undefined)
            return;

        // check every x coord
        for (var i = 0; i < this.pieceCoords.length; i += 2) {
            if (this.pieceCoords[i] + 1 > 9) {
                console.log("Could not move right! 1");
                return false;
            } else {

                if (this.playfield[this.pieceCoords[i + 1]][this.pieceCoords[i] + 1] == 1) {

                    // check to see if the new coords are part of the old piece
                    var dupe = false;
                    for (var j = 0; j < this.pieceCoords.length; j += 2) {

                        if (this.pieceCoords[i] + 1 == this.pieceCoords[j] && this.pieceCoords[i + 1] == this.pieceCoords[j + 1]) {
                            dupe = true;
                            break;
                        }

                    }

                    if (!dupe) {
                        console.log("Could not move right! 2");
                        return false;
                    }
                }
            }
        }

        // move right
        for (var i = 0; i < this.pieceCoords.length; i += 2) {
            this.playfield[this.pieceCoords[i + 1]][this.pieceCoords[i]] = 0;
            this.pieceCoords[i] += 1;
            this.playfield[this.pieceCoords[i + 1]][this.pieceCoords[i]] = 1;
        }
        this.currentPiece.translate(1, 0);
        console.log("piece coords attempting right: " + this.pieceCoords);

    }

    // attempts to move the piece down one unit
    attemptDown() {
        if (this.currentPiece == null || this.currentPiece == undefined)
            return false;

        // check every y coord
        for (var i = 0; i < this.pieceCoords.length; i += 2) {
            if (this.pieceCoords[i + 1] - 1 < 0) {
                console.log("Could not move down! 1");
                return false;
            } else {

                if (this.playfield[this.pieceCoords[i + 1] - 1][this.pieceCoords[i]] == 1) {

                    // check to see if the new coords are part of the old piece
                    var dupe = false;
                    for (var j = 0; j < this.pieceCoords.length; j += 2) {

                        if (this.pieceCoords[i] == this.pieceCoords[j] && this.pieceCoords[i + 1] - 1 == this.pieceCoords[j + 1]) {
                            dupe = true;
                            break;
                        }

                    }

                    if (!dupe) {
                        console.log("Could not move down! 2");
                        return false;
                    }
                }
            }
        }

        // turn off current points
        for (var i = 0; i < this.pieceCoords.length; i += 2) {
            this.playfield[this.pieceCoords[i + 1]][this.pieceCoords[i]] = 0;
        }

        // move down
        for (var i = 0; i < this.pieceCoords.length; i += 2) {
            this.pieceCoords[i + 1] -= 1;
            this.playfield[this.pieceCoords[i + 1]][this.pieceCoords[i]] = 1;
        }
        this.currentPiece.translate(0, -1);
        //this.printBoard();
        return true;
    }

    // checks to see if the player lost the game
    checkLoss() {
        for (var i = 0; i < this.playfield[20].length; i++) {
            if (this.playfield[20][i] != 0) {
                var p = document.createElement("P");
                p.id = "loss";
                var text = document.createTextNode("You lost... refreshing the page in 5 seconds.");
                p.appendChild(text);
                document.getElementsByTagName("BODY")[0].appendChild(p);
                window.setTimeout(function() {
                    window.location.reload();
                }, 5000);
                return -1;
            }
        }
    }

    // clears the specified row
    clearLine(row) {
        for (var i = 0; i < this.tetronimos.length; i++) {
            for (var j = 0; j < this.tetronimos[i].visualInfo.length; j++) {
                if (this.tetronimos[i].visualInfo[j].tileY == row) {
                    this.renderer.removeObject(this.tetronimos[i].visualInfo[j]);
                }
            }
        }
        for (var i = 0; i < this.playfield[row].length; i++) {
            this.playfield[row][i] = 0;
        }
    }

    // checks the board by row to see if a row has been filled
    checkLines() {

        // check to see if the player lost
        if (this.checkLoss() == -1)
            return -1;

        var fullRows = [];
        var check = false;

        for (var i = 0; i < this.playfield.length; i++) {
            var temp = 1;
            for (var j = 0; j < 10; j++) {
                temp *= this.playfield[i][j];
            }
            if (temp > 0) {
                fullRows.unshift(i);
                check = true;
            }
        }

        if (check) {
            console.log(fullRows);

            // clear the line
            for (var i = 0; i < fullRows.length; i++) {
                this.clearLine(fullRows[i]);
                this.linesCleared++;
                document.getElementById("lines").innerHTML = "Lines: " + this.linesCleared;
            }

            this.score += 1000 * fullRows.length + Math.pow(10, fullRows.length - 1);
            document.getElementById("score").innerHTML = "Score: " + this.score;

            // translate every segment down
            // for each deleted row
            for (var i = 0; i < fullRows.length; i++) {
                // for each row above the deleted row
                for (var j = fullRows[i] + 1; j < this.playfield.length; j++) {
                    this.playfield[j - 1] = JSON.parse(JSON.stringify(this.playfield[j]));

                    //for each tile
                    for (var k = 0; k < this.tetronimos.length; k++) {
                        for (var l = 0; l < this.tetronimos[k].visualInfo.length; l++) {
                            if (this.tetronimos[k].visualInfo[l].tileY == j) {
                                this.tetronimos[k].visualInfo[l].tileY -= 1;
                                var temp = this.tetronimos[k].calcGraphicsCoordsTile([this.tetronimos[k].visualInfo[l].tileX, this.tetronimos[k].visualInfo[l].tileY]);
                                this.tetronimos[k].visualInfo[l].x = temp[0];
                                this.tetronimos[k].visualInfo[l].y = temp[1];
                                this.tetronimos[k].visualInfo[l].update_vertices();
                            }
                        }
                    }
                }
            }
        }

        return 0;

    }

    // hard drops the piece
    hardDrop() {
        while (this.attemptDown());
        for (var i = 0; i < this.currentPiece.visualInfo.length; i++) {
            console.log("Tile: " + this.currentPiece.visualInfo[i].id + " Coords: " + this.currentPiece.visualInfo[i].tileX + ", " + this.currentPiece.visualInfo[i].tileY);
        }
        window.clearTimeout(this.timeout);
        this.currentPiece = null;
        if (this.checkLines() == -1) {
            return;
        }
        this.setMainPiece();
        this.printBoard();
    }

    // handles moving the piece down naturally
    gravity() {
        if (this.attemptDown()) {
            this.timeout = window.setTimeout(this.gravity.bind(this), 2000);
        } else {
            this.currentPiece = null;
            if (this.checkLines() == -1) {
                return;
            }
            this.setMainPiece();
        }
    }

    // checks to see if a tetronimo attempting to move is possible
    checkMove(tetronimo, offset) {

        var tiles = tetronimo.getRenderables();
        var move = true;

        // temporarily turn off current tiles
        for (var i = 0; i < this.pieceCoords.length; i += 2) {
            this.playfield[this.pieceCoords[i + 1]][this.pieceCoords[i]] = 0;
        }
        //this.printBoard();
        // for each tile
        for (var i = 0; i < tiles.length; i++) {

            var newX = tiles[i].tileX + offset[0];
            var newY = tiles[i].tileY + offset[1];

            // check all new locations
            if (this.playfield[newY][newX] == 1) {
                move = false;
                break;
            }

        }

        if (!move) {
            //console.log("Cannot move here!");
            // we need to put the old locations back
            for (var i = 0; i < this.pieceCoords.length; i += 2) {
                this.playfield[this.pieceCoords[i + 1]][this.pieceCoords[i]] = 0;
                //console.log("put old locations back");
            }

        } else {
            //console.log("Can move here!");
            this.pieceCoords = [];
            // update location is handled in tetronimo, but handle the board update
            for (var i = 0; i < tiles.length; i++) {
                this.playfield[tiles[i].tileY + offset[1]][tiles[i].tileX + offset[0]] = 1;
                //console.log("put new locations");
                this.pieceCoords.push(tiles[i].tileX + offset[0], tiles[i].tileY + offset[1]);
            }
            console.log("cur piece coords: " + this.pieceCoords);

        }
        return move;
    }

    // rotates the piece 90 degrees to the left.
    rotateLeft() {
        if (this.currentPiece == null || this.currentPiece == undefined)
            return;
        
        this.currentPiece.rotate(false, true);
        this.printBoard();
    }

    // rotates the piece 90 degrees to the right.
    rotateRight() {
        if (this.currentPiece == null || this.currentPiece == undefined)
            return;
        
        this.currentPiece.rotate(true, true);
        this.printBoard();
    }

}

// An array used to shuffle the next piece generator.
// Help and credit: https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
function shuffle(array) {
    var currentIndex = array.length;
    var temp;
    var randomIndex;
  
    while (0 !== currentIndex) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
  
      temp = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temp;
    }
  
    return array;
}