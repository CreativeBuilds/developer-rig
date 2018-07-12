var Item = require('./item.js');

module.exports = class OffHand extends Item{
    constructor({name, type = "offHand", level,rarity, baseDamage,baseCost = 1, imageLocation}){
        super({name, type, level, imageLocation,rarity, stackable:false, tradeable:true});
        this.baseDamage = baseDamage;
        this.baseCost = baseCost;
    }

    get damage(){
        return this.baseDamage;
    }
}