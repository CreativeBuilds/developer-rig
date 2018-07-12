var Armor = require('./armor.js');

module.exports = class Head extends Armor{
    constructor({name, type = "head", level,rarity, baseProtection, imageLocation, tradeable = true}){
        super({name, type, level, baseProtection, rarity, imageLocation, stackable:false, tradeable});
    }
}