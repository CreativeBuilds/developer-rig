var Armor = require('./armor.js');

module.exports = class Legs extends Armor{
    constructor({name, type = "legs", level, baseProtection, imageLocation, tradeable = true}){
        super({name, type, level,baseProtection, imageLocation, stackable:false, tradeable});
    }
}