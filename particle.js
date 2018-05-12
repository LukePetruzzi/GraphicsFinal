"use strict";

// let particles = new Particles([]);

// function setup() {
//     createCanvas(windowWidth, windowHeight);
// }

// function draw() {
//     background(0);

//     if (mouseIsPressed) {
//         particles.addParticle(undefined, createVector(mouseX, mouseY), 5, color(255, 0, 0));
//     }
//     particles.updateParticlePositions();
//     particles.drawParticles();
//     particles.deleteOldParticles();
// }

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

Particles.prototype.updateParticlePositions = function() {
    for (let i = 0; i < particles.array.length; i++) {
        let particle = particles.array[i];

        let deltaTime = getDeltaTime();

        // d = (vi + vf / 2) + t
        let displacement = (p5.Vector.add(particle.velocity, particle.velocity).div(2)).mult(deltaTime);

        particles.array[i].position = particles.array[i].position.add(displacement);
    }
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

