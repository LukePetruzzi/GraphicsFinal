"use strict";

const SKETCH_1_HEIGHT = 250;

// global detectors
// instanciation of onset and beat detection from fft
// low band : 40Hz-120Hz
let onsetLow = new OnsetDetect(40, 120, "bass", 0.025);
let beatLow = new BeatDetect(40, 120, "bass", 0.95);
// lowMid band : 140Hz-400Hz
let onsetLowMid = new OnsetDetect(140, 400, "lowMid", 0.025);
let beatLowMid = new BeatDetect(140, 400, "lowMid", 0.80);
// mid band : 400Hz-2.6kHz
let onsetMid = new OnsetDetect(400, 2600, "mid", 0.025);
let beatMid = new BeatDetect(400, 2600, "mid", 0.6);


// ***~*~*~*~*~*~*~*~*~*~*~*~ BEGIN SKETCHES **~*~*~*~*~*~*~*~**~*~*~*~*~**~
// sketch 1 
var sketch1 = function (p) {

    p.file = 'amilli.mp3'
    p.source_file; // sound file
    p.src_length; // hold its duration
    p.fft;

    p.pg; // to draw waveform

    p.playing = false;
    p.button;

    console.log("STUFF");


    p.preload = function () {
        console.log("FINALLY INSIDE PRELOAD");

        p.source_file = p.loadSound(p.file); // preload the sound
    };

    p.setup = function () {
        console.log("FINALLY INSIDE SETUP");

        p.createCanvas(p.windowWidth, SKETCH_1_HEIGHT);
        p.textAlign(p.CENTER);

        p.src_length = p.source_file.duration();
        p.source_file.playMode('restart');
        console.log("source duration: ", p.src_length);

        // draw the waveform to an off-screen graphic
        let peaks = p.source_file.getPeaks([600]); // get an array of peaks
        p.pg = p.createGraphics(p.width, 150);
        p.pg.background(100);
        p.pg.translate(0, 75);
        p.pg.noFill();
        p.pg.stroke(0);
        for (let i = 0; i < peaks.length; i++) {
            let x = p.map(i, 0, peaks.length, 0, p.width);
            let y = p.map(peaks[i], 0, 1, 0, 150);
            p.pg.line(x, 0, x, y);
            p.pg.line(x, 0, x, -y);
        }

        // FFT
        p.fft = new p5.FFT();

        // gui
        p.button = p.createButton('play');
        p.button.position(3, 3);
        p.button.mousePressed(p.play);
    };


    p.draw = function () {
        p.background(180);

        p.image(p.pg, 0, 100); // display our waveform representation

        // draw playhead position 
        p.fill(255, 255, 180, 150);
        p.noStroke();
        p.rect(p.map(p.source_file.currentTime(), 0, p.src_length, 0, p.windowWidth), 100, 3, 150);
        //display current time
        p.text("current time: " + p.nfc(p.source_file.currentTime(), 1) + " s", 60, 50);

        // we need to call fft.analyse() before the update functions of our class
        // this is because we use the getEnergy method inside our class.
        let spectrum = p.fft.analyze();

        // display and update our detector objects
        p.text("onset detection", 350, 15);
        p.text("amplitude treshold", 750, 15);

        onsetLow.display(p, 250, 50);
        onsetLow.update(p, p.fft);

        beatLow.display(p, 650, 50);
        beatLow.update(p, p.fft);

        onsetLowMid.display(p, 350, 50);
        onsetLowMid.update(p, p.fft);

        beatLowMid.display(p, 750, 50);
        beatLowMid.update(p, p.fft);

        onsetMid.display(p, 450, 50);
        onsetMid.update(p, p.fft);

        beatMid.display(p, 850, 50);
        beatMid.update(p, p.fft);

        if (p.source_file.currentTime() >= p.src_length - 0.05) {
            p.source_file.pause();
        }
    };



    p.mouseClicked = function () {
        if (p.mouseY > 100 && p.mouseY < 350) {
            let mapper = p.map(p.mouseX, 0, p.windowWidth, 0, p.src_length);
            let playpos = p.constrain(mapper, 0, p.src_length);
            p.source_file.play();
            p.source_file.play(0, 1, 1, playpos, p.src_length);
            p.playing = true;
            p.button.html('pause');
        }
        return false;//callback for p5js
    }

    p.keyTyped = function () {
        if (p.key == ' ') {
            p.play();
        }
        return false; // callback for p5js
    }

    p.play = function () {
        if (p.playing) {
            p.source_file.pause();
            p.button.html('play');
            p.playing = false;
        }
        else {
            p.source_file.play();
            p.button.html('pause');
            p.playing = true;
        }
    }
};
// give the id of the html div as the second parameter
var mySketch1 = new p5(sketch1, "sketch1");


// sketch 2 -> main game
var sketch2 = function (p) {
    const PLAYER_VELOCITY = 150;
    const PLAYER_EASING = 0.05;
    const COLOR_CHANGE_SENSITIVITY = 500;
    const ENEMY_PARTICLE_SPEED = 500;
    // in milliseconds
    const SHOOT_DELAY = 250;
    const SHOT_SPEED = 500;

    p.button;
    p.backgroundColor = p.color(0);
    p.changingColor = false;

    // particles and enemies
    p.particles = new Particles([]);
    p.enemies = new Particles([]);

    p.player = new Player(p.createVector(PLAYER_VELOCITY, PLAYER_VELOCITY), p.createVector(p.floor(p.width / 2), p.floor(p.height / 2)), 50.0, p.color(255, 255, 255), PLAYER_EASING);


    // SETUP FUNCTION
    p.setup = function () {
        p.createCanvas(p.windowWidth, p.windowHeight);
    };

    // DRAW FUNCTINO
    p.draw = function () {
        p.background(p.backgroundColor);

        // particles
        if (p.mouseIsPressed && p.player.canShoot) {
            p.particles.addParticle(p, p.createVector(SHOT_SPEED, 0), p.createVector(p.player.position.x, p.player.position.y), 5, p.color(255, 0, 0));

            // wait until can change color again
            p.player.canShoot = false;
            setTimeout(function () {
                p.player.canShoot = true;
            }, SHOOT_DELAY);
        }
        p.particles.updateParticlePositions(p);
        p.particles.drawParticles(p);
        p.particles.deleteOldParticles(p);

        // beat detection
        if (beatLow.isDetected && !p.changingColor) {
            p.backgroundColor = p.color(Math.random() * 255, Math.random() * 255, Math.random() * 255);
            p.background(p.backgroundColor);

            // wait until can change color again
            p.changingColor = true;
            setTimeout(function () {
                p.changingColor = false;
            }, COLOR_CHANGE_SENSITIVITY);
        }

        // enemies
        if (p.frameCount == 1 || p.frameCount % 100 == 0) {
            p.enemies.addEnemyParticle(p, ENEMY_PARTICLE_SPEED, undefined, undefined, 50, p.color(0, 0, 255));
        }
        p.enemies.updateEnemyPositions(p);
        p.enemies.drawParticles(p);

        // player
        p.player.move(p);
    };

    p.resetGame = function () {
        p.particles = new Particles([]);
        p.enemies = new Particles([]);

        p.player.canShoot = true;

        // reset the game
        p.loop();
        p.button.hide();
    };
};
var mySketch2 = new p5(sketch2, "sketch2");


// ***~*~*~*~*~*~*~*~*~*~*~*~ END SKETCHES **~*~*~*~*~*~*~*~**~*~*~*~**~

function OnsetDetect(f1, f2, str, thresh) {
    this.isDetected = false;
    // f1 and f2 are the low and high frequencies for this detection band
    this.f1 = f1;
    this.f2 = f2;
    // str is the string for the band... like "bass", or "mid"
    this.str = str;
    // threshold is the threshold to trigger a detection. energy - penergy
    this.treshold = thresh;
    // energy is current energy, penergy is the energy on the previous frame
    this.energy = 0;
    this.penergy = 0;
    this.siz = 10;
    this.sensitivity = 400;
}

OnsetDetect.prototype.display = function (p, x, y) {

    if (this.isDetected == true) {
        this.siz = p.lerp(this.siz, 40, 0.99);
    }
    else if (this.isDetected == false) {
        this.siz = p.lerp(this.siz, 15, 0.99);
    }
    p.fill(255, 0, 0);
    p.ellipse(x, y, this.siz, this.siz);
    p.fill(0);
    p.text(this.str, x, y);
    p.text("( " + this.f1 + " - " + this.f2 + "Hz )", x, y + 10);
}

OnsetDetect.prototype.update = function (p, fftObject) {
    this.energy = fftObject.getEnergy(this.f1, this.f2) / 255;

    if (this.isDetected == false) {
        if (this.energy - this.penergy > this.treshold) {
            this.isDetected = true;
            let self = this;
            setTimeout(function () {
                self.isDetected = false;
            }, this.sensitivity);
        }
    }

    this.penergy = this.energy;
}


function BeatDetect(f1, f2, str, thresh) {
    this.isDetected = false;
    this.f1 = f1;
    this.f2 = f2;
    this.str = str;
    this.treshold = thresh;
    this.energy = 0;

    this.siz = 10;
    this.sensitivity = 500;
}

BeatDetect.prototype.display = function (p, x, y) {

    if (this.isDetected == true) {
        this.siz = p.lerp(this.siz, 40, 0.99);
    }
    else if (this.isDetected == false) {
        this.siz = p.lerp(this.siz, 15, 0.99);
    }
    p.fill(255, 0, 0);
    p.ellipse(x, y, this.siz, this.siz);
    p.fill(0);
    p.text(this.str, x, y);
    p.text("( " + this.f1 + " - " + this.f2 + "Hz )", x, y + 10);
}

BeatDetect.prototype.update = function (p, fftObject) {
    this.energy = fftObject.getEnergy(this.f1, this.f2) / 255;

    if (this.isDetected == false) {
        if (this.energy > this.treshold) {
            this.isDetected = true;
            let self = this;
            setTimeout(function () {
                self.isDetected = false;
            }, this.sensitivity);
        }
    }
}

BeatDetect.prototype.update = function (p, fftObject) {
    this.energy = fftObject.getEnergy(this.f1, this.f2) / 255;

    if (this.isDetected == false) {
        if (this.energy > this.treshold) {
            this.isDetected = true;
            let self = this;
            setTimeout(function () {
                self.isDetected = false;
            }, this.sensitivity);
        }
    }
}