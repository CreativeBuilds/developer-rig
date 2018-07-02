module.exports = class Item {
    constructor(name, type, level, imageLocation, owner = null){
        this.name = name;
        this.type = type; //Types include common, uncommon, rare, epic, legendary, and mythic
        this.level = level; //This is the current level of the item.
        this.imageLocation = imageLocation;
        this.owner = owner; // This is the username/id of the user who owns this item;
    }
}