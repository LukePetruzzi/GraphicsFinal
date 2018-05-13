"use strict";


//let player = new Player(10, createVector(floor(width/2), floor(height/2)), 5, color(255, 0, 0));
//let player = new Player(10, createVector(10, 10), 5, color(255, 0, 0));

let player = new Player(0.0, 0.0, 0.0, 0.0);
let targetx;
let targety;

function setup() {
    createCanvas(windowWidth, windowHeight);
    frameRate(100);
    player = new Player(createVector(100, 100), createVector(floor(width/2), floor(height/2)), 50.0, color(255, 0, 0));
}

function draw() {
    background(255);
    let easing = 0.15;

    //let deltat = getDeltaTime();

    if(keyIsDown(UP_ARROW)) {
        targety = player.position.y - player.velocity.y;
    }
    if(keyIsDown(DOWN_ARROW)) {
        //player.position.y = player.position.y + player.velocity.y;
        targety = player.position.y + player.velocity.y;
    }
    if(keyIsDown(LEFT_ARROW)) {
        //player.position.x = player.position.x - player.velocity.x;
        targetx = player.position.x - player.velocity.x;
    }
    if(keyIsDown(RIGHT_ARROW)) {
        //player.position.x = player.position.x + player.velocity.x;
        targetx = player.position.x + player.velocity.x;
    }

    let dy = targety - player.position.y;
    let dx = targetx - player.position.x;

    if(abs(dy) > 1) {
        player.position.y += dy * easing;
    }
    if(abs(dx) > 1) {
        player.position.x += dx * easing;
    }


    player.clamp();
    player.drawPlayer();
}
/*
function keyPressed() {
    if(keyIsDown(UP_ARROW)) {
        //player.position.y = player.position.y - player.velocity.y;
        //let dy = -1.0 * player.velocity.y;
        //player.position.y += dy * easing;
        //player.position.y = lerp(player.position.y, newp, deltat);
        //player.position.y = player.position.y - deltat*player.velocity.y;
        targety = player.position.y - player.velocity.y;
    }
    if(keyIsDown(DOWN_ARROW)) {
        //player.position.y = player.position.y + player.velocity.y;
        targety = player.position.y + player.velocity.y;
    }
    if(keyIsDown(LEFT_ARROW)) {
        //player.position.x = player.position.x - player.velocity.x;
        targetx = player.position.x - player.velocity.x;
    }
    if(keyIsDown(RIGHT_ARROW)) {
        //player.position.x = player.position.x + player.velocity.x;
        targetx = player.position.x + player.velocity.x;
    }
}*/

function Player(velocity, position, radius, color) {
    this.velocity = velocity;
    this.position = position;
    this.radius = radius;
    this.color = color;
}

Player.prototype.clamp = function() {
    if(player.position.x < 0) {
        player.position.x = 0;
    }
    if(player.position.y < 0) {
        player.position.y = 0;
    }
    if(player.position.x > width) {
        player.position.x = width;
    }
    if(player.position.y > height) {
        player.position.y = height;
    }
}

Player.prototype.drawPlayer = function() {
    fill(player.color);
    let x = player.position.x;
    let y = player.position.y;
    //print(player.radius);
    let wid = player.radius;
    let hei = player.radius;
    //print(x);
    ellipse(x, y, wid, hei);
}



function getDeltaTime() {
    return (1000 / frameRate()) / 1000;
}

