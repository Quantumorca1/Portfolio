class Renderer {

    /* Sets up GL and renderables. */
    constructor(gl) {
        this.gl = gl;
        this.objects = [];
        
        this.Eye = vec3.fromValues(0.5,0.5,-0.5); // default eye position in world space
        this.Center = vec3.fromValues(0.5,0.5,0.5); // default view direction in world space
        this.Up = vec3.fromValues(0,1,0); // default view up vector

        var vShaderCode = `
        attribute vec3 aVertexPosition; // vertex position
        attribute vec3 aVertexNormal; // vertex normal
        
        uniform mat4 umMatrix; // the model matrix
        uniform mat4 upvmMatrix; // the project view model matrix
        
        varying vec3 vWorldPos; // interpolated world position of vertex
        varying vec3 vVertexNormal; // interpolated normal for frag shader
		
		// texture properties
		attribute vec2 aTexCoord;
		varying highp vec2 vTexCoord;

        void main(void) {
            
            // vertex position
            vec4 vWorldPos4 = umMatrix * vec4(aVertexPosition, 1.0);
            vWorldPos = vec3(vWorldPos4.x,vWorldPos4.y,vWorldPos4.z);
            gl_Position = upvmMatrix * vec4(aVertexPosition, 1.0);

            // vertex normal (assume no non-uniform scale)
            //vec4 vWorldNormal4 = umMatrix * vec4(aVertexNormal, 0.0);
            //vVertexNormal = normalize(vec3(vWorldNormal4.x,vWorldNormal4.y,vWorldNormal4.z)); 
			
			// setting texture varyings
			vTexCoord = aTexCoord;
        }`;

        var fShaderCode = `
        precision mediump float; // set float to medium precision

        // eye location
        uniform vec3 uEyePosition; // the eye's position in world
        
        // light properties
        uniform vec3 uLightAmbient; // the light's ambient color
        uniform vec3 uLightDiffuse; // the light's diffuse color
        uniform vec3 uLightSpecular; // the light's specular color
        uniform vec3 uLightPosition; // the light's position
        
        // material properties
        uniform vec3 uAmbient; // the ambient reflectivity
        uniform vec3 uDiffuse; // the diffuse reflectivity
        uniform vec3 uSpecular; // the specular reflectivity
        uniform float uShininess; // the specular exponent
        
        // geometry properties
        varying vec3 vWorldPos; // world xyz of fragment
        varying vec3 vVertexNormal; // normal of fragment
            
		// texture information
		uniform sampler2D sampler;
		uniform bool lightingMode;
		uniform bool transparencyRender;
		varying highp vec2 vTexCoord;
			
        void main(void) {
        
            // ambient term
            vec3 ambient = uAmbient*uLightAmbient; 
            
            // diffuse term
            vec3 normal = normalize(vVertexNormal); 
            vec3 light = normalize(uLightPosition - vWorldPos);
            float lambert = max(0.0,dot(normal,light));
            vec3 diffuse = uDiffuse*uLightDiffuse*lambert; // diffuse term
            
            // specular term
            vec3 eye = normalize(uEyePosition - vWorldPos);
            vec3 halfVec = normalize(light+eye);
            float highlight = pow(max(0.0,dot(normal,halfVec)),uShininess);
            vec3 specular = uSpecular*uLightSpecular*highlight; // specular term
			
            // combine to output color
            vec3 colorOut = ambient + diffuse + specular; // no specular yet
			vec4 texColor = texture2D(sampler, vTexCoord);
			
			// check if rendering opaque
			if (transparencyRender) {
				if (texColor.a < 1.0) {
					discard;
				}
			} else {
				if (texColor.a == 0.0 || texColor.a == 1.0) {
					discard;
				}
			}
			
			// modulate
			if (lightingMode) {
				vec4 scaled = vec4(colorOut, 1.0) * texColor;
				gl_FragColor = scaled;
			}
			
			// replace
			else {
				gl_FragColor = texColor;
			}
        }`;

        try {
            var fShader = gl.createShader(gl.FRAGMENT_SHADER); // create frag shader
            gl.shaderSource(fShader, fShaderCode); // attach code to shader
            gl.compileShader(fShader); // compile the code for gpu execution

            var vShader = gl.createShader(gl.VERTEX_SHADER); // create vertex shader
            gl.shaderSource(vShader, vShaderCode); // attach code to shader
            gl.compileShader(vShader); // compile the code for gpu execution

            if (!gl.getShaderParameter(fShader, gl.COMPILE_STATUS)) { // bad frag shader compile
                throw "error during fragment shader compile: " + gl.getShaderInfoLog(fShader);
                gl.deleteShader(fShader);
            } else if (!gl.getShaderParameter(vShader, gl.COMPILE_STATUS)) { // bad vertex shader compile
                throw "error during vertex shader compile: " + gl.getShaderInfoLog(vShader);
                gl.deleteShader(vShader);
            } else { // no compile errors
                this.shaderProgram = gl.createProgram(); // create the single shader program
                gl.attachShader(this.shaderProgram, fShader); // put frag shader in program
                gl.attachShader(this.shaderProgram, vShader); // put vertex shader in program
                gl.linkProgram(this.shaderProgram); // link program into gl context

                if (!gl.getProgramParameter(this.shaderProgram, gl.LINK_STATUS)) { // bad program link
                    throw "error during shader program linking: " + gl.getProgramInfoLog(this.shaderProgram);
                } else { // no shader program link errors
                    gl.useProgram(this.shaderProgram); // activate shader program (frag and vert)

                    // locate and enable vertex attributes
                    this.vPosAttribLoc = gl.getAttribLocation(this.shaderProgram, "aVertexPosition"); // ptr to vertex pos attrib
                    gl.enableVertexAttribArray(this.vPosAttribLoc); // connect attrib to array
                    //this.vNormAttribLoc = gl.getAttribLocation(this.shaderProgram, "aVertexNormal"); // ptr to vertex normal attrib
                    //gl.enableVertexAttribArray(this.vNormAttribLoc); // connect attrib to array

                    // locate vertex uniforms
                    this.mMatrixULoc = gl.getUniformLocation(this.shaderProgram, "umMatrix"); // ptr to mmat
                    this.pvmMatrixULoc = gl.getUniformLocation(this.shaderProgram, "upvmMatrix"); // ptr to pvmmat

                    // locate fragment uniforms
                    var eyePositionULoc = gl.getUniformLocation(this.shaderProgram, "uEyePosition"); // ptr to eye position
                    var lightAmbientULoc = gl.getUniformLocation(this.shaderProgram, "uLightAmbient"); // ptr to light ambient
                    var lightDiffuseULoc = gl.getUniformLocation(this.shaderProgram, "uLightDiffuse"); // ptr to light diffuse
                    var lightSpecularULoc = gl.getUniformLocation(this.shaderProgram, "uLightSpecular"); // ptr to light specular
                    var lightPositionULoc = gl.getUniformLocation(this.shaderProgram, "uLightPosition"); // ptr to light position
                    this.ambientULoc = gl.getUniformLocation(this.shaderProgram, "uAmbient"); // ptr to ambient
                    this.diffuseULoc = gl.getUniformLocation(this.shaderProgram, "uDiffuse"); // ptr to diffuse
                    this.specularULoc = gl.getUniformLocation(this.shaderProgram, "uSpecular"); // ptr to specular
                    this.shininessULoc = gl.getUniformLocation(this.shaderProgram, "uShininess"); // ptr to shininess

                    // texture locations
                    this.aTexCoordLoc = gl.getAttribLocation(this.shaderProgram, "aTexCoord");
                    gl.enableVertexAttribArray(this.aTexCoordLoc);
                    this.uSamplerLoc = gl.getUniformLocation(this.shaderProgram, "sampler");
                    this.uLightingLoc = gl.getUniformLocation(this.shaderProgram, "lightingMode");
                    this.uTransparentLoc = gl.getUniformLocation(this.shaderProgram, "transparencyRender");
                    gl.uniform1i(this.uSamplerLoc, 0);
                    gl.uniform1i(this.uLightingLoc, 0);
                    gl.uniform1i(this.uTransparentLoc, 1);

                    // pass global constants into fragment uniforms
                    gl.uniform3fv(eyePositionULoc, this.Eye); // pass in the eye's position
                    gl.uniform3fv(lightAmbientULoc, new Float32Array([0.0, 0.0, 0.0])); // pass in the light's ambient emission
                    gl.uniform3fv(lightDiffuseULoc, new Float32Array([0.0, 0.0, 0.0])); // pass in the light's diffuse emission
                    gl.uniform3fv(lightSpecularULoc, new Float32Array([0.0, 0.0, 0.0])); // pass in the light's specular emission
                    gl.uniform3fv(lightPositionULoc, new Float32Array([0.0, 0.0, 0.0])); // pass in the light's position
                } // end if no shader program link errors
            } // end if no compile errors
        } // end try 

        catch (e) {
            console.log(e);
        } // end catch

    }

    // changes the eye's position
    updateEye() {
        var eyePositionULoc = gl.getUniformLocation(this.shaderProgram, "uEyePosition"); // ptr to eye position
        gl.uniform3fv(eyePositionULoc, this.Eye);
    }

    /* Adds a new object to render. */
    addObject(obj) {
        this.objects.push(obj);
    }

    /* Removes an object from the renderer. */
    removeObject(obj) {
        var temp = this.objects.filter(function(object, index, array) {
            if (obj.id != object.id) {
                return true;
            }
            return false;
        });
        this.objects = temp;
    }

    /* Renders all of the objects */
    render() {

        // construct the model transform matrix, based on model state
        function makeModelTransform(currModel) {
            var zAxis = vec3.create(), sumRotation = mat4.create(), temp = mat4.create(), negCtr = vec3.create();

            // move the model to the origin
            mat4.fromTranslation(mMatrix, vec3.negate(negCtr, currModel.pos));

            // scale for highlighting if needed
            /*if (currModel.on)
                mat4.multiply(mMatrix, mat4.fromScaling(temp, vec3.fromValues(1.2, 1.2, 1.2)), mMatrix); // S(1.2) * T(-ctr)*/

            // rotate the model to current interactive orientation
            vec3.normalize(zAxis, vec3.cross(zAxis, currModel.xAxis, currModel.yAxis)); // get the new model z axis
            mat4.set(sumRotation, // get the composite rotation
                currModel.xAxis[0], currModel.yAxis[0], zAxis[0], 0,
                currModel.xAxis[1], currModel.yAxis[1], zAxis[1], 0,
                currModel.xAxis[2], currModel.yAxis[2], zAxis[2], 0,
                0, 0, 0, 1);
            mat4.multiply(mMatrix, sumRotation, mMatrix); // R(ax) * S(1.2) * T(-ctr)

            // translate back to model center
            mat4.multiply(mMatrix, mat4.fromTranslation(temp, currModel.pos), mMatrix); // T(ctr) * R(ax) * S(1.2) * T(-ctr)

            // translate model to current interactive orientation
            mat4.multiply(mMatrix, mat4.fromTranslation(temp, currModel.translation), mMatrix); // T(pos)*T(ctr)*R(ax)*S(1.2)*T(-ctr)

        } // end make model transform

        // var hMatrix = mat4.create(); // handedness matrix
        var pMatrix = mat4.create(); // projection matrix
        var vMatrix = mat4.create(); // view matrix
        var mMatrix = mat4.create(); // model matrix
        var pvMatrix = mat4.create(); // hand * proj * view matrices
        var pvmMatrix = mat4.create(); // hand * proj * view * model matrices

        window.requestAnimationFrame(this.__proto__.render.bind(this));
        //console.log("looping");

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        mat4.perspective(pMatrix, 0.5 * Math.PI, 1, 0.1, 10); // create projection matrix
        mat4.lookAt(vMatrix, this.Eye, this.Center, this.Up); // create view matrix
        mat4.multiply(pvMatrix, pvMatrix, pMatrix); // projection
        mat4.multiply(pvMatrix, pvMatrix, vMatrix); // projection * view

        // for each object
        for (var i = 0; i < this.objects.length; i++) {

            var currObj = this.objects[i];

            // make model transform, add to view project
            makeModelTransform(currObj);
            mat4.multiply(pvmMatrix, pvMatrix, mMatrix); // project * view * model
            gl.uniformMatrix4fv(this.mMatrixULoc, false, mMatrix); // pass in the m matrix
            gl.uniformMatrix4fv(this.pvmMatrixULoc, false, pvmMatrix); // pass in the hpvm matrix

            // reflectivity: feed to the fragment shader
            gl.uniform3fv(this.ambientULoc, currObj.material.ambient); // pass in the ambient reflectivity
            gl.uniform3fv(this.diffuseULoc, currObj.material.diffuse); // pass in the diffuse reflectivity
            gl.uniform3fv(this.specularULoc, currObj.material.specular); // pass in the specular reflectivity
            gl.uniform1f(this.shininessULoc, currObj.material.n); // pass in the specular exponent

            // vertex buffer: activate and feed into vertex shader
            gl.bindBuffer(gl.ARRAY_BUFFER, currObj.vertexBuffer); // activate
            gl.vertexAttribPointer(this.vPosAttribLoc, 3, gl.FLOAT, false, 0, 0); // feed
            //gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffers[whichTriSet]); // activate
            //gl.vertexAttribPointer(vNormAttribLoc, 3, gl.FLOAT, false, 0, 0); // feed

            // bind texture buffers
            gl.bindBuffer(gl.ARRAY_BUFFER, currObj.uvBuffer);
            //console.log(uvBuffers.length);
            gl.vertexAttribPointer(this.aTexCoordLoc, 2, gl.FLOAT, false, 0, 0);

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, currObj.textureBuffer);

            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,
                gl.RGBA, gl.UNSIGNED_BYTE, currObj.image_data);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

            //console.log(textureBuffers.length);
            //gl.uniform1i(this.uSamplerLoc, 0);
            //gl.uniform1i(this.uLightingLoc, lightingMode);

            // triangle buffer: activate and render
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, currObj.indexBuffer); // activate
            gl.drawElements(gl.TRIANGLES, currObj.indices.length, gl.UNSIGNED_SHORT, 0); // render

        }

    }

}