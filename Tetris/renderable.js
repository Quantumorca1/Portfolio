var maxID = 1;

// This defines the renderable object. This can be passed to WebGL to be rendered.
class Renderable {
    constructor(gl, texture_src, x, y, z, length, width, depth) {
        if (depth === undefined) {
            depth = width;
        }
        this.gl = gl;
        //console.log(this.gl);
        this.id = maxID;
        maxID++;
        this.texture_src = texture_src;
        this.x = x;
        this.y = y;
        this.z = z;
        this.length = length;
        this.width = width;
        this.depth = depth;
        this.xAxis = [1, 0, 0];
        this.yAxis = [0, 1, 0];
        this.pos = [this.x, this.y, this.z];
        this.translation = vec3.fromValues(0, 0, 0);
        this.material = {
            ambient: [0.0, 0.0, 0.0],
            diffuse: [0.0, 0.0, 0.0],
            specular: [0.0, 0.0, 0.0],
            n: 0
        };
        // two triangles of the rectangle
        this.vertices = [x, y, z,
            x + width, y, z,
            x, y + length, z,
            x + width, y + length, z];
        this.vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
        // index buffer
        if (this.depth == 0) {
            this.indices = [0, 1, 2, 1, 2, 3];
        } else {
            this.indices = [0, 1, 2, 0, 2, 3,    // front
                4, 5, 6, 4, 6, 7,    // back
                8, 9, 10, 8, 10, 11,   // top
                12, 13, 14, 12, 14, 15,   // bottom
                16, 17, 18, 16, 18, 19,   // right
                20, 21, 22, 20, 22, 23];
        }
        this.indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), gl.STATIC_DRAW);
        // uvs of the texture. just the corners of the rectangle.
        /*this.uvs = [1, 1,
            0, 1,
            1, 0,
            0, 0,// Back
            0.0,  0.0,
            1.0,  0.0,
            1.0,  1.0,
            0.0,  1.0,];*/

        if (depth == 0) {
            this.uvs = [1, 1,
                0, 1,
                1, 0,
                0, 0];
        } else {
            this.uvs = [
                // Left
                1.0, 1.0,
                0.0, 1.0,
                0.0, 0.0,
                1.0, 0.0,
                // Right
                1.0, 1.0,
                0.0, 1.0,
                0.0, 0.0,
                1.0, 0.0,
                // Bottom
                1.0, 1.0,
                0.0, 1.0,
                0.0, 0.0,
                1.0, 0.0,
                // Top
                1.0, 1.0,
                0.0, 1.0,
                0.0, 0.0,
                1.0, 0.0,
                // Front
                1.0, 1.0,
                0.0, 1.0,
                0.0, 0.0,
                1.0, 0.0,
                // Back
                1.0, 1.0,
                0.0, 1.0,
                0.0, 0.0,
                1.0, 0.0,
            ];
        }

        this.uvBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.uvs), gl.STATIC_DRAW);
        // remember to add normals if we do lighting
        // define the image and texture data
        this.textureBuffer = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.textureBuffer);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 0]));
        this.image_data = new Image(32, 128);
        this.image_data.crossOrigin = "Anonymous";
        this.image_data.loading = "eager";
        this.image_data.onload = this.load_image.bind(this);
        this.image_data.src = this.texture_src;
        //console.log(this.image_data);
    }

    update_vertices() {
        this.pos = [this.x, this.y, this.z];
        
        if (this.depth == 0) {
            // front half of cube
            this.vertices = [this.x, this.y, this.z,
            this.x + this.width, this.y, this.z,
            this.x, this.y + this.length, this.z,
            this.x + this.width, this.y + this.length, this.z];

            /*/ back half
            this.vertices.push([this.x, this.y, this.z + this.depth,
                this.x + this.width, this.y, this.z + this.depth,
                this.x, this.y + this.length, this.z + this.depth,
                this.x + this.width, this.y + this.length, this.z + this.depth]);*/
        } else {

            var farX = this.x + this.width;
            var farY = this.y + this.height;
            var farZ = this.z + this.depth;
            this.vertices = [
                this.x, this.y,  this.z,
                 farX, this.y,  this.z,
                 farX,  farY,  this.z,
                this.x,  farY,  this.z,
                
                this.x, this.y, farZ,
                this.x,  farY, farZ,
                 farX,  farY, farZ,
                 farX, this.y, farZ,
                
                this.x,  farY, farZ,
                this.x,  farY,  this.z,
                 farX,  farY,  this.z,
                 farX,  farY, farZ,
                
                this.x, this.y, farZ,
                 farX, this.y, farZ,
                 farX, this.y,  this.z,
                this.x, this.y,  this.z,
                
                 farX, this.y, farZ,
                 farX,  farY, farZ,
                 farX,  farY,  this.z,
                 farX, this.y,  this.z,
                
                this.x, this.y, farZ,
                this.x, this.y,  this.z,
                this.x,  farY,  this.z,
                this.x,  farY, farZ,
              ];
        }

        this.vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
    }

    load_image() {
        //console.log(this.textureBuffer);
        gl.bindTexture(gl.TEXTURE_2D, this.textureBuffer);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.image_data);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }

}

