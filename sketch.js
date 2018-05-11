"use strict";


// const p5 = new p5();

const LEVEL_ZOOMED_OUT = 300;
const CAM_SPEED = 20;

const HZ_LOW = 100;
const HZ_HI = 500;

const SPECTRUM_BAND_TOP = 70;
const SPECTRUM_BAND_BOTTOM = 15;

var mic;
var fft;
var camPitch = 0;
var camYaw = 0;
let lastCamPosX = 0;
let lastCamPosY = 0

let circleWidth = 50;
let circleHeight = 50;

function setup() {
    createCanvas(windowWidth, windowHeight);

    // create mic with computer's default source
    mic = new p5.AudioIn()
    mic.setSource(0);
    mic.start();

    // get fft data
    fft = new p5.FFT();
    fft.setInput(mic);
}

function draw() {
    background(0);

    let micLevel = mic.getLevel();

    var spectrum = fft.analyze();

    noStroke();
    fill(0, 0, 255); // spectrum is blue
    for (let k = 0; k < SPECTRUM_BAND_TOP; k++) {


        var x = map(k, SPECTRUM_BAND_BOTTOM, SPECTRUM_BAND_TOP, 0, width);
        var h = -height + map(spectrum[k], 0, 255, height, 0);
        rect(x, height, width / SPECTRUM_BAND_TOP, h);
    }

    let fundamentalFreq = getFundamentalFrequency(spectrum);

    ellipse(width / 2, constrain(height - micLevel * height * 5, 0, height), circleWidth, circleHeight);


    var waveform = fft.waveform();
    noFill();
    beginShape();
    stroke(225, 0, 0);
    strokeWeight(1);
    for (let i = 0; i < waveform.length; i++) {
        var x = map(i, 0, waveform.length, 0, width);
        var y = map(waveform[i], -1, 1, 0, height);
        vertex(x, y)
    }
    endShape();
}
function normalize(val, min, max) {
    return (val - min) / (max - min);
}

function getFundamentalFrequency(spectrum) {
    let loudest = -1;

}

// function cameraPosition() {
//     // // only change camera position if the mouse is pressed
//     let posChangeX = 0;
//     let posChangeY = 0;
//     if (mouseIsPressed) {


//         posChangeX = mouseX - lastCamPosX;
//         posChangeY = mouseY - lastCamPosY;


//         // console.log("MOUSE X: ", mouseX);
//         // console.log("MOUSE Y: ", mouseY);
//         // camYaw += CAM_SPEED * mouseX;
//         // camPitch -= CAM_SPEED * mouseY;
//     }

//     // camera(0, 0, LEVEL_ZOOMED_OUT, 0, 0, 0, 0, -1, camPitch);
//     // rotate(20, [camPitch, 0, camYaw]);
//     lastCamPosX += posChangeX;
//     lastCamPosY += posChangeY;
//     rotate(20, [lastCamPosX, lastCamPosY, 0]);
// }