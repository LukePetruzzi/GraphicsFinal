"use strict";

const W = 87;
const A = 65;
const S = 83;
const D = 68;


//let player = new Player(10, createVector(floor(width/2), floor(height/2)), 5, color(255, 0, 0));
// let this = new Player(10, createVector(10, 10), 5, color(255, 0, 0));

function Player(velocity, position, radius, color, easing) {
    this.velocity = velocity;
    this.position = position;
    this.radius = radius;
    this.color = color;
    this.easing = easing;
}

Player.prototype.move = function (p) {

    let targetx;
    let targety;


    if (p.keyIsDown(p.UP_ARROW) || p.keyIsDown(W)) {

        targety = this.position.y - this.velocity.y;
    }
    if (p.keyIsDown(p.DOWN_ARROW) || p.keyIsDown(S)) {

        //player.position.y = player.position.y + player.velocity.y;
        targety = this.position.y + this.velocity.y;
    }
    if (p.keyIsDown(p.LEFT_ARROW) || p.keyIsDown(A)) {

        //player.position.x = player.position.x - player.velocity.x;
        targetx = this.position.x - this.velocity.x;
    }
    if (p.keyIsDown(p.RIGHT_ARROW) || p.keyIsDown(D)) {

        //player.position.x = player.position.x + player.velocity.x;
        targetx = this.position.x + this.velocity.x;
    }

    let dy = targety - this.position.y;
    let dx = targetx - this.position.x;

    if (p.abs(dy) > 1) {
        this.position.y += dy * this.easing;
    }
    if (p.abs(dx) > 1) {
        this.position.x += dx * this.easing;
    }

    this.clamp(p);
    this.drawPlayer(p);
}

Player.prototype.clamp = function (p) {
    if (this.position.x <= 0 + this.radius) {
        this.position.x = 0 + this.radius;
    }
    if (this.position.y <= 0 + this.radius) {
        this.position.y = 0 + this.radius;
    }
    if (this.position.x > p.width - this.radius) {
        this.position.x = p.width - this.radius;
    }
    if (this.position.y > p.height - this.radius) {
        this.position.y = p.height - this.radius;
    }
}

Player.prototype.drawPlayer = function (p) {
    p.fill(this.color);
    p.ellipse(this.position.x, this.position.y, this.radius, this.radius);
}