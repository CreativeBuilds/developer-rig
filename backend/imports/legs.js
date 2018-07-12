var Armor = require('./armor.js');

module.exports = class Legs extends Armor{
    constructor({name, type = "legs", level,rarity, baseProtection, imageLocation, tradeable = true}){
        super({name, type, level,baseProtection,rarity, imageLocation, stackable:false, tradeable});
    }
}