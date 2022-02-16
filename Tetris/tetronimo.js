const blockSizePx = 32 * 800 / 688;
const blockSizeWorld = blockSizePx / 800;
const paddingLeft = 184 / 688;
const paddingUp = 8 / 688;

// 3D array for the rotation tests 5 x 4 x 2
const TRLSZ_OFFSET = [
    [[0, 0], [0, 0], [0, 0], [0, 0]],
    [[0, 0], [1, 0], [0, 0], [-1, 0]],
    [[0, 0], [1, -1], [0, 0], [-1, -1]],
    [[0, 0], [0, 2], [0, 0], [0, 2]],
    [[0, 0], [1, 2], [0, 0], [-1, 2]]
];

const LONG_OFFSET = [
    [[0, 0], [-1, 0], [-1, 1], [0, 1]],
    [[-1, 0], [0, 0], [1, 1], [0, 1]],
    [[2, 0], [0, 0], [-2, 1], [0, 1]],
    [[-1, 0], [0, 1], [1, 0], [0, -1]],
    [[2, 0], [0, -2], [-2, 0], [0, 2]]
];

const SQUARE_OFFSET = [
    [[0, 0], [0, -1], [-1, -1], [-1, 0]]
];

class Tetronimo {

    constructor(gl, type, boardX, boardY, BoardInstance) {
        this.gl = gl;
        this.type = type;
        this.board_instance = BoardInstance;
        this.centerPos = [boardX, boardY];
        this.currentRot = 0;
        this.visualInfo = [];

        if (this.type == "piece_t") {
            this.blockWidth = 3;
            this.blockHeight = 2;
            this.boardPos = [boardX + 1, boardY + 1];
            this.pieceOffset = [[1 * blockSizeWorld, 1 * blockSizeWorld], [0 * blockSizeWorld, 0], [1 * blockSizeWorld, 0], [2 * blockSizeWorld, 0]];
        } else if (this.type == "piece_long") {
            this.blockWidth = 4;
            this.blockHeight = 1;
            this.boardPos = [boardX + 2, boardY + 1];
            this.pieceOffset = [[0, 0], [1 * blockSizeWorld, 0], [2 * blockSizeWorld, 0], [3 * blockSizeWorld, 0]];
        } else if (this.type == "piece_square") {
            this.blockWidth = 2;
            this.blockHeight = 2;
            this.boardPos = [boardX + 1, boardY + 1];
            this.pieceOffset = [[1 * blockSizeWorld, 0], [0, 0], [1 * blockSizeWorld, 1 * blockSizeWorld], [0, 1 * blockSizeWorld]];
        } else if (this.type == "piece_s") {
            this.blockWidth = 3;
            this.blockHeight = 2;
            this.boardPos = [boardX + 1, boardY + 1];
            this.pieceOffset = [[1 * blockSizeWorld, 1 * blockSizeWorld], [0, 1 * blockSizeWorld], [1 * blockSizeWorld, 0], [2 * blockSizeWorld, 0]];
        } else if (this.type == "piece_z") {
            this.blockWidth = 3;
            this.blockHeight = 2;
            this.boardPos = [boardX + 1, boardY + 1];
            this.pieceOffset = [[1 * blockSizeWorld, 0], [0, 0], [1 * blockSizeWorld, 1 * blockSizeWorld], [2 * blockSizeWorld, 1 * blockSizeWorld]];
        } else if (this.type == "piece_l") {
            this.blockWidth = 3;
            this.blockHeight = 2;
            this.boardPos = [boardX + 1, boardY + 1];
            this.pieceOffset = [[0, 0], [0, 1 * blockSizeWorld], [1 * blockSizeWorld, 0], [2 * blockSizeWorld, 0]];
        } else if (this.type == "piece_r") {
            this.blockWidth = 3;
            this.blockHeight = 2;
            this.boardPos = [boardX + 1, boardY + 1];
            this.pieceOffset = [[0, 0], [2 * blockSizeWorld, 1 * blockSizeWorld], [1 * blockSizeWorld, 0], [2 * blockSizeWorld, 0]];
        }

        var tempCoords = this.calcGraphicsCoords();
        console.log(tempCoords);

        /* old code
            this.visualInfo = new Renderable(gl, img_path + type + "_color.png", 0, 0, 0, this.blockHeight * blockSizeWorld, this.blockWidth * blockSizeWorld);
            this.visualInfo.x = tempCoords[0];
            this.visualInfo.y = tempCoords[1];
            this.visualInfo.update_vertices();
        */
       // change from a full piece to four blocks stapled together
        for (var i = 0; i < 4; i++) {

            this.visualInfo.push(new Renderable(gl, img_path + type + "_color.png", 0, 0, 0, blockSizeWorld, blockSizeWorld, 0));
            //this.visualInfo[i].x = this.pieceOffset[i][0] + tempCoords[0];
            //this.visualInfo[i].y = this.pieceOffset[i][1] + tempCoords[1];

            // set up tile coordinates
            this.visualInfo[i].tileX = this.boardPos[0] - this.pieceOffset[i][0] / blockSizeWorld;
            this.visualInfo[i].tileY = this.boardPos[1] + this.pieceOffset[i][1] / blockSizeWorld - 1;
            console.log("Tile " + i + "- X: " + this.visualInfo[i].tileX + ", Y: " + this.visualInfo[i].tileY);

            // calc tile graphics coords
            var temp = this.calcGraphicsCoordsTile([this.visualInfo[i].tileX, this.visualInfo[i].tileY]);
            this.visualInfo[i].x = temp[0];
            this.visualInfo[i].y = temp[1];
            //console.log("Tile " + i + "- X: " + this.visualInfo[i].x + ", Y: " + this.visualInfo[i].y);

            this.visualInfo[i].update_vertices();
        }
        
    }

