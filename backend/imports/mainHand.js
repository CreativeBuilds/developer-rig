import Item from './item.js'

module.exports = class MainHand extends Item{
    constructor(name, type, level, baseDamage){
        super(name, type, level);
        this.baseDamage = baseDamage;
    }

    get damage(){
        return this.baseDamage;
    }
}