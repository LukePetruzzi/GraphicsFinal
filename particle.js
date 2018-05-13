"use strict";

// var button;
// let particles = new Particles([]);
// let enemies = new Particles([]);

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

//     if (frameCount == 1 || frameCount % 100 == 0) {
//         enemies.addEnemyParticle(undefined, undefined, 50, color(0, 0, 255));
//     }

//     enemies.updateEnemyPositions();
//     enemies.drawParticles();
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

Particles.prototype.addParticle = function (p, velocity, position, radius, color) {
    let MAX_PARTICLE_SPEED = 150;
    // create random velocity if undefined
    if (velocity === undefined) {
        velocity = getRandomOnCircle(p, 1).mult(MAX_PARTICLE_SPEED);
    }
    // create the particle
    let particle = new Particle(velocity, position, radius, color);
    // add the particle
    this.array.push(particle);
}

// Spawns enemy-particles on the right side of the frame every 100 frames that then move to the left at different speeds
Particles.prototype.addEnemyParticle = function (p, speed, velocity, position, radius, color) {
    let x; // x coordinate of velocity
    let y; // y coordinate of velocity
    let rand_height; // random y position on screen

    // give the enemy particle the maximum enemy particle speed if velocity is undefined
    if (velocity === undefined) {
        x = -speed;
        y = 0;
        velocity = p.createVector(x, y);
    }
    if (position === undefined) {
        rand_height = Math.random() * (p.height - radius) + radius / 2;
        position = p.createVector(p.width, rand_height);
    }
    // create the enemy particle
    let enemy_particle = new Particle(velocity, position, radius, color);
    // add the enemy particle
    this.array.push(enemy_particle);
}

Particles.prototype.updateParticlePositions = function (p) {
    for (let i = 0; i < this.array.length; i++) {
        let particle = this.array[i];

        let deltaTime = getDeltaTime(p);

        // d = (vi + vf / 2) + t
        let displacement = (p5.Vector.add(particle.velocity, particle.velocity).div(2)).mult(deltaTime);

        this.array[i].position = this.array[i].position.add(displacement);
    }
}

Particles.prototype.updateEnemyPositions = function (p) {
    for (let i = 0; i < this.array.length; i++) {

        let particle = this.array[i];

        let deltaTime = getDeltaTime(p);

        // d = (vi + vf / 2) + t
        let displacement = (p5.Vector.add(particle.velocity, particle.velocity).div(2)).mult(deltaTime);

        this.array[i].position = this.array[i].position.add(displacement);

        // check if a particle hit the left side of the screen, and then show a "Game Over" message
        // ***********+ CHANGE THIS SO ONLY ENEMY PARTICLES EXITING THE SCREEN ON THE LEFT CAUSE THIS ?? ***** or make sure the player can never exit the screen on the left <- probably the latter
        let enemy = this.array[i];
        let isHittingPlayer = (enemy.position.x < p.player.position.x + p.player.radius && 
            enemy.position.x > p.player.position.x - p.player.radius &&
            enemy.position.y < p.player.position.y + p.player.radius && 
            enemy.position.y > p.player.position.y - p.player.radius);
        if (this.array[i].position.x < 0 || isHittingPlayer) {
            p.fill(204, 101, 192, 127);
            let rectWidth = 220;
            let rectHeight = 100;
            p.rect(p.width / 2 - rectWidth/2, p.height / 2 - rectHeight/2, 220, 100); // this looks ugly we should gix
            p.button = p.createButton('GAME OVER LOSER');
            p.button.position(p.width / 2, p.height / 2);
            p.noLoop();
            this.killParticle(particle);
            // insert sad dying graphics by putting a sketch over the current thing?

            p.button.mousePressed(p.resetGame);
        }
    }
}

Particles.prototype.drawParticles = function (p) {
    for (let i = 0; i < this.array.length; i++) {
        let particle = this.array[i];

        p.fill(particle.color);
        let x = particle.position.x;
        let y = particle.position.y;
        let wid = particle.radius;
        let hei = particle.radius;
        p.ellipse(x, y, wid, hei);
    }
}

Particles.prototype.deleteOldParticles = function (p) {
    for (let i = this.array.length - 1; i >= 0; i--) {
        let particle = this.array[i];
        if (particle.position.x > p.width + particle.radius || particle.position.x < 0 - particle.radius || particle.position.y > p.height + particle.radius || particle.position.y < 0 - particle.radius) {
            this.array.splice(i, 1);
        }
    }
}

Particles.prototype.killParticle = function (part) {
    // find the index of the particle that should be killed
    let i = this.array.indexOf(part);
    this.array.splice(i, 1);
}

Particles.prototype.shoot = function(p, enemies) {
    for (let i = this.array.length - 1; i >= 0; i--) {
        for (let j = enemies.array.length - 1; j >= 0; j--) {
            let particle = this.array[i];
            let enemy = enemies.array[j];

            // check for intersection with enemy and shot. Delete both if collision
            if (particle.position.x < enemy.position.x + enemy.radius && 
                particle.position.x > enemy.position.x - enemy.radius &&
                particle.position.y < enemy.position.y + enemy.radius && 
                particle.position.y > enemy.position.y - enemy.radius) {
                    this.array.splice(i, 1);

                    spawnOnEnemy(p, enemies.array[j]);

                    enemies.array.splice(j, 1);
                }
        }
    }
}

Particles.prototype.changeColor = function(p, color) {
    for (let i = 0; i < this.array.length; i++) {
        this.array[i].color = color;
    }
}


// *~*~*~**~*~~**~*~ BEGIN PRIVATE HELPER METHODS *~*~*~*~*~*~**~*~*~

function spawnOnEnemy(p, enemy) {
    const ENEMY_DEATH_PARTICLE_COUNT = 50;
    const ENEMY_PARTICLE_RADIUS = 4;

    for (let i = 0; i < ENEMY_DEATH_PARTICLE_COUNT; i++) {
        p.deadEnemyParticles.addParticle(p, undefined, enemy.position.copy().add(getRandomOnCircle(p, enemy.radius)), ENEMY_PARTICLE_RADIUS, enemy.color);
    }
}

// returns time elapsed between frames, in seconds
function getDeltaTime(p) {
    return (1000 / p.frameRate()) / 1000;
}

function getRandomOnCircle(p, radius) {
    var angle = Math.random() * Math.PI * 2;

    let x = Math.cos(angle) * radius;
    let y = Math.sin(angle) * radius;

    return p.createVector(x, y);
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

