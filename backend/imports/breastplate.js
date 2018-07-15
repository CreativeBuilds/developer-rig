var Armor = require('./armor.js');

module.exports = class Breastplate extends Armor {
    constructor({
        name,
        type = "breastplate",
        level,
        baseCost,
        rarity,
        baseProtection,
        imageLocation,
        tradeable = true,
        uuid
    }) {
        super({
            name,
            type,
            level,
            baseProtection,
            baseCost,
            rarity,
            imageLocation,
            stackable: false,
            tradeable,
            uuid
        });
    }
}