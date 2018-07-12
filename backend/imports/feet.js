var Armor = require('./armor.js');

module.exports = class Feet extends Armor{
    constructor({name, type = "feet", level, rarity, baseProtection, imageLocation, tradeable = true}){
        super({name, type, level,baseProtection, rarity, imageLocation, stackable:false, tradeable});
    }
}