"use strict";


let particles = []


function setup() {
    createCanvas(windowWidth, windowHeight);
}

function draw() {
    background(0);

    if (mouseIsPressed) {
        addParticle(undefined, createVector(mouseX, mouseY), 5, color(255, 0, 0));
    }
    updateParticlePositions();
    drawParticles();
    deleteOldParticles();
}

function addParticle(velocity, position, radius, color) {
    let MAX_PARTICLE_SPEED = 150;
    // create random velocity if undefined

    if (velocity === undefined) {
        velocity = getRandomOnCircle().mult(MAX_PARTICLE_SPEED);
    }
    // create the particle
    let particle = {
        velocity: velocity,
        position: position,
        radius: radius,
        color: color
    }
    // add the particle
    particles.push(particle);
}

function updateParticlePositions() {
    for (let i = 0; i < particles.length; i++) {
        let particle = particles[i];

        let deltaTime = getDeltaTime();

        // d = (vi + vf / 2) + t
        let displacement = (p5.Vector.add(particle.velocity, particle.velocity).div(2)).mult(deltaTime);


        particles[i].position = particles[i].position.add(displacement);
    }
}

function drawParticles() {
    for (let i = 0; i < particles.length; i++) {
        let particle = particles[i];
        fill(particle.color);
        let x = particle.position.x;
        let y = particle.position.y;
        let wid = particle.radius;
        let hei = particle.radius;
        ellipse(x, y, wid, hei);
    }
}

function deleteOldParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        let particle = particles[i];
        if (particle.position.x > width || particle.position.x < 0 || particle.position.y > height || particle.position.y < 0) {
            particles.splice(i, 1);
        }
    }
}


// *~*~*~**~*~~**~*~*~*~*~*~*~*~**~*~*~

// returns time elapsed between frames, in seconds
function getDeltaTime() {
    return (1000 / frameRate()) / 1000;
}

function getRandomOnCircle() {
    var angle = Math.random() * Math.PI * 2;

    let x = Math.cos(angle);
    let y = Math.sin(angle);

    return createVector(x, y);


    // return (Math.random() * 2) - 1;
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
