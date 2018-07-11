var Item = require('./item.js');

module.exports = class MainHand extends Item{
    constructor(name, type, level, baseDamage, imageLocation, false, true){
        super(name, type, level, imageLocation);
        this.baseDamage = baseDamage;
    }

    get damage(){
        return this.baseDamage;
    }
}