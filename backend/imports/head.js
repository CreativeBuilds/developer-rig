var Armor = require('./armor.js');

module.exports = class Head extends Armor{
    constructor({name, type = "head", level, baseProtection, imageLocation, tradeable = true}){
        super({name, type, level,baseProtection, imageLocation, stackable:false, tradeable});
    }
}