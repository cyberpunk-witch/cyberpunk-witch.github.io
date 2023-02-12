ROT.DEFAULT_WIDTH=30;
ROT.DEFAULT_HEIGHT=15;

$(function(){
	$('#MUSIC').click(function(){
	if (global.MUSICPLAYING == true) {
      document.getElementById('playTune').pause();
	  global.MUSICPLAYING = false;
  } else {
  document.getElementById('playTune').play();
  global.MUSICPLAYING = true;
  }})
    $('#SFX').click(function(){
	if (global.BACKGROUNDSOUNDS == true) {
      global.BACKGROUNDSOUNDS = false;
  } else {
  global.BACKGROUNDSOUNDS = true;
  }})
	tileSet.onload = function() {
		Game.init();
	}
})

var tileSet = document.createElement("img");
tileSet.src = "img/mytiles.jpg";

var options = {
layout: "tile",
bg: "black",
tileWidth: 32,
tileHeight: 32,
tileSet: tileSet,
tileMap: {
		"@": [0, 0],
		".": [0, 32],
		"*": [32, 0],
		"P": [32, 32],
		"$":[0,64],
		"O":[32,64],
		"^":[64,0],//pup
		">":[64,32],//pright
		"<":[64,64],//pleft
		"#":[0,96],
	},
width: ROT.DEFAULT_WIDTH,
height: ROT.DEFAULT_HEIGHT
}

var Game = {
display: null,
map: {},
engine: null,
player: null,
monster: null,
monster2: null,
monster3:null,
portalSwitch: null,
portalOpened: false,
portalLocation: null,
scheduler: null,
init: function() {
		this.display = new ROT.Display(options);
		
		$("#aMazeTainer").append(this.display.getContainer());
		this._generateMap();
		this.scheduler = new ROT.Scheduler.Simple();
		this.scheduler.add(this.player, true);
		this.scheduler.add(this.monster, true);
		this.scheduler.add(this.monster2, true);
		this.scheduler.add(this.monster3, true);
		this.engine = new ROT.Engine(this.scheduler);
		this.engine.start();
	},
	
	_generateMap: function() {
		var digger = new ROT.Map.Digger();
		var freeCells = [];
		
		var digCallback = function(x, y, value) {
			if (value) { return; }
			var key = x+","+y;
			this.map[key] = ".";
			freeCells.push(key);
		}
		digger.create(digCallback.bind(this));
		this._generateGrass(freeCells);
		this._generatePortal(freeCells);
		this._drawWholeMap();
		this.player = this._createBeing(Player, freeCells);
		$("#HP").text("H.P.: "+this.player.getHP());
		$("#SCORE").text("Score: "+this.player.getScore());
		this.monster = this._createBeing(Monster, freeCells);
		this.monster2 = this._createBeing(Monster, freeCells);
		this.monster3 = this._createBeing(Monster, freeCells);
		this._drawWholeMap();
	},
	
	_createBeing: function(what, freeCells) {
		var index = Math.floor(ROT.RNG.getUniform() * freeCells.length);
		var key = freeCells.splice(index, 1)[0];
		var parts = key.split(",");
		var x = parseInt(parts[0]);
		var y = parseInt(parts[1]);
		return new what(x, y);
	},
	
	_removeMob: function(what){
		var x = Game.what._x;
		var y = Game.what._y;
		var key = x + ',' + y;
		if (this.map[key] != '.') {
			this.map[key];
		}
		this.scheduler.remove(what);
	},
	
	_generateGrass: function(freeCells) {
		for (var i=0;i<10;i++) {
			var index = Math.floor(ROT.RNG.getUniform() * freeCells.length);
			var key = freeCells.splice(index, 1)[0];
			this.map[key] = "*";
			if (!i) { this.portalSwitch = key; } 
		}
	},
	
	_generatePortal: function(freeCells){
		var index = Math.floor(ROT.RNG.getUniform() * freeCells.length);
		var key = freeCells.splice(index, 1)[0];
		this.portalLocation = key;
	}
	,
	
	_drawWholeMap: function(){
		for (var key in this.map) {
			var parts = key.split(",");
			var x = parseInt(parts[0]);
			var y = parseInt(parts[1]);
			currentColor = cheapLighting(x,y);
			if (currentColor == "black"){
				this.display.draw(x,y,"$");
			} else {
				this.display.draw(x,y,this.map[key]);	
			}
		}
	}
}


var cheapLightingWithParam = function(x,y,param){
	theColor = cheapLighting(x,y)
	if (theColor != "red" && theColor !="black"){
		if (param == "P") return "red";
	}
	return theColor;
}

var cheapLighting=function(x,y){
	//a quick and dirty lighting hack
	radius = 4;
	px = x;
	py = y;
	if (Game.player) {
		px = Game.player.getX();
		py = Game.player.getY();
	}
	if (x-px != 0){
		xd = Math.abs(x - px);
		xc = xd*xd;
	} else {
		xc = 0;
	}
	if (y-py != 0){
		yd = Math.abs(y - py);
		yc = yd*yd;
	} else {
		yc = 0;
	}
	if (!(xc == yc && yc == 0)){	
		myDistance = Math.sqrt(xc + yc);
		if (myDistance > radius) return "black";
	}
	return myColor(x,y);
}


function myColor(x,y){
	if (Game.map[x+","+y] == "*") return "green";
	if (Game.map[x+","+y] == "@") return "yellow";
	if (Game.map[x+","+y] == ".") return "white";
	return "white";
}

function fail(){
	toastr.warning("You have died!");
	Game.engine.lock();
	setTimeout(function(){
	window.location.assign("lose.html?Score="+Game.player.getScore()+"&Achievements="+Game.player.getAchievements());
	},3010)
}

function win(){
	toastr.warning("You have won!");
	hpBonus = Game.player.getHP() * 2;
	FinalScore = Game.player.getScore()+hpBonus;
	Game.engine.lock();
	setTimeout(function(){
	window.location.assign("win.html?Score="+Game.player.getScore()+"&Achievements="+Game.player.getAchievements()+"&HPBonus="+hpBonus+"&FinalScore="+FinalScore);
	},3010)
}

function loadPage(container,source){
$(container).appendChild(
document.importNode(source));
}

