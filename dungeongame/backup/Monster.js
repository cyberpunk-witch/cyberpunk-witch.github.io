var Monster = function(x, y) {
	this._x = x;
	this._y = y;
	this._draw();
	this._hp = 20;
	this._symbol = "P";
	this._sound = new Audio("sfx/punch.wav");
}

Monster.prototype.getSpeed = function() { return 100; }
Monster.prototype.getHit=function(amt){
	this._hp = this._hp - amt;
	if (this._hp <= 0) 
	{
		toastr.info("You have slain the monster! You get 10 points!");
		Game.player._score = Game.player._score + 10;
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
	if (global.BACKGROUNDSOUNDS) deathKnell.play();
	toastr.info("The monster you were fighting has died!!");
	Game.this = null;
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
	if (path.length <= 2) {
		toastr.warning("The monster attacks!");
		if (global.BACKGROUNDSOUNDS)this._sound.play();
		Game.player.getHit(5);
		amt = Game.player.makeHit();
		toastr.info("You counter! You strike the monster for "+amt+" damage!");
		if (global.BACKGROUNDSOUNDS) Game.player.getSound().play();
		this.getHit(amt);
	} else {
		x = path[0][0];
		y = path[0][1];
		/*fix the square just behind the monster so it is empty again:
		*/
		thisColor = cheapLighting(this._x,this._y);
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

Monster.prototype._draw = function() {
	thisColor = cheapLightingWithParam(this._x,this._y,"P");
	if (thisColor == "black")
	{
		Game.display.draw(this._x, this._y, "$");
	}else{
		Game.display.draw(this._x, this._y, this._symbol);
	}
}    
