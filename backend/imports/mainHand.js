var Item = require('./item.js');

module.exports = class MainHand extends Item {
    constructor({
        name,
        type = "mainHand",
        level,
        baseDamage,
        imageLocation
    }) {
        super({
            name,
            type,
            level,
            imageLocation,
            stackable: false,
            tradeable: true
        });
        this.baseDamage = baseDamage;
    }

    get damage() {
        return this.baseDamage;
    }
}