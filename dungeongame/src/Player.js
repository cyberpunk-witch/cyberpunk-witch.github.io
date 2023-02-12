var Player = function(x, y) {
	this._x = x;
	this._y = y;
	this._draw();
	this._hp = 150;
	this._maxHP = 150;
	this._healing = 2;
	this._isHealing = false;
	this._hitDice = 6;
	// score. like for achievements etc
	this._score = 0;
	this._symbol = '@';
	this._sound = new Audio("sfx/punch.wav");
	this._achievements="none";
	this._swords = 0;
	this._level = 0;
	this._inventory = [];
	this._experience = 0;
	this._experienceToLevel = 100;
	// exp points to level
}

Player.prototype.getSpeed = function() { return 100; }
Player.prototype.getX = function() { return this._x; }
Player.prototype.getY = function() { return this._y; }
Player.prototype.getSound = function(){return this._sound;}
Player.prototype.getSwords = function(){return this._swords;}
Player.prototype.getHP = function() {return this._hp;}
Player.prototype.getLevel = function() {return this._level;}
Player.prototype.getExperience = function() { return this._experience;}
Player.prototype.getExperienceToLevel = function() { return this._experienceToLevel;}
Player.prototype.getInventory = function(){
	this._inventory.map((el)=>el.details());
}
Player.prototype.act = function() {
	Game.engine.lock();
	if (Game.player._hp / Game.player._maxHP < 0.2){
		globalvars.print("Your health is below 20%", "red");
	}
	Game._drawWholeMap();
	for (let i = 0; i < Game.monsters.length; i++){
		Game.monsters[i]._draw();
	};
	Game.player._draw();
	$("#HP").text("H.P.: "+Game.player.getHP()+"/"+Game.player.getMaxHP());
	$("#SCORE").text("Score: "+Game.player.getScore());

	window.addEventListener("keydown", this);
}

Player.prototype.passiveHealing =function(){
	//random chance each turn. this function is called by event handler
	if (Math.floor(ROT.RNG.getUniform() * 3)+1 == 2){
		Game.player._hp = Game.player._hp + Game.player._maxHP * .1;
	}
};

Player.prototype.addHP = function(hpToAdd){
	Game.player._hp = Game.player._hp + hpToAdd;
	if (Game.player._hp > Game.player._maxHP) Game.player._hp = Game.player._maxHP;
}

Player.prototype.findNearestMonster = function(){
	for (var currentMonster in Game.monsters){
		//for now this works.
		if (currentMonster.isAttacking) return currentMonster;
	}
}

Player.prototype.handleEvent = function(e) {
		//passive healing
		Game.player.passiveHealing();
		var code = e.keyCode;
		if (code == 13 || code == 32) {
			this._checkGrass();
			return;
		}
		if (code == 72){
			Game.player._hp = Game.player._hp + Game.player._healing;
			if (Game.player._hp > Game.player._maxHP) Game.player._hp = Game.player._maxHP;
			globalvars.print("You spend the turn healing.");
			Game.player._isHealing = true;
			window.removeEventListener("keydown", this);
			Game.engine.unlock();
			return;
		}
		
		// hit monster with 'ctrl' key (alt is 18)
		if (code == 17){
		// 	// compute whether there is a near path to monster
		var nearestMonster = this.findNearestMonster();
		// 	// hit nearest monster in range
		if (nearestMonster){
			var amt = this.makeHit();
			nearestMonster.getHit(amt);
			globalvars.print("You hit the attacking monster for "+amt+" damage!");
			Game.engine.unlock();
			return;
		}
	}
	var keyMap = {};
	keyMap[38] = 0;
	keyMap[33] = 1;
	keyMap[39] = 2;
	keyMap[34] = 3;
	keyMap[40] = 4;
	keyMap[35] = 5;
	keyMap[37] = 6;
	keyMap[36] = 7;
	keyMap[100] = 6;
	keyMap[102] = 2;
	keyMap[104] = 0;
	keyMap[98] = 4;
	keyMap[105] =1;	
	keyMap[103] = 7;
	keyMap[97] = 5;
	keyMap[99] = 3;
	if (!(code in keyMap) || Game.player.hasWon == true) { return; }
	switch(keyMap[code]){
		case 0:
		Game.player._symbol = "^";
		break;
		case 1:
		Game.player._symbol = "^";
		break;
		case 2:
		Game.player._symbol = ">";
		break;
		case 3:
		Game.player._symbol = "@";
		break;
		case 4:
		Game.player._symbol = "@";
		break;
		case 5:
		Game.player._symbol = "@";
		break;
		case 6:
		Game.player._symbol = "<";
		break;
		case 7:
		Game.player._symbol ="^";
		break;	
	}
	var dir = ROT.DIRS[8][keyMap[code]];
	var newX = this._x + dir[0];
	var newY = this._y + dir[1];
	var newKey = newX + "," + newY;
	if (!(newKey in Game.map)) { return; }
	thisColor = cheapLighting(this._x,this._y);
	if (thisColor == "black") {
		Game.display.draw(this._x,this._y, "$");
	} else
	{
		Game.display.draw(this._x, this._y, Game.map[this._x+","+this._y]);
	}
	this._x = newX;
	this._y = newY;
	this._draw();
	window.removeEventListener("keydown", this);
	Game.engine.unlock();
}

Player.prototype.makeHit=function(){
	if (this._isHealing){
		this._isHealing = false;
		return 0;
	}
	return Math.floor(ROT.RNG.getUniform()*this._hitDice)+1;
}

Player.prototype._draw = function() {
	Game.display.draw(this._x, this._y, this._symbol);
}
Player.prototype.getHit=function(amount){
	this._hp = this._hp - amount;
	if (this._hp <= 0) fail();
}

Player.prototype.getScore = function(){
	return this._score;
}

Player.prototype.getMaxHP = function(){
	return this._maxHP;
}

Player.prototype.getAchievements = function(){
	return this._achievements;
}
Player.prototype.addAchievement = function(achieved){
	if (this._achievements == "none"){
		this._achievements = achieved;
	}
	else {
		this._achievements = this._achievements+"+"+achieved;
	}
	toastr.success("Achievement: "+achieved);
}

Player.prototype._checkGrass = function() {
	var key = this._x + "," + this._y;
	if (Game.map[key] == ".") {
		globalvars.print("There is nothing here!");
	}
	else if (Game.map[key]=="O" || Game.map[key]=="_" ){
		Game.player.hasWon = true;	
		win();
	} else if (key == Game.portalSwitch) {
		globalvars.print("Hooray! You found the switch! Opening gate to next level...");
		Game.portalOpened = true;
		this.addAchievement("Portal opened.");
		if (globalvars.level < 6){
			Game.map[Game.portalLocation] = "O";
		}
		else {
			Game.map[Game.portalLocation] = "_";
		}
		Game.map[key] = ".";
	} else {
		if (Math.floor(ROT.RNG.getUniform()*10) == 1){
			switch(Math.floor(ROT.RNG.getUniform()*3)){
				case 1:
				switch (Game.player.getSwords()){
					case 1:
					globalvars.print("You found a rusty fork! HD + 2");
					this.addAchievement("Found rusty fork. It was okay.");
					this._hitDice += 2;
					this._score+=2;
					this._sound = "sfx/sword.wav";
					break;
					case 2:
					globalvars.print("You found a can lid taped to a butterknife! HD + 2");
					this.addAchievement("Found a crazy can knife");
					this._hitDice += 2;
					this._score+=2;
					break;
					case 3:
					globalvars.print("You found a butcher knife! HD + 3");
					this.addAchievement("Found a butcher knife.");
					this._hitDice += 3;
					this._score+=2;
					break;
					case 4:
					globalvars.print("You found a filthy knife! Extra nastiness damage! HD + 3");
					this.addAchievement("Found a filthy knife.");
					this._hitDice += 3;
					this._score+=2;
					break;
					case 5:
					globalvars.print("You found a rusty sword! HD + 3");
					this.addAchievement("Found a rusty sword.");
					this._hitDice += 3;
					this._score+=2;
					break;
					case 6:
					globalvars.print("You found a non-rusty sword! HD + 3");
					this.addAchievement("Found a normal sword.");
					this._hitDice += 3;
					this._score+=2;
					break;
					case 7:
					globalvars.print("You found a great sword! HD + 3");
					this.addAchievement("Hey, this sword is great!");
					this._hitDice += 3;
					this._score+=2;
					break;
					default:
					globalvars.print("You found a better weapon!");
					this.addAchievement("Oh wow, another weapon. It looks like the last one but is a bit better. Good job.");
					this._hitDice += 3;
					this._score+=2;
					break;
				}
				break;
				case 2:
				globalvars.print("You found a health potion! hp + 25% maxhp");
				this.addAchievement("Found a health potion!");
				this._hp += this._maxHP * .25;
				if (this._hp > this._maxHP) this._hp = this._maxHP;
				this._score+=2;
				break;
				case 3:
				globalvars.print("You found a score potion! score +50.");
				this.addAchievement("Found a score potion!");
				this._score += 50;
				break;
			}
		}
		else{	
			globalvars.print("This grass is empty.");
		}
		Game.map[key] = ".";
	}
};

Player.prototype.addExperience = function(exp){
	this._experience += exp;
	if (this._experience >= this._experienceToLevel) this.levelUp();
	globalvars.print("Experience gained "+exp+".");
}

Player.prototype.levelUp = function(){
	var level = this._level;
	var experienceToLevel = this._experienceToLevel;
	var experience = this._experience;
	if (experience >= experienceToLevel){
		this._level++;
		globalvars.print("You leveled! New Level is: "+this._level+".");
		this._experienceToLevel = experienceToLevel + experienceToLevel * 1.5;
		globalvars.print("Experience to next level: "+this._experienceToLevel);
		globalvars.print("Hitdice increased by "+this._level);
		this._hitDice = this._hitDice + this._level;
		globalvars.print("Healing increased by 1");
		this._healing += 1;
		globalvars.print("Score increased by "+this._level * 10+".");
		this._score += this._level * 10;
		hud.act();
	}
}

