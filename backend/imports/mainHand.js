var Item = require('./item.js');

module.exports = class MainHand extends Item {
    constructor({
        name,
        type = "mainHand",
        level,
        baseDamage,rarity,
        imageLocation,
        baseCost = 1,
        uuid
    }) {
        super({
            name,
            type,
            level,
            imageLocation,
            rarity,
            stackable: false,
            tradeable: true,
            uuid
        });
        this.baseDamage = baseDamage;
        this.baseCost = baseCost;
    }

    get damage() {
        return this.baseDamage;
    }
}