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

function Particle(velocity, position, radius, color, shape, rotation) {
    this.velocity = velocity;
    this.position = position;
    this.radius = radius;
    this.color = color;
    this.shape = shape;
    this.rotation = rotation;
}

function Particles(array) {
    this.array = array;
}

Particles.prototype.addParticle = function (p, velocity, position, radius, color, shape, rotation) {
    let MAX_PARTICLE_SPEED = 150;
    // create random velocity if undefined
    if (velocity === undefined) {
        velocity = getRandomOnCircle(p, 1).mult(MAX_PARTICLE_SPEED);
    }
    // create the particle
    let particle = new Particle(velocity, position, radius, color, shape, rotation);
    // add the particle
    this.array.push(particle);
}

// Spawns enemy-particles on the right side of the frame every 100 frames that then move to the left at different speeds
Particles.prototype.addEnemyParticle = function (p, speed, velocity, position, radius, color, shape, rotation) {
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
    let enemy_particle = new Particle(velocity, position, radius, color, shape, rotation);
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
            p.noLoop();
            this.killParticle(particle);
            // insert sad dying graphics by putting a sketch over the current thing?
            p.resetGame();
        }
    }
}

Particles.prototype.updateWebEnemyPositions = function (p) {
    let minX = 1000000;
    let maxX = -1000000;
    let minY = 1000000;
    let maxY = -1000000;
    
    for (let i = this.array.length - 1; i >= 0; i--) {
        let particle = this.array[i];
        // update min and max positions
        if (particle.position.x < minX) minX = particle.position.x;
        if (particle.position.x > maxX) maxX = particle.position.x;
        if (particle.position.y < minY) minY = particle.position.y;
        if (particle.position.y > maxY) maxY = particle.position.y;

        let deltaTime = getDeltaTime(p);

        // d = (vi + vf / 2) + t
        let displacement = (p5.Vector.add(particle.velocity, particle.velocity).div(2)).mult(deltaTime);

        this.array[i].position = this.array[i].position.add(displacement);

        // check if a particle hit the left side of the screen, and then show a "Game Over" message
        // ***********+ CHANGE THIS SO ONLY ENEMY PARTICLES EXITING THE SCREEN ON THE LEFT CAUSE THIS ?? ***** or make sure the player can never exit the screen on the left <- probably the latter
        if (particle.position.x < 0) {
            p.noLoop();
            this.killParticle(particle);
            // insert sad dying graphics by putting a sketch over the current thing?

            p.resetGame();
            return;
        }

        if (particle.position.y > p.height - particle.radius|| particle.position.y < 0 + particle.radius) {
            let newVel = particle.velocity.copy();
            newVel.y = -newVel.y;
            particle.velocity = newVel;
        }

        let isSurroundingPlayer = (p.player.position.x > minX &&
            p.player.position.x < maxX &&
            p.player.position.y > minY &&
            p.player.position.y < maxY);
        if (isSurroundingPlayer) {
            p.noLoop();
            this.killParticle(particle);
            // insert sad dying graphics by putting a sketch over the current thing?
            p.resetGame();
            return;
        }
    }
}

Particles.prototype.drawWebParticles = function(p) {
    // draw particles and then connect the closest ones with a line
    p.stroke(255);
    for (let i = 0; i < this.array.length; i++) {
        let current = this.array[i];
        for (let j = i + 1; j < this.array.length; j++) {
            let other = this.array[j];
            p.line(current.position.x, current.position.y, other.position.x, other.position.y);
        }
    }
    p.stroke(0);
    this.drawParticles(p);
}

Particles.prototype.drawParticles = function (p) {
    for (let i = 0; i < this.array.length; i++) {
        let particle = this.array[i];

        p.fill(particle.color);

        if (particle.shape == p.CIRCLE) {
            let x = particle.position.x;
            let y = particle.position.y;
            let wid = particle.radius;
            let hei = particle.radius;
            p.ellipse(x, y, wid, hei);
        }
        else if (particle.shape == p.TRIANGLE) {
            p.push();
            let rot = particle.rotation;
            let h = particle.radius;

            p.translate(particle.position.x, particle.position.y);
            p.rotate(p.frameCount / (rot*30));
            p.triangle(0, h, -h, -h, h, -h);

            p.pop();
        }
        else if (particle.shape == p.BULLET) {
            let x = particle.position.x;
            let y = particle.position.y;
            let wid = particle.radius * 3;
            let hei = particle.radius;
            p.ellipse(x, y, wid, hei);
        }

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
    let enemiesToDelete = [];
    for (let i = this.array.length - 1; i >= 0; i--) {

        for (let j = enemies.array.length - 1; j >= 0; j--) {
            let particle = this.array[i];
            let enemy = enemies.array[j];

            // check for intersection with enemy and shot. Delete both if collision

            if (particle === undefined) {
                continue;
            }
            if (particle.position.x < enemy.position.x + enemy.radius && 
                particle.position.x > enemy.position.x - enemy.radius &&
                particle.position.y < enemy.position.y + enemy.radius && 
                particle.position.y > enemy.position.y - enemy.radius) {
                    
                    this.array.splice(i, 1);

                    spawnOnEnemy(p, enemies.array[j]);

                    enemiesToDelete.push(j);
                }
        }
    }
    for (let i = enemies.array.length - 1; i >= 0; i--) {
        let enemy = enemies.array[i];
        if (enemiesToDelete.includes(i)) {
            enemies.array.splice(i, 1);
        }
    }
}

Particles.prototype.shootWebbies = function(p, enemies) {
    let enemiesToDelete = [];
    for (let i = this.array.length - 1; i >= 0; i--) {

        for (let j = enemies.array.length - 1; j >= 0; j--) {
            let particle = this.array[i];
            let enemy = enemies.array[j];

            // check for intersection with enemy and shot. Delete both if collision

            if (particle === undefined) {
                continue;
            }
            if (particle.position.x < enemy.position.x + enemy.radius && 
                particle.position.x > enemy.position.x - enemy.radius &&
                particle.position.y < enemy.position.y + enemy.radius && 
                particle.position.y > enemy.position.y - enemy.radius) {
                    
                    this.array.splice(i, 1);

                    spawnTrianglesOnEnemy(p, enemies.array[j]);

                    enemiesToDelete.push(j);
                }
        }
    }
    for (let i = enemies.array.length - 1; i >= 0; i--) {
        let enemy = enemies.array[i];
        if (enemiesToDelete.includes(i)) {
            enemies.array.splice(i, 1);
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
    const ENEMY_DEATH_PARTICLE_COUNT = 70;
    const ENEMY_PARTICLE_RADIUS = 2;

    for (let i = 0; i < ENEMY_DEATH_PARTICLE_COUNT; i++) {
        p.deadEnemyParticles.addParticle(p, undefined, enemy.position.copy().add(getRandomOnCircle(p, enemy.radius)), Math.random() * ENEMY_PARTICLE_RADIUS + 2, enemy.color, p.CIRCLE, 0);
    }
}

function spawnTrianglesOnEnemy(p, enemy) {
    const ENEMY_DEATH_PARTICLE_COUNT = 30;
    const ENEMY_PARTICLE_RADIUS = 2;

    for (let i = 0; i < ENEMY_DEATH_PARTICLE_COUNT; i++) {
        p.deadEnemyParticles.addParticle(p, undefined, enemy.position.copy().add(getRandomOnCircle(p, enemy.radius)), Math.random() * ENEMY_PARTICLE_RADIUS + 1, enemy.color, p.TRIANGLE, Math.random());
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

