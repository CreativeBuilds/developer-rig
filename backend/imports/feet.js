var Armor = require('./armor.js');

module.exports = class Feet extends Armor{
    constructor({name, type = "feet", level,baseCost, rarity, baseProtection, imageLocation, tradeable = true}){
        super({name, type, level,baseProtection,baseCost, rarity, imageLocation, stackable:false, tradeable});
    }
}