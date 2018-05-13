"use strict";


// const p5 = new p5();

const LEVEL_ZOOMED_OUT = 300;
const CAM_SPEED = 20;

const HZ_LOW = 230;
const HZ_HI = 500;

const SPECTRUM_BAND_TOP = 70;
const SPECTRUM_BAND_BOTTOM = 15;

var buf = new Float32Array(1024);
var MIN_SAMPLES = 0;
var GOOD_ENOUGH_CORRELATION = 0.9;

var mic;
var fft;
var camPitch = 0;
var camYaw = 0;
let lastCamPosX = 0;
let lastCamPosY = 0

let circleWidth = 50;
let circleHeight = 50;
let circleFrequency = 0;
let circleVolume = 0;

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

    let freq = autoCorrelate(waveform, sampleRate());
    // console.log("freq: ", freq);
    if (freq != -1 && freq > HZ_LOW && freq < HZ_HI) {
        circleFrequency = map(freq, HZ_LOW, HZ_HI, 0, width);
        circleVolume = constrain(micLevel * height * 5, 0, height);

    }
    fill(255, 255, 255);
    ellipse(circleFrequency, circleVolume, circleWidth, circleHeight);


    // pickup creation and detection
    // var particle_dims = [circleFrequency, circleVolume, circleWidth];
    // var rand_dims = createPickup(); // creates and gets the informations about the particle randomly created

    // // collision detection
    // let coll = collisionDetected(particle_dims, rand_dims);
}



function normalize(val, min, max) {
    return (val - min) / (max - min);
}



function getFundamentalFrequency(spectrum) {
    let loudest = -1;
}
function autoCorrelate(buf, sampleRate) {
    var SIZE = buf.length;
    var MAX_SAMPLES = Math.floor(SIZE / 2);
    var best_offset = -1;
    var best_correlation = 0;
    var rms = 0;
    var foundGoodCorrelation = false;
    var correlations = new Array(MAX_SAMPLES);

    for (var i = 0; i < SIZE; i++) {
        var val = buf[i];
        rms += val * val;
    }
    rms = Math.sqrt(rms / SIZE);
    if (rms < 0.01) { // not enough signal
        // console.log("NOT ENOUGH SIGNAL");
        return -1;
    }

    var lastCorrelation = 1;
    for (var offset = MIN_SAMPLES; offset < MAX_SAMPLES; offset++) {
        var correlation = 0;

        for (var i = 0; i < MAX_SAMPLES; i++) {
            correlation += Math.abs((buf[i]) - (buf[i + offset]));
        }
        correlation = 1 - (correlation / MAX_SAMPLES);
        correlations[offset] = correlation; // store it, for the tweaking we need to do below.
        if ((correlation > GOOD_ENOUGH_CORRELATION) && (correlation > lastCorrelation)) {
            foundGoodCorrelation = true;
            if (correlation > best_correlation) {
                best_correlation = correlation;
                best_offset = offset;
            }
        } else if (foundGoodCorrelation) {
            // short-circuit - we found a good correlation, then a bad one, so we'd just be seeing copies from here.
            // Now we need to tweak the offset - by interpolating between the values to the left and right of the
            // best offset, and shifting it a bit.  This is complex, and HACKY in this code (happy to take PRs!) -
            // we need to do a curve fit on correlations[] around best_offset in order to better determine precise
            // (anti-aliased) offset.

            // we know best_offset >=1,
            // since foundGoodCorrelation cannot go to true until the second pass (offset=1), and
            // we can't drop into this clause until the following pass (else if).
            var shift = (correlations[best_offset + 1] - correlations[best_offset - 1]) / correlations[best_offset];
            return sampleRate / (best_offset + (8 * shift));
        }
        lastCorrelation = correlation;
    }
    if (best_correlation > 0.5) {
        // console.log("f = " + sampleRate / best_offset + "Hz (rms: " + rms + " confidence: " + best_correlation + ")")
        return sampleRate / best_offset;
    }
    return -1;
    //	var best_frequency = sampleRate/best_offset;
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



// Creates a particle every 500 frames of random sizes and at random locations
function createPickup() {

    fill(0, 255, 0);
    var dims = [];

    if (frameCount == 1 || frameCount % 500 == 0) {
        rand = Math.random() * 20;
        x = Math.random() * (width - 2 * rand) + rand;
        y = Math.random() * (height - 2 * rand) + rand;
        ellipse(x, y, rand * 8, rand * 8);
    }
    else {
        ellipse(x, y, rand * 8, rand * 8);
    }

    dims = [x, y, rand * 8];
    return dims;
}

function collisionDetected(particle_dims, rand_dims) {
    // https://stackoverflow.com/questions/1736734/circle-circle-collision
    var particle_x = particle_dims[0];
    var particle_y = particle_dims[1];
    var particle_radius = particle_dims[2] / 2;

    var rand_x = rand_dims[0];
    var rand_y = rand_dims[1];
    var rand_radius = rand_dims[2] / 2;


    var x_y = (rand_x - particle_x) * (rand_x - particle_x) + (particle_y - rand_y) * (particle_y - rand_y);
    var rads = (particle_radius + rand_radius) * (particle_radius + rand_radius);

    // detect a collision
    if (x_y <= rads) {
        // collision happened
        return true;
    }
    else {
        return false;
    }
}