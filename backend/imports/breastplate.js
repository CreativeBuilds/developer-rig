var Armor = require('./armor.js');

module.exports = class Breastplate extends Armor{
    constructor({name, type = "breastplate", level, rarity, baseProtection, imageLocation, tradeable = true}){
        super({name, type, level,baseProtection,rarity, imageLocation, stackable:false, tradeable});
    }
}