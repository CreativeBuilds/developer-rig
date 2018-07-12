var Item = require('./item.js');

module.exports = class MainHand extends Item {
    constructor({
        name,
        type = "mainHand",
        level,
        baseDamage,rarity,
        imageLocation
    }) {
        super({
            name,
            type,
            level,
            imageLocation,
            rarity,
            stackable: false,
            tradeable: true
        });
        this.baseDamage = baseDamage;
    }

    get damage() {
        return this.baseDamage;
    }
}