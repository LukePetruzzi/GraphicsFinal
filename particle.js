"use strict";

var button;
let particles = new Particles([]);

function setup() {
    createCanvas(windowWidth, windowHeight);
}

function draw() {
    background(0);

    if (mouseIsPressed) {
        particles.addParticle(undefined, createVector(mouseX, mouseY), 5, color(255, 0, 0));
    }
    particles.updateParticlePositions();
    particles.drawParticles();
    particles.deleteOldParticles();

    if (frameCount == 1 || frameCount % 100 == 0) {
        particles.addEnemyParticle(undefined, undefined, 50, color(0, 0, 255));
    }
    
}

function Particle(velocity, position, radius, color) {
    this.velocity = velocity;
    this.position = position;
    this.radius = radius;
    this.color = color;
}

function Particles(array) {
    this.array = array;
}

Particles.prototype.addParticle = function(velocity, position, radius, color) {
    let MAX_PARTICLE_SPEED = 150;
    // create random velocity if undefined
    if (velocity === undefined) {
        velocity = getRandomOnCircle().mult(MAX_PARTICLE_SPEED);
    }
    // create the particle
    let particle = new Particle(velocity, position, radius, color);
    // add the particle
    particles.array.push(particle);
}

// Spawns enemy-particles on the right side of the frame every 100 frames that then move to the left at different speeds
Particles.prototype.addEnemyParticle = function(velocity, position, radius, color) {
    let MAX_ENEMY_PARTICLE_SPEED = 1000; // maximum speed of particle
    let x; // x coordinate of velocity
    let y; // y coordinate of velocity
    let rand_height; // random y position on screen

    // give the enemy particle the maximum enemy particle speed if velocity is undefined
    if (velocity === undefined) {
        x = -MAX_ENEMY_PARTICLE_SPEED;
        y = 0;
        velocity = createVector(x, y);
    }
    if (position === undefined) {
        rand_height = Math.random() * (height - radius) + radius/2;
        position = createVector(width, rand_height);
    }
    // create the enemy particle
    let enemy_particle = new Particle(velocity, position, radius, color);
    // add the enemy particle
    particles.array.push(enemy_particle);
}

Particles.prototype.updateParticlePositions = function() {
    for (let i = 0; i < particles.array.length; i++) {
        let particle = particles.array[i];

        let deltaTime = getDeltaTime();

        // d = (vi + vf / 2) + t
        let displacement = (p5.Vector.add(particle.velocity, particle.velocity).div(2)).mult(deltaTime);

        particles.array[i].position = particles.array[i].position.add(displacement);

        // check if a particle hit the left side of the screen, and then show a "Game Over" message
        // ***********+ CHANGE THIS SO ONLY ENEMY PARTICLES EXITING THE SCREEN ON THE LEFT CAUSE THIS ?? ***** or make sure the player can never exit the screen on the left <- probably the latter
        if (particles.array[i].position.x < 0) {
            fill(204, 101, 192, 127);
            rect(width/2-57, height/2-60, 220, 100); // this looks ugly we should gix
            button = createButton('GAME OVER LOSER');
            button.position(width/2, height/2);
            // insert sad dying graphics by putting a sketch over the current thing?
            button.mousePressed(resetGame);
        }
    }
}

function resetGame() {
    // reset the game
}

Particles.prototype.drawParticles = function() {
    for (let i = 0; i < particles.array.length; i++) {
        let particle = particles.array[i];

        fill(particle.color);
        let x = particle.position.x;
        let y = particle.position.y;
        let wid = particle.radius;
        let hei = particle.radius;
        ellipse(x, y, wid, hei);
    }
}

Particles.prototype.deleteOldParticles = function() {
    for (let i = particles.array.length - 1; i >= 0; i--) {
        let particle = particles.array[i];
        if (particle.position.x > width || particle.position.x < 0 || particle.position.y > height || particle.position.y < 0) {
            particles.array.splice(i, 1);
        }
    }
}


// *~*~*~**~*~~**~*~ BEGIN PRIVATE HELPER METHODS *~*~*~*~*~*~**~*~*~

// returns time elapsed between frames, in seconds
function getDeltaTime() {
    return (1000 / frameRate()) / 1000;
}

function getRandomOnCircle() {
    var angle = Math.random() * Math.PI * 2;

    let x = Math.cos(angle);
    let y = Math.sin(angle);

    return createVector(x, y);
}

function keepAboveThreshold(value, negThreshold, posThreshold) {
    if (value < 0 && value > negThreshold) {
        value = negThreshold;
    }
    if (value > 0 && value < posThreshold) {
        value = posThreshold;
    }

    return value;
}

// *~*~*~**~*~~**~*~ END PRIVATE HELPER METHODS *~*~*~*~*~*~**~*~*~