    getRenderables() {
        return this.visualInfo;
    }

    calcGraphicsCoords() {
        return [paddingLeft + blockSizeWorld * (9 - this.boardPos[0]), paddingUp + blockSizeWorld * (this.boardPos[1])];
    }

    calcGraphicsCoordsTile(tileLoc) {
        return [paddingLeft + blockSizeWorld * (9 - tileLoc[0]), paddingUp + blockSizeWorld * (tileLoc[1])];
    }

    translate(x, y) {

        console.log(this.boardPos);
        if (this.boardPos[0] + x >= 0 && this.boardPos[0] + x <= 9) {
            this.boardPos[0] += x;
            this.centerPos[0] += x;
            for (var i = 0; i < this.visualInfo.length; i++)
                this.visualInfo[i].tileX += x;
            console.log("translated right!");
        }

        if (this.boardPos[1] + y >= 0 && this.boardPos[1] + y <= 21) {
            this.boardPos[1] += y;
            this.centerPos[1] += y;
            for (var i = 0; i < this.visualInfo.length; i++)
                this.visualInfo[i].tileY += y;
        }

        for (var i = 0; i < this.visualInfo.length; i++) {
            var temp = this.calcGraphicsCoordsTile([this.visualInfo[i].tileX, this.visualInfo[i].tileY]);
            this.visualInfo[i].x = temp[0];
            this.visualInfo[i].y = temp[1];
            this.visualInfo[i].update_vertices();
        }
    }

    // The rotation algorithm is known as the Super Rotation System. The math behind it was fairly complex,
    // and I found details about it here: https://www.youtube.com/watch?v=yIpk5TJ_uaI
    rotate(direction, test) {

        if (this.type == "piece_square")
            return;

        var oldRot = this.currentRot;
        this.currentRot += direction ? 1 : -1;
        this.currentRot = mod(this.currentRot, 4);
        console.log(this.centerPos);

        // rotate every tile
        for (var i = 0; i < this.visualInfo.length; i++) {

            console.log("tile loc:" + [this.visualInfo[i].tileX, this.visualInfo[i].tileY])
            // calc pos relative to the center
            var relativePosX = this.visualInfo[i].tileX - this.centerPos[0];
            var relativePosY = this.visualInfo[i].tileY - this.centerPos[1];
            console.log("rel pos:" + [relativePosX, relativePosY]);

            // determine which rotation matrix to use
            var rotMatrix = direction ? [0, -1, 1, 0] : [0, 1, -1, 0];
            // calc the new position after the rotation
            var newX = (rotMatrix[0] * relativePosX) + (rotMatrix[2] * relativePosY) ;
            var newY = (rotMatrix[1] * relativePosX) + (rotMatrix[3] * relativePosY);
            console.log("new rel pos:" + [newX, newY]);

            this.visualInfo[i].tileX = newX + this.centerPos[0];
            this.visualInfo[i].tileY = newY + this.centerPos[1];
            console.log("rotated every piece");
        }

        // check to see if we need to test the rotation
        if (!test) {
            for (var i = 0; i < this.visualInfo.length; i++) {
                var temp = this.calcGraphicsCoordsTile([this.visualInfo[i].tileX, this.visualInfo[i].tileY]);
                this.visualInfo[i].x = temp[0];
                this.visualInfo[i].y = temp[1];
                console.log("did not need to test");
                this.visualInfo[i].update_vertices();
            }
            return;
        }

        // test the rotation, undo it if we cannot rotate
        var canRot = this.offset(oldRot, this.currentRot);
        if (!canRot) {
            console.log("need to undo rotation");
            this.rotate(!direction, false);
        } else {
            var maxX = 0;
            var maxY = 0;
            // update visually
            for (var i = 0; i < this.visualInfo.length; i++) {
                console.log("completed rotation... updating visually");
                var temp = this.calcGraphicsCoordsTile([this.visualInfo[i].tileX, this.visualInfo[i].tileY]);
                this.visualInfo[i].x = temp[0];
                this.visualInfo[i].y = temp[1];
                this.visualInfo[i].update_vertices();

                // update board position
                if (this.visualInfo[i].tileX > maxX);
                    maxX = this.visualInfo[i].tileX;
                if (this.visualInfo[i].tileY > maxY)
                    maxY = this.visualInfo[i].tileY;
            }
            this.boardPos = [maxX, maxY];
            console.log("New board position:" + this.boardPos);
        }

    }

    // checks to see if we need to translate the piece.
    offset(oldRot, curRot) {

        var offset1 = [], offset2 = [], endOffset = [0, 0];
        var currentOffsetData;

        if (this.type == "piece_square") {
            currentOffsetData = SQUARE_OFFSET; // square offset data
        } else if (this.type == "piece_i") {
            currentOffsetData = LONG_OFFSET; // long piece offset data
        } else {
            currentOffsetData = TRLSZ_OFFSET;
        }

        // test to see if we find a possible offset that works
        var possible = false;
        for (var i = 0; i < currentOffsetData.length; i++) {
            console.log(currentOffsetData);
            console.log(curRot);
            offset1 = currentOffsetData[i][oldRot];
            offset2 = currentOffsetData[i][curRot];
            endOffset = [offset1[0] - offset2[0], offset1[1] - offset2[1]];

            // check to see if this move is possible
            if (this.board_instance.checkMove(this, endOffset)) {
                possible = true;
                break;
            }

        }

        // move the piece or 
        if (possible) {
            console.log("needed to do translation after rotation... " + endOffset);
            this.translate(endOffset[0], endOffset[1]);
        }

        return possible;

    }

}

// True modulus
function mod(x, m) {
    return (x % m + m) % m;
}