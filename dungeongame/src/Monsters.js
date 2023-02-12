var Sequelize = require('sequelize');
var sequelize = new Sequelize('gamedb', 'postgres', 'sqldr1ftm3t@l', {
  dialect: 'postgres'
});

var Monster = sequelize.define('monster', {
  species: Sequelize.STRING,
  CR: Sequelize.INTEGER	  
});

sequelize.sync().then(function() {
  return Monster.create({
    species: "cat",
    CR: 1,
    HP: 10,
    HD: 1,
  });
}).then(function(cat) {
  console.log(cat.get({
    plain: true
  }));
});




//
//x,y,draw,hp, hitDice, symbol

//species
//type
//trait
//level?
//CR
//species weapons
//weapons
//armor
//attacks


//rat
//spider
//worm
//snake
//beetle
//dog
//cat
//human
//lion
//bear
//fly
//maggot
//moth
//hornet
//scorpion
//spider
//millipede
//velvet worm / onichophyra
//praying mantis
//isopod
//armadillo
//giant sloth
//sloth
//monkey
//hyena
//prospector
//mushroom hunter ^_^
//adventurer

//manticore
//mimic
//

//---non aggro things
//fungus
//giant flytrap
//flytrap
//orchid
//nightshade
//snail
//strangling vines
//devils breath
//poison mushroom
//magic mushroom
//wolfsbane
//monkshood
//berries
//

//inanimate things
//treasure chest
//trap
//artifact
//statue
//corpse
//trash
//weapon
//signage and graffiti