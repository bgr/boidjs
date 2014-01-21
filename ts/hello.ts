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


var EPS = 0.0001;

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
        if (l > EPS)
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

function seek(boid: Boid, target: Vector2D): Vector2D {
    var desiredVelocity = target.sub(boid.position).norm().mul(boid.maxSpeed);
    return desiredVelocity.sub(boid.velocity);
}

function flee(boid: Boid, target: Vector2D): Vector2D {
    var desiredVelocity = boid.position.sub(target).norm().mul(boid.maxSpeed);
    return desiredVelocity.sub(boid.velocity);
}

function arrival(boid: Boid, target: Vector2D, 
                 slowingDistance: number = 100): Vector2D {
    var targetOffset = target.sub(boid.position);
    var distance = targetOffset.len();
    if (distance < EPS)
        return new Vector2D(0, 0);
    var rampedSpeed = boid.maxSpeed * (distance / slowingDistance);
    var clippedSpeed = Math.min(rampedSpeed, slowingDistance);
    var desiredVelocity = targetOffset.mul(clippedSpeed / distance);
    return desiredVelocity.sub(boid.velocity);
}


var behs = [seek, flee, arrival];
var curBehIndex: number = 2;

stage.on("stagemouseup", () => { 
    curBehIndex = (curBehIndex + 1) % behs.length; 
    console.log("Changed behavior to " + behs[curBehIndex].name);
});

function onTick() {
    boid.maxSpeed = 6;
    var beh = behs[curBehIndex];
    var steering = beh(boid, new Vector2D(stage.mouseX, stage.mouseY));
    boid.steer(steering);
    boidBmp.x = boid.position.x - 8;
    boidBmp.y = boid.position.y - 8;
    stage.update();
}
