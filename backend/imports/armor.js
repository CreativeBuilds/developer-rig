var Item = require('./item.js');

module.exports = class Armor extends Item {
    constructor({
        name,
        type,
        level,
        baseProtection,
        baseCost,
        rarity,
        imageLocation,
        tradeable = true,
        protectionMultiplier = 1.1,
        costMultiplier = 1.2,
        uuid
    }) {
        super({
            name,
            type,
            level,
            imageLocation,
            rarity,
            stackable: false,
            tradeable,
            uuid
        });
        this.baseProtection = baseProtection;
        this.protectionMultiplier = protectionMultiplier,
            this.costMultiplier = costMultiplier;
        this.baseCost = baseCost;
    }

    get protection() {
        if (this.level > 1) {
            return this.baseProtection * Math.pow(this.protectionMultiplier, this.level - 1);
        } else {
            return this.baseProtection;
        }
    }
}