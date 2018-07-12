var Item = require('./item.js');

module.exports = class Feet extends Armor{
    constructor({name, type = "feet", level, baseProtection, imageLocation, tradeable = true}){
        super({name, type, level,baseProtection, imageLocation, stackable:false, tradeable});
    }
}