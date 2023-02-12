
var Monster = function(x, y) {
	this._x = x;
	this._y = y;
	this._draw();
	this._hp = 20;
	this._hitDice = 6;
	this.isAttacking = true;
	switch(globalvars.level){
		case 1:
		this._symbol = "P";
		this._hitDice = 12;
		this._experience = 25;
		break;
		case 2:
		this._symbol = "!";
		this._hitDice = 20;
		this._hp = 25;
		this._experience = 70;
		break;
		case 3:
		this._symbol="~";
		this._hitDice = 100;
		this._hp = 30;
		this._experience = 100;
		break;
		case 4:
		this._symbol="(";
		this._hitDice = 120;
		this._experience = 200;
		this._hp = 45;
		break;
		case 5:
		this._symbol=")";
		this._hitDice = 150;
		this._experience = 300;
		this._hp = 100;
		break;
		default:
		this._symbol="%";
		this._hitDice = 200;
		this._hp = 200;
		this._experience = 500;
		break;
	}
	this._sound = new Audio("sfx/punch.wav");
}

Monster.prototype.getSpeed = function() { return 100; }
Monster.prototype.getHit=function(amt){
	this._hp = this._hp - amt;
	if (this._hp <= 0) 
	{
		globalvars.print("You have slain the monster! You get 10 points!");
		Game.player._score = Game.player._score + 10;
		this.isAttacking = false;
		this._die();
	}
}

Monster.prototype._die=function(){
	thisColor = cheapLighting(this._x,this._y);
	if (thisColor == "black"){
		Game.display.draw(this._x,this._y, "$");
	}else {
		Game.display.draw(this._x, this._y, ".");
	}
	x = this._x;
	y = this._y;
	this._symbol = "#";
	Game.scheduler.remove(this);
	var deathKnell = new Audio("sfx/monster.wav");
	if (globalvars.BACKGROUNDSOUNDS) deathKnell.play();
	globalvars.print("The monster you were fighting has died!!");
	Game.player.addExperience(this._experience);
	Game.this = null;
}

Monster.prototype.makeHit= function(){
	return Math.floor(ROT.RNG.getUniform()*this._hitDice)+1;
}

Monster.prototype.act = function() {
	var x = Game.player.getX();
	var y = Game.player.getY();
	var passableCallback = function(x, y) {
		return (x+","+y in Game.map);
	}
	var astar = new ROT.Path.AStar(x, y, passableCallback, {topology:4});
	var path = [];
	var pathCallback = function(x, y) {
		path.push([x, y]);
	}
	astar.compute(this._x, this._y, pathCallback);
	path.shift();
	if (path.length <= 1) {
		globalvars.print("The monster attacks!");
		this.isAttacking = true;
		if (globalvars.BACKGROUNDSOUNDS)this._sound.play();
		hitAmt = this.makeHit();
		globalvars.print("The monster does "+hitAmt+" damage!");
		Game.player.getHit(hitAmt);
		amt = Game.player._isHealing ? 0 : Game.player.makeHit();
		if (Game.player._isHealing){
			amt = 0;
			globalvars.print("+++");
			Game.player._isHealing = false;
		} else {
			// 1 in 4 chance of counter strike. can be updated later to use actual stats to calculate
			if (Math.floor(ROT.RNG.getUniform())*4+1 == 1) globalvars.print("You counter! You strike the monster for "+amt+" damage!");
			if (globalvars.BACKGROUNDSOUNDS) Game.player.getSound().play();
			this.getHit(amt);
		}
	} else {
		this.isAttacking = false; // we're not attacking if we're not in range.
		//the monster moves too fast otherwise. so every now and again it should not pursue instead.
		if (Math.floor(ROT.RNG.getUniform() * 3) + 1 == 2){
			this._draw();
		} else {
			x = path[0][0];
			y = path[0][1];
			/*fix the square just behind the monster so it is empty again:
			*/
			thisColor = cheapLightingWithParam(this._x,this._y,"P");
			if (distance(x,y,Game.player._x, Game.player._y) <=4) thisColor = "red";
			if (thisColor == "black"){
				Game.display.draw(this._x,this._y, "$");
			}else {
				Game.display.draw(this._x, this._y, Game.map[this._x+","+this._y]);
			}
			this._x = x;
			this._y = y;
			this._draw();	
		}
		
	}
}

Monster.prototype._draw = function(){
	thisColor = cheapLightingWithParam(this._x,this._y,"P");
	if (thisColor == "black")
	{
		Game.display.draw(this._x, this._y, "$");
	}else{
		Game.display.draw(this._x, this._y, this._symbol);
	}
}    
