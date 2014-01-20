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


function run() {
    var img = loader.getResult("boid");
    var boid = new createjs.Bitmap(img);
    boid.x = boid.y = 200;
    stage.addChild(boid);
    stage.update();
}
