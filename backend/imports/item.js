module.exports = class Item {
    constructor({
        name,
        type,
        rarity,
        level = null,
        imageLocation,
        stackable = false,
        tradeable = true,
        stackSize = 1
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
    }
}