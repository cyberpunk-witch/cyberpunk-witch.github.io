$(loadStuff);
function loadStuff(){
var url = window.location.href;
var params = url.split('?');
var result = params[1];
result = result.split('&');
var score = "";
var achievements = "";
var hpBonus ="";
var finalScore = "";
score = result[0].split('=')[1].split('%20').join(' ');
achievements=result[1].split('=')[1].split('%20').join(' ').split('+').join('<br>');
if (window.location.href.indexOf("win.html") > -1){
hpBonus=result[2].split('=')[1].split('%20').join(' ').split('+').join('<br>');
finalScore=result[3].split('=')[1].split('%20').join(' ').split('+').join('<br>');
}
$("#SCORE").text(score);
$("#ACHIEVEMENTS").html(achievements);
$("#FINALSCORE").text(finalScore);
$("#HPBONUS").text(hpBonus);
};