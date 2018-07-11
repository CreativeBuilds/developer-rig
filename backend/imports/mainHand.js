var Item = require('./item.js');

module.exports = class MainHand extends Item{
    constructor(name, type, level, baseDamage, imageLocation){
        super(name, type, level, imageLocation, false, true);
        this.baseDamage = baseDamage;
    }

    get damage(){
        return this.baseDamage;
    }
}