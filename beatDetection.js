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

let isInGame = true;


// ***~*~*~*~*~*~*~*~*~*~*~*~ BEGIN SKETCHES **~*~*~*~*~*~*~*~**~*~*~*~*~**~
// sketch 1 
var sketch1 = function (p) {

    p.file = 'astral.mp3'
    p.source_file; // sound file
    p.src_length; // hold its duration
    p.fft;

    p.pg; // to draw waveform

    p.playing = false;
    p.button;


    p.preload = function () {
        p.source_file = p.loadSound(p.file); // preload the sound
    };

    p.setup = function () {
        p.createCanvas(p.windowWidth, SKETCH_1_HEIGHT);
        p.textAlign(p.CENTER);

        p.src_length = p.source_file.duration();
        p.source_file.playMode('restart');

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
    p.CIRCLE = 0;
    p.TRIANGLE = 1;
    p.BULLET = 2;
    p.SQUARE = 3;

    const PLAYER_VELOCITY = 150;
    const PLAYER_EASING = 0.05;
    const BACKGROUND_COLOR_CHANGE_SENSITIVITY = 500;
    const ENEMY_COLOR_CHANGE_SENSITIVITY = 400;
    const ENEMY_PARTICLE_SPEED = 400;
    const ENEMY_SPAWN_RATE = 200
    const WEB_ENEMY_SIZE = 15;
    const WEB_ENEMY_Y_VEL_VARIANCE = 80;
    const WEB_ENEMY_SPEED = 80;
    const WEB_ENEMY_SPAWN_RATE = 400;
    const WEB_ENEMY_VARIANCE = 100;
    const SQUARE_ENEMY_SPAWN_RATE = 500;
    const SQUARE_ENEMY_SPEED = 40;
    const SQUARE_ENEMY_SIZE = 30;
    // in milliseconds
    const SHOOT_DELAY = 250;
    const SHOT_SPEED = 500;

    p.blurTime = 0;
    p.isFadingBlur = false;

    // particles and enemies
    p.shots = new Particles([]);
    p.deadEnemyParticles = new Particles([]);
    p.enemies = new Particles([]);
    p.squareEnemies = new Particles([]);
    p.webEnemies = [];

    p.player = new Player(p.createVector(PLAYER_VELOCITY, PLAYER_VELOCITY), p.createVector(p.floor(p.width / 2), p.floor(p.height / 2)), 50.0, p.color(255, 255, 255), PLAYER_EASING);

    let img;
    p.preload = function () {
        img = p.loadImage("124conch.png");
    }
    // SETUP FUNCTION
    p.setup = function () {
        p.createCanvas(p.windowWidth, p.windowHeight - SKETCH_1_HEIGHT);
        p.image(img, 0, 0);
    };

    // DRAW FUNCTINO
    p.draw = function () {
        p.background(img);

        // shooting mechanic
        if (p.mouseIsPressed && p.player.canShoot) {
            p.shots.addParticle(p, p.createVector(SHOT_SPEED, 0), p.createVector(p.player.position.x + p.player.radius / 2, p.player.position.y), 5, p.color(255, 0, 0), p.BULLET, 0);

            // wait until can change color again
            p.player.canShoot = false;
            setTimeout(function () {
                p.player.canShoot = true;
            }, SHOOT_DELAY);
        }
        p.shots.updateParticlePositions(p);
        p.shots.drawParticles(p);
        p.shots.shoot(p, p.enemies);
        p.shots.deleteOldParticles(p);

        // dead enemy particles
        p.deadEnemyParticles.updateParticlePositions(p);
        p.noStroke();
        p.deadEnemyParticles.drawParticles(p);
        p.stroke(0);
        p.deadEnemyParticles.deleteOldParticles(p);


        // beat detection
        // lows
        let elem = document.querySelectorAll("canvas");

        if (beatLow.isDetected) {
            if (!p.isFadingBlur) {
                for (let el of elem) {
                    el.style.filter = "hue-rotate(180deg)";
                }
                p.isFadingBlur = true;
                p.blurTime = 180;
            }
        }
        if (p.isFadingBlur) {
            p.blurTime -= 4;

            for (let el of elem) {
                // el.classList.remove("hue-rotate");
                el.style.filter = "hue-rotate(" + p.blurTime + "deg)";
            }
            if (p.blurTime == 0) {
                for (let el of elem) {
                    el.classList.remove("hue-rotate");
                }
                p.isFadingBlur = false;
            }
        }

        // mids
        if (beatMid.isDetected && !p.changingEnemyColor) {
            let enemyColor = p.color(Math.random() * 255, Math.random() * 255, Math.random() * 255);
            p.enemies.changeColor(p, enemyColor);
            enemyColor = p.color(Math.random() * 255, Math.random() * 255, Math.random() * 255);
            p.squareEnemies.changeColor(p, enemyColor);

            // wait until can change color again
            p.changingEnemyColor = true;
            setTimeout(function () {
                p.changingEnemyColor = false;
            }, ENEMY_COLOR_CHANGE_SENSITIVITY);
        }
        // low mids
        if (beatLowMid.isDetected && !p.changingWebColor) {
            let enemyColor = p.color(Math.random() * 255, Math.random() * 255, Math.random() * 255);

            for (let i = 0; i < p.webEnemies.length; i++) {
                let webParticles = p.webEnemies[i];
                webParticles.changeColor(p, enemyColor);
            }

            // wait until can change color again
            p.changingWebColor = true;
            setTimeout(function () {
                p.changingWebColor = false;
            }, ENEMY_COLOR_CHANGE_SENSITIVITY);
        }

        // enemies
        if (p.frameCount % ENEMY_SPAWN_RATE == 0) {
            p.enemies.addEnemyParticle(p, ENEMY_PARTICLE_SPEED, undefined, undefined, 50, p.color(0, 0, 255), p.CIRCLE, 0);
        }
        p.enemies.updateEnemyPositions(p);
        p.enemies.drawParticles(p);

        // web enemies
        if (p.frameCount % WEB_ENEMY_SPAWN_RATE == 0) {
            let newParticles = new Particles([]);
            let seedHeight = Math.random() * (p.height - WEB_ENEMY_SIZE - WEB_ENEMY_VARIANCE) + WEB_ENEMY_SIZE + WEB_ENEMY_VARIANCE;

            for (let i = 0; i < 5; i++) {
                let x = -WEB_ENEMY_SPEED;
                let y = ((Math.random() * 2) - 1) * WEB_ENEMY_Y_VEL_VARIANCE;
                let velocity = p.createVector(x, y);

                newParticles.addEnemyParticle(p, WEB_ENEMY_SPEED, velocity, getRandomSpawnPositionAroundSeed(p, WEB_ENEMY_SIZE, seedHeight, WEB_ENEMY_VARIANCE), WEB_ENEMY_SIZE, p.color(0, 0, 255), p.TRIANGLE, 1);
            }
            p.webEnemies.push(newParticles);
        }
        for (let i = 0; i < p.webEnemies.length; i++) {
            let webParticles = p.webEnemies[i];
            webParticles.updateWebEnemyPositions(p);
            webParticles.drawWebParticles(p);
        }
        for (let i = 0; i < p.webEnemies.length; i++) {
            let webParticles = p.webEnemies[i];
            p.shots.shootWebbies(p, webParticles);
        }

        // square enemies
        if (p.frameCount % SQUARE_ENEMY_SPAWN_RATE == 0) {
            p.squareEnemies.addEnemyParticle(p, SQUARE_ENEMY_SPEED, undefined, undefined, 100, p.color(0, 0, 255), p.SQUARE, 0);
        }
        p.squareEnemies.updateEnemyPositions(p);
        p.squareEnemies.drawParticles(p);
        p.shots.shootSquare(p, p.squareEnemies);

        // player
        p.player.move(p);
    };

    p.resetGame = function () {
        p.shots = new Particles([]);
        p.deadEnemyParticles = new Particles([]);
        p.enemies = new Particles([]);
        p.webEnemies = undefined;
        p.webEnemies = [];
        p.player.canShoot = true;

        showGameOver();
    };
};
var mySketch2 = new p5(sketch2, "sketch2");


// sketch 3 -> Game Over screen
var sketch3 = function (p) {

    let prev_pos_x = 0;
    let prev_pos_y = 0;
    let x_vel;// = 3*Math.random()*200;
    let y_vel;// = 3*Math.random()*80;

    // might need to change these guys when we merge this whole thing??
    const PARTICLE_SPEED = 400;
    const FONT_SIZE = 150;
    const TEXT_X = p.windowWidth / 2;
    const TEXT_Y = p.windowHeight / 2;
    const TEXT_TOP = p.windowHeight / 2;
    const TEXT_BOTTOM = p.windowHeight / 2.9;
    p.mouse_particles = new Particles([]);

    p.backgroundColor = p.color(0);
    p.changingColor = false;

    // SETUP FUNCTION
    p.setup = function () {
        p.createCanvas(p.windowWidth, p.windowHeight - SKETCH_1_HEIGHT);
    };

    // DRAW FUNCTION
    p.draw = function () {
        //p.background(p.backgroundColor);
        p.background(0);

        if (p.mouseIsPressed && !isInGame) {
            showGame();
        }

        // make particles follow mouse
        // set their velocity in the opposite direction of where the mouse is going
        let x_dir = p.mouseX - prev_pos_x;
        let y_dir = p.mouseY - prev_pos_y;

        if (x_dir > 0) {
            x_vel = -2 * Math.random() * 200;
        }
        if (x_dir < 0) {
            x_vel = 2 * Math.random() * 200;
        }
        if (y_dir > 0) {
            y_vel = -2 * Math.random() * 80;
        }
        if (y_dir < 0) {
            y_vel = 2 * Math.random() * 80;
        }
        if (x_dir == 0 && y_dir == 0) {
            x_vel = x_vel * Math.random() * 50;
            y_vel = y_vel * Math.random() * 50;
        }

        // get a random color: red/purple/blue
        let red_color = Math.random() * 255;
        let green_color;
        let blue_color = Math.random() * 255;

        // add, update and draw the particles
        p.mouse_particles.addParticle(p, p.createVector(x_vel, y_vel), p.createVector(p.mouseX, p.mouseY), 5, p.color(red_color, 0, blue_color), p.CIRCLE, 0);
        p.mouse_particles.updateParticlePositions(p);
        p.mouse_particles.drawParticles(p);
        p.mouse_particles.deleteOldParticles(p);

        // save the previous position of the particles
        prev_pos_x = p.mouseX;
        prev_pos_y = p.mouseY;



        p.textSize(FONT_SIZE);
        let aString = 'GAME OVER';
        let sWidth = p.textWidth(aString);
        p.fill(255, 0, 0);
        p.textFont('Impact');
        //p.text(aString, 400, 405);
        // p.line(sWidth, 50, sWidth, 100);

        let tw = p.textWidth(aString);
        let text_min_x = p.width / 2 - tw / 2;
        // let text_min_y = TEXT_BOTTOM;
        let text_max_x = p.width / 2 + tw / 2;
        // let text_max_y = TEXT_TOP;

        //&& p.mouseY < text_max_y && p.mouseY > text_min_y) {

        if (p.mouseX < text_max_x && p.mouseX > text_min_x && p.mouseY < TEXT_TOP && p.mouseY > TEXT_BOTTOM) {
            p.textAlign(p.CENTER);
            p.text(aString, TEXT_X + Math.random() * 5 - 5, TEXT_Y + Math.random() * 5 - 5);
        } else {
            p.textAlign(p.CENTER);
            p.text(aString, TEXT_X, TEXT_Y);
        }
        // Try again text
        p.textSize(30);
        let bString = 'Click anywhere to try again';
        let bWidth = p.textWidth(bString);
        p.fill(255, 240, 240);
        p.textFont('Impact');
        p.textAlign(p.CENTER);
        p.text(bString, TEXT_X, TEXT_Y * 1.15);
    };
};

// ***~*~*~*~*~*~*~*~*~*~*~*~ END SKETCHES **~*~*~*~*~*~*~*~**~*~*~*~**~

function showGameOver() {
    mySketch2 = undefined;
    document.getElementById("sketch2").innerHTML = "";
    mySketch2 = new p5(sketch3, "sketch2");
    isInGame = false;
}

function showGame() {
    mySketch2 = undefined;
    document.getElementById("sketch2").innerHTML = "";
    mySketch2 = new p5(sketch2, "sketch2");
    isInGame = true;
}

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

// **~*~*~*~*~*~*~*~**~ PRIVATE HELPERS *~*~**~*~*~~**~*~
function getRandomSpawnPositionAroundSeed(p, radius, seedHeight, posVariance) {
    let widthVar = Math.random() * posVariance;
    let heightVar = Math.random() * posVariance;
    let finalHeight = seedHeight + heightVar;
    if (finalHeight < 8 * radius) {
        finalHeight = 8 * radius;
    } else if (finalHeight > p.height - 8 * radius) {
        finalHeight = p.height - 8 * radius;
    }
    return p.createVector(p.width + widthVar, finalHeight);
}