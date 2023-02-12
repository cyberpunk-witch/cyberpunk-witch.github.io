ROT.DEFAULT_WIDTH=38;
ROT.DEFAULT_HEIGHT=15;

$(function(){	
	globalvars.level = 1;
	var playTune = document.getElementById('playTune')
	let volume = document.querySelector("#volume-control");
	volume.addEventListener("change", function(e) {
		playTune.volume = e.currentTarget.value / 100;
	})

	function toggleG(stateVarName){
		console.log("Before: ",globalvars[stateVarName]);
		if (globalvars[stateVarName]) globalvars[stateVarName] = !globalvars[stateVarName];
		else globalvars[stateVarName] = true;
		console.log("After: ", globalvars[stateVarName]);
	};

	$('#MUSIC').click(function(){
		if (globalvars.MUSICPLAYING == true) {
			playTune.pause();
		} else {
			playTune.play();
		}
		toggleG("MUSICPLAYING");
	});

	$('#SFX').click(function(){
		toggleG("BACKGROUNDSOUNDS");
	});

	globalvars.attachPrint(document.getElementById("mainInfo"));
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
//This feature is extra-important, as it maps the symbols to sections of my sprite sheet.
tileMap: {
			"@": [0, 0],//player
			".": [0, 32],//empty tile
			"*": [32, 0],//grass
			"$":[0,64],//black tile
			"O":[32,64],//portal
			"^":[64,0],//pup
			">":[64,32],//pright
			"<":[64,64],//pleft
			"#":[0,96],//monster bloodsplatter
			"P": [32, 32],//mob lvl 1
			'!':[32,96],//mob lvl 2
			'~':[64,96],//mob lvl 3
			'(':[96,0],//mob lvl 4
			')':[96,64],//mob lvl 5
			'%':[96,32],//mob lvl 6
			'_':[96,96]//final portal
		},
		width: ROT.DEFAULT_WIDTH,
		height: ROT.DEFAULT_HEIGHT
	};

//this should be a class.
var Game = {
	display: null,
	map: {},
	engine: null,
	_lights: true,
	player: null,
	monsters: [],
	portalSwitch: null,
	portalOpened: false,
	portalLocation: null,
	scheduler: null,
	reInit:function(){
		globalvars.playerBackup = this.player;
		this._lights = true;
		this.display = null;
		this.map= {};
		this.engine= null;
		this.player= null;
		this.monsters= [];
		this.portalSwitch= null;
		this.portalOpened= false;
		this.portalLocation= null;
		this.scheduler= null;
		this.init();
		hud.act();
		this.player.hasWon = false;
		this.player._healing = false;
		switch(globalvars.level){
			case 1:
			hpBonus = 50;
			hdBonus = 5;
			healing = 2;
			scoreBonus = 100;
			break;
			case 2:
			hpBonus = 60;
			hdBonus = 7;
			healing = 5;
			scoreBonus = 150;
			break;
			case 3:
			hpBonus = 80;
			hdBonus = 9;
			healing = 8;
			scoreBonus = 175;
			break;
			case 4:
			hpBonus = 90;
			hdBonus = 11;
			healing = 10;
			scoreBonus = 200;
			break;
			case 5:
			hpBonus = 100;
			healing = 15;
			hdBonus = 13;
			scoreBonus = 220;
			break;
			case 6:
			hpBonus = 120;
			hdBonus = 15;
			healing = 18;
			scoreBonus = 250;
			break;
		};

		globalvars.print("Level bonuses: HP+"+hpBonus+", HD+"+hdBonus+", score bonus+"+scoreBonus);
		this.player._hp = globalvars.playerBackup._maxHP+hpBonus;
		this.player._maxHP = this.player._hp;
		this.player._healing = healing;
		this.player._level = globalvars.playerBackup._level;
		this.player._hitDice = globalvars.playerBackup._hitDice+hdBonus;
		this.player._score = globalvars.playerBackup._score+scoreBonus;
		this.player._swords = globalvars.playerBackup.getSwords();
		this.player._experience = globalvars.playerBackup._experience;
		this.player._experienceToLevel = globalvars.playerBackup._experienceToLevel;
		this._symbol = globalvars.playerBackup._symbol;
		this._sound = globalvars.playerBackup._sound;
		this._achievements = globalvars.playerBackup._achievements;
	},
	init: function() {
		$("#aMazeTainer").html("");
		this.display = new ROT.Display(options);
		if (globalvars.level == 1){
			globalvars.print("Welcome!");
			globalvars.print("This bar prints useful information about attacking monsters, changes in health, and items found.");
			globalvars.print("The bar on the right shows your stats, as well as information about the basic game controls.");
		}
		$("#aMazeTainer").append(this.display.getContainer());
		this._generateMap();
		/*
		*The scheduler uses a simple round-robin algorithm to schedule different
		*objects. The engine calls their 'act' methods in turn, cycling until
		*we lock or stop the engine.
		the ading of entities is a little repetitive here - I think we can do better!
		maybe an array and a function that we iterate over to add the things to the scheduler
		*/
		this.scheduler = new ROT.Scheduler.Simple();
		this.scheduler.add(hud, true);
		this.scheduler.add(this.player, true);
		for (var i = 0; i < Game.monsters.length; i++){
			this.scheduler.add(Game.monsters[i], true);
		}
		this.engine = new ROT.Engine(this.scheduler);
		this.engine.start();
	},
	/*
	*Rot's inbuilt maze generator.
	*This is apparently somewhat similar to the 'Tyrant' algorithm mentioned at
	*http://www.roguebasin.com/index.php?title=Dungeon-Building_Algorithm#The_algorithm
	*which bears a vague relationship to Prim's algorithm mentioned here
	*http://en.wikipedia.org/wiki/Maze_generation_algorithm. Basically you add features
	*which can be rooms or tunnels in this case, in Prims it is all tunnels, to a starting
	*feature placed somewhere in the map, determining as you go whether or not there is
	*an existing feature there first.
	*/
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
		hud.act();
		for (var i = 0; i < 4; i++){
			Game.monsters.push(this._createBeing(Monster, freeCells));
		}
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
	},
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

/*
*a quick and dirty lighting hack with an additional parameter
*this is a holdover from the ascii version of the game
*from day one. It is just to make sure the monster
*doesn't suddenly blend in with its surroundings by surprise,
*a side effect of redrawing the map without having
*an additional dimension to handle color data.
*in our case, we only care whether or not something is black,
*and whether it has the correct symbol, so the lighting hacks still matter,
*if only to figure out what is and what is not lit.
*/
var cheapLightingWithParam = function(x,y,param){
	if (this._lights == false) return "black";
	theColor = cheapLighting(x,y)
	if (theColor != "red" && theColor !="black"){
		if (param == "P") return "red";
	}
	return theColor;
}

/*
*a quick and dirty lighting hack
*/
var cheapLighting=function(x,y){
	if (this._lights == false) return "black";
	radius = 4;
	px = x;
	py = y;
	if (Game.player) {
		px = Game.player.getX();
		py = Game.player.getY();
		myDistance = distance(x,y,px,py);
		if (myDistance > radius) return "black";
		return myColor(x,y)	
	}
	return "black";
}

var hud = {
	act: function(){
		$("#levelDisplay").text("Dungeon Level:"+globalvars.level);
		$("#HP").text("HP"+Game.player.getHP()+"/"+Game.player.getMaxHP());
		$("#PLAYERLEVEL").text("Player level: "+Game.player.getLevel());
		$("#EXP").text("Experience: "+Game.player.getExperience() +"/"+Game.player.getExperienceToLevel());
		$("#SCORE").text("Score: "+Game.player.getScore());
		$("#LEVEL").text("Dungeon Level: "+globalvars.level);
	}
}

function myColor(x,y){
	if (Game.map[x+","+y] == "*") return "green";
	if (Game.map[x+","+y] == "@") return "yellow";
	if (Game.map[x+","+y] == ".") return "white";
	return "white";
}

function fail(){
	toastr.error("You have died!");
	Game.engine.lock();
	setTimeout(function(){

		window.location.assign("lose.html?Score="+Game.player.getScore()+"&Achievements="+Game.player.getAchievements());
	},3010)
}

function win(){
	Game.engine.lock();
	Game._lights = false; 
	if (globalvars.level < 6){
		globalvars.level++;
		globalvars.print("You have survived level "+(globalvars.level-1));
		Game.player.addAchievement("Survived level "+(globalvars.level-1));
		setTimeout(function(){Game.reInit();},3010);
	}else{
		toastr.success("You have escaped the dungeon!");
		Game.player.addAchievement("Escaped the Dungeon.");
		hpBonus = Game.player.getHP() * 2;
		FinalScore = Game.player.getScore()+hpBonus;
		Game.engine.lock();
		setTimeout(function(){
			window.location.assign("win.html?Score="+Game.player.getScore()+"&Achievements="+Game.player.getAchievements()+"&HPBonus="+hpBonus+"&FinalScore="+FinalScore);
		},3010)
	}
	
}

function loadPage(container,source){
	$(container).appendChild(
		document.importNode(source));
}

function distance(x1,y1,x2,y2){
	var xd = x1-x2;
	var yd = y1-y2;
	xd = 0 ? 0 : Math.abs(xd);
	yd = 0 ? 0: Math.abs(yd);
	return Math.sqrt(xd*xd+yd*yd);	
}