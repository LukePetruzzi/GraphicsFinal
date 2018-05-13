"use strict";

const W = 87;
const A = 65;
const S = 83;
const D = 68;

let player = new Player(0.0, 0.0, 0.0, 0.0);
let targetx;
let targety;
let particles = new Particles([]);
let timeSinceShot = 0;
let shotsPerSec = 5;

function setup() {
    createCanvas(windowWidth, windowHeight);

    frameRate(100);
    player = new Player(createVector(100, 100), createVector(floor(width / 2), floor(height / 2)), 50.0, color(255, 0, 0));
}

function draw() {
    background(255);
    let easing = 0.15;

    //let deltat = getDeltaTime();

    if (keyIsDown(UP_ARROW) || keyIsDown(W)) {
        targety = player.position.y - player.velocity.y;
    }
    if (keyIsDown(DOWN_ARROW) || keyIsDown(S)) {
        //player.position.y = player.position.y + player.velocity.y;
        targety = player.position.y + player.velocity.y;
    }
    if (keyIsDown(LEFT_ARROW) || keyIsDown(A)) {
        //player.position.x = player.position.x - player.velocity.x;
        targetx = player.position.x - player.velocity.x;
    }
    if (keyIsDown(RIGHT_ARROW) || keyIsDown(D)) {
        //player.position.x = player.position.x + player.velocity.x;
        targetx = player.position.x + player.velocity.x;
    }

    let dy = targety - player.position.y;
    let dx = targetx - player.position.x;

    if (abs(dy) > 1) {
        player.position.y += dy * easing;
    }
    if (abs(dx) > 1) {
        player.position.x += dx * easing;
    }

    if (mouseIsPressed) {
        if (timeSinceShot > 1 / shotsPerSec) {
            particles.addParticle(undefined, createVector(player.position.x, player.position.y), 5, color(255, 0, 0));
            timeSinceShot = 0;
        } 
    }
    particles.updateParticlePositions();
    particles.drawParticles();
    particles.deleteOldParticles();


    player.clamp();
    player.drawPlayer();
    timeSinceShot += getDeltaTime();
}

function Player(velocity, position, radius, color) {
    this.velocity = velocity;
    this.position = position;
    this.radius = radius;
    this.color = color;
}

Player.prototype.clamp = function () {
    if (player.position.x < 0) {
        player.position.x = 0;
    }
    if (player.position.y < 0) {
        player.position.y = 0;
    }
    if (player.position.x > width) {
        player.position.x = width;
    }
    if (player.position.y > height) {
        player.position.y = height;
    }
}

Player.prototype.drawPlayer = function () {
    fill(player.color);
    let x = player.position.x;
    let y = player.position.y;
    //print(player.radius);
    let wid = player.radius;
    let hei = player.radius;
    //print(x);
    ellipse(x, y, wid, hei);
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
        //velocity = getRandomOnCircle().mult(MAX_PARTICLE_SPEED);
        velocity = createVector(player.velocity.x*5, 0);
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

