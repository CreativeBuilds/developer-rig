var Armor = require('./armor.js');

module.exports = class Legs extends Armor{
    constructor({name, type = "legs", level,rarity,baseCost, baseProtection, imageLocation, tradeable = true, uuid}){
        super({name, type, level,baseProtection,baseCost,rarity, imageLocation, stackable:false, tradeable, uuid});
    }
}