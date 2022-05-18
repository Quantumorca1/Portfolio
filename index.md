---
header:
   image_fullwidth: https://www.denofgeek.com/wp-content/uploads/2021/04/Pikachu.png?fit=1920%2C1080
   caption: funny image
---
<!--# Table of Contents

# Qualifications & Areas of Expertise

## Areas of Expertise
- Game Design -->

# Languages
- Java
- C++
- C#

# Samples

## Paper Pets
<iframe frameborder="0" src="https://itch.io/embed/1518623?bg_color=04091e&amp;fg_color=10f190&amp;link_color=3e2fff&amp;border_color=81ffb2" width="552" height="167"><a href="https://quantumorca1.itch.io/paper-pets">Paper Pets by Quantumorca1</a></iframe>

## AgriCoding

AgriCoding was a game I worked on with the North Carolinian non-profit organization Katabasis. Their mission is to promote outreach in Computer Science for underrepresented STEM demographics, namely agricultural children. AgriCoding seeks to introduce children to lightweight Computer Science topics such as looping and flow of control through our custom Block Based programming language, as well as illustrate how AI will have useful applications in the agricultural economy. 

Students program drones to handle actions on a farm. Their goal is to complete levels that will teach them new concepts and speed up their gameplay in the future.

The project has since been passed on to another team of developers and still continues to see improvements now! One of my roles on the project was to ensure ease of development for future teams.

[Click here to play!](https://quantumorca1.github.io/Portfolio/AgriCoding/)

This is a short demo of the game from my time working on it.

![agricoding demo](/images/nested looping.gif)

## Pinball for National Multiple Sclerosis Society

This was a pinball game I created with a partner as an introductory project for the National Multiple Sclerosis Society. It is designed to be a local two player game, to show how critical assisstance is to someone with MS. The game features things like tiles that fall out of the board (representing MS pain) and an occasionally rotating board (representing MS dizziness) to be symbolic of symptoms of Multiple Sclerosis. The job of the first player is just to control all 4 paddles using the E, F, I, and J keys. The second player should mouse over the tiles to heal them and rotate the board back to its original position.

[Video!](https://user-images.githubusercontent.com/7089585/154387843-a70708a8-0144-4be5-8a41-ca15319497d8.mp4)

<!--## iTrust2-->

## Game Engine

I created a Game Engine from nothing using SFML and ZMQ. The engine was networked and used a client/server model. It supported scripting as well with ECMAScript. Below are two different games I implemented using the engine.

A platformer game!

![platformer game](/images/game engine 1.gif)

A bubble shooter game!

![bubble game](/images/game engine 2.gif)

## Boid Pathfinding and Hunting AI

The goal of this project was to create an efficient AI decision tree that would hunt down and capture a target. The red boid pathfinds around the map to random locations. The green boid has a learned decision tree that developed a patrolling behavior, then a seek and capture behavior once the target is in range.

![green boid seeks red boid](/images/boid ai.gif)

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
