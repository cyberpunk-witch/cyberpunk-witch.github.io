var GLOBAL = function(){
	this.MUSICPLAYING = false;
	this.BACKGROUNDSOUNDS = false;
	this.level = 1;
	// what is playerbackup?
	
	this.playerBackup = null;
	this.target = null;
	this.attachPrint = function(el){
		this.target = el;
	}
	this.print = function(textToPrint, colorToPrint = "white"){
		this.target.innerHTML += ("<div class='infoLine' style='color: "+colorToPrint+"'>"+textToPrint+"</div>");
		this.target.scrollTop = this.target.scrollHeight;
	};
}
var globalvars = new GLOBAL();