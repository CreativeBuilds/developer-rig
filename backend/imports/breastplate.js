var Item = require('./item.js');

module.exports = class Breastplate extends Armor{
    constructor({name, type = "breastplate", level, baseProtection, imageLocation, tradeable = true}){
        super({name, type, level,baseProtection, imageLocation, stackable:false, tradeable});
    }
}