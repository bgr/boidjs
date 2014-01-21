///<reference path="../lib/jquery.d.ts" />
///<reference path="../lib/createjs.d.ts" />
///<reference path="../lib/preloadjs.d.ts" />
///<reference path="../lib/easeljs.d.ts" />


var assetManifest = [
  { src:'assets/boid.png', id:'boid' },
];

var stage = new createjs.Stage("game");
var loader = new createjs.LoadQueue();

loader.on("fileload", (e) => { console.log("file complete", e); });
loader.on("complete", (e) => { console.log("completed"); run(); });

loader.loadManifest(assetManifest);


var boid;
var boidBmp;

function run() {
    var img = loader.getResult("boid");
    boid = new Boid(200, 200);
    boidBmp = new createjs.Bitmap(img);
    stage.addChild(boidBmp);
    createjs.Ticker.setFPS(60);
    createjs.Ticker.on("tick", onTick);
}

function onTick() {
    boid.steer(new Vector2D(stage.mouseX, stage.mouseY).sub(boid.position));
    boidBmp.x = boid.position.x;
    boidBmp.y = boid.position.y;
    stage.update();
}


class Vector2D {
    constructor(public x: number, public y: number) {}
    add(other: Vector2D): Vector2D {
        return new Vector2D(this.x + other.x, this.y + other.y);
    }
    sub(other: Vector2D): Vector2D {
        return new Vector2D(this.x - other.x, this.y - other.y);
    }
    mul(scalar: number): Vector2D {
        if (scalar == 1)
            return this;
        return new Vector2D(this.x * scalar , this.y * scalar);
    }
    div(scalar: number): Vector2D {
        if (scalar == 1)
            return this;
        return new Vector2D(this.x / scalar , this.y / scalar);
    }
    dot(other: Vector2D): number {
        return this.x * other.x + this.y * other.y;
    }
    cross(other: Vector2D): number {
        return this.x * other.y - this.y * other.x;
    }
    truncate(maxLength: number): Vector2D {
        if (this.lenSq() <= maxLength * maxLength)
            return this;
        else
            return this.mul(maxLength / this.len());
    }
    lenSq(): number {
        return this.dot(this);
    }
    len(): number {
        return Math.sqrt(this.lenSq());
    }
    norm(): Vector2D {
        var l = this.len();
        if (l > 0)
            return this.div(l);
        else
            return this;
    }
}

class Boid {
    mass: number = 1;
    position: Vector2D;
    velocity: Vector2D;
    acceleration: Vector2D;
    maxForce: number = 10;
    maxSpeed: number = 10;
    orientation: number = 0;
    steeringDirection: Vector2D;
    steeringForce: Vector2D;

    constructor(x: number = 0, y: number = 0) {
        this.position = new Vector2D(x, y);
        this.velocity = new Vector2D(0, 0);
        this.acceleration = new Vector2D(0, 0);
        this.steeringDirection = new Vector2D(0, 0);
        this.steeringForce = new Vector2D(0, 0);
    }

    steer(steeringDirection: Vector2D, timestep: number = 1) {
        this.steeringForce = steeringDirection.truncate(this.maxForce);
        this.acceleration = this.steeringForce.mul(timestep).div(this.mass);
        this.velocity = this.velocity.add(this.acceleration).
            truncate(this.maxSpeed);
        this.position = this.position.add(this.velocity);
    }
}
