var Armor = require('./armor.js');

module.exports = class Head extends Armor{
    constructor({name, type = "head", level,baseCost,rarity, baseProtection, imageLocation, tradeable = true, uuid}){
        super({name, type, level, baseProtection,baseCost, rarity, imageLocation, stackable:false, tradeable, uuid});
    }
}