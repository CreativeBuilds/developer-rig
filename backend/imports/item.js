var Random = require("random-js");
var random = new Random(Random.engines.mt19937().autoSeed());

module.exports = class Item {
    constructor({
        name,
        type,
        rarity = "common",
        level = null,
        imageLocation,
        stackable = false,
        tradeable = true,
        stackSize = 1,
        uuid = random.uuid4()
    }) {
        this.name = name;
        this.rarity = rarity; //Types include common, uncommon, rare, epic, legendary, and mythic
        this.level = level; //This is the current level of the item.
        this.imageLocation = imageLocation;
        this.owner = null; // This is the username/id of the user who owns this item;
        this.stackable = stackable;
        this.tradeable = tradeable;
        this.stackSize = stackSize;
        this.type = type;
        this.uuid = uuid
    }
}