// Program by Gavin Shirey

/* GL constant */
var gl = null;
const img_path = "http://localhost:8000/";
//https://github.ncsu.edu/gsshirey/Tetris/blob/master/piece_long.png?raw=true

/* Main execution */
function main() {
    console.log('tetris time');

    var canvas = document.getElementById("myWebGLCanvas");
    gl = canvas.getContext("webgl");
    gl.clearColor(0, 0, 0, 1);

    var angle = 0;
    var zAngle = 0;

    //var tetronimo = new Tetronimo(gl, "piece_t", 5, 19);
    //var tetronimo2 = new Tetronimo(gl, "piece_long", 0, 0);
    var boardBG = new Renderable(gl, img_path + "board.png", 0, 0, 0, 1, 1, 0);

    var renderer = new Renderer(gl);
    renderer.addObject(boardBG);
    var board = new Board(renderer);
    board.printBoard();
    board.setMainPiece();

    renderer.render();

    var temp = vec3.create();
    var maxCorner = vec3.fromValues(Number.MIN_VALUE, Number.MIN_VALUE, Number.MIN_VALUE);
    var minCorner = vec3.fromValues(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE);
    vec3.length(vec3.subtract(temp, maxCorner, minCorner)) / 100;
    var viewDelta = Math.PI / 360;
    document.addEventListener('keydown', (event) => {


        var lookAt = vec3.create(), viewRight = vec3.create(), temp = vec3.create(); // lookat, right & temp vectors
        lookAt = vec3.normalize(lookAt, vec3.subtract(temp, renderer.Center, renderer.Eye)); // get lookat vector
        viewRight = vec3.normalize(viewRight, vec3.cross(temp, lookAt, renderer.Up)); // get view right vector

        if (event.keyCode === 83 || event.keyCode === 40) {
            board.attemptDown();
        } else if (event.keyCode === 87) {
        } else if (event.keyCode === 65 || event.keyCode === 37) {
            board.attemptLeft();
        } else if (event.keyCode === 68 || event.keyCode === 39) {
            board.attemptRight();
        } else if (event.keyCode === 32) {
            board.hardDrop();
        } else if (event.keyCode === 81) {
            // rotate left
            board.rotateLeft();
        } else if (event.keyCode === 69 || event.keyCode === 38) {
            // rotate right
            board.rotateRight();
        } else if (event.keyCode === 74) {
            renderer.Center = vec3.add(renderer.Center, renderer.Center, vec3.scale(temp, viewRight, viewDelta));
            if (!event.getModifierState("Shift"))
                renderer.Eye = vec3.add(renderer.Eye, renderer.Eye, vec3.scale(temp, viewRight, viewDelta));
        } else if (event.keyCode === 76) {
            renderer.Center = vec3.add(renderer.Center, renderer.Center, vec3.scale(temp, viewRight, -viewDelta));
            if (!event.getModifierState("Shift"))
                renderer.Eye = vec3.add(renderer.Eye, renderer.Eye, vec3.scale(temp, viewRight, -viewDelta));
        } else if (event.keyCode === 73) {
            if (event.getModifierState("Shift")) {
                renderer.Center = vec3.add(renderer.Center, renderer.Center, vec3.scale(temp, renderer.Up, -viewDelta));
                renderer.Up = vec3.cross(renderer.Up, viewRight, vec3.subtract(lookAt, renderer.Center, renderer.Eye));
            } else {
                renderer.Eye = vec3.add(renderer.Eye, renderer.Eye, vec3.scale(temp, lookAt, viewDelta));
                renderer.Center = vec3.add(renderer.Center, renderer.Center, vec3.scale(temp, lookAt, viewDelta));
            }
        } else if (event.keyCode === 75) {
            if (event.getModifierState("Shift")) {
                renderer.Center = vec3.add(renderer.Center, renderer.Center, vec3.scale(temp, renderer.Up, viewDelta));
                renderer.Up = vec3.cross(renderer.Up, viewRight, vec3.subtract(lookAt, renderer.Center, renderer.Eye));
            } else {
                renderer.Eye = vec3.add(renderer.Eye, renderer.Eye, vec3.scale(temp, lookAt, -viewDelta));
                renderer.Center = vec3.add(renderer.Center, renderer.Center, vec3.scale(temp, lookAt, -viewDelta));
            } 
        } else if (event.keyCode === 85) {
            if (event.getModifierState("Shift")) {
                angle -= Math.PI / 360;
                renderer.Up[0] = Math.sin(angle);
                renderer.Up[1] = Math.cos(angle);
            } else {
                renderer.Eye[1] += .1;
                renderer.Center[1] += .1;
                renderer.updateEye();
            }
        } else if (event.keyCode === 79) {
            if (event.getModifierState("Shift")) {
                angle += Math.PI / 360;
                renderer.Up[0] = Math.sin(angle);
                renderer.Up[1] = Math.cos(angle);
            } else {
                renderer.Eye[1] -= .1;
                renderer.Center[1] -= .1;
                renderer.updateEye();
            }
        }
    });

}