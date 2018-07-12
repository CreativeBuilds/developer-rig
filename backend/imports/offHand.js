var Item = require('./item.js');

module.exports = class OffHand extends Item{
    constructor({name, type = "offHand", level,rarity, baseDamage, imageLocation}){
        super({name, type, level, imageLocation,rarity, stackable:false, tradeable:true});
        this.baseDamage = baseDamage;
    }

    get damage(){
        return this.baseDamage;
    }
}