# Table of Contents

# Qualifications & Areas of Expertise

## Areas of Expertise
Game Design

## Languages
Java
C++
C#

# Works in Progress

# Samples

## AgriCoding

## Pinball for National Multiple Sclerosis Society

## iTrust2

## Game Engine

## Boid Pathfinding and Hunting AI

## Tetris WebGL Implementation

I created my own implementation of Tetris from scratch using WebGL and JavaScript. [You can play the game here!](https://quantumorca1.github.io/Portfolio/Tetris/) I wrote the shaders, created the graphics, and did the programming myself. Below is the shader I wrote.
```js
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
```


## Bee Garden

The goal with Bee Garden was to create a complete puzzle game with narrative elements. It also combines my love of entomology with my passion for game design. All mechanics are fully implemented. [You can play the game here!](https://quantumorca1.github.io/Portfolio/Bee%20Garden.html)
![first level of bee garden](/images/Bee Garden Level 1.png)

## Risk (Board Game) AI

I created a simplified version of the popular board game Risk that could be played between humans, AI, or any combination between. The goal was to create an AI sophisticated enough that it could defeat a human player in most circumstances, barring extremely poor luck. The AI is a utility-based agent that features efficient evaluations functions and weights for the different aspects of the game. The number of players are scalable. The AI almost always wins when it goes first.

**Risk AI vs. Human**

![ai v human](/images/Risk AI v Human.gif)

**This is a game between 4 AI players.**

![4 way ai](/images/Risk AI 2.gif)
