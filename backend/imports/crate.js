let rarities = require('../rarities.json');
let items = require('../itemStats.json');

var Item = require('./item.js');

var Random = require("random-js");
var random = new Random(Random.engines.mt19937().autoSeed());

module.exports = class Crate extends Item {
    constructor({
        rarity = "common",
        uuid
    }) {
        rarity = rarity.charAt(0).toUpperCase() + rarity.slice(1);
        super({
            name: rarity + " Crate",
            type: "crate",
            rarity: rarity.toLowerCase(),
            imageLocation: rarity.toLowerCase() + 'Crate.png',
            stackable: true,
            tradeable: true,
            stackSize: 1,
            uuid
        })
        console.log("Running constructor");
        if (typeof rarity !== "string") rarity === "common";

        let found = false;

        for (let rarityPos = 0; rarityPos < rarities.length; rarityPos++) {
            if (rarities[rarityPos] === rarity && found === false) {
                found = true;
            } else if (rarityPos + 1 === rarities.length && found === false) {
                // We've looped threw all the possible types and it's not available
                rarity = "common";
            }
        }

        let rarityPrice = {
            "common":10,
            "uncommon":25,
            "rare":50,
            "epic":100,
            "legendary":250,
            "mythic":1000
        }

        this.unlockAmount = rarityPrice[rarity];

    }

    get open() {

        return new Promise(function (resolve, reject) {
            let itemPoolWeCanWinFrom = items[this.rarity];
            console.log(itemPoolWeCanWinFrom, this.rarity);
            let winningNumber = random.integer(1, 100);
            let currentChance = 0;
            for (let x = 0; x < itemPoolWeCanWinFrom.length; x++) {
                let currentItem = itemPoolWeCanWinFrom[x];
                if (currentItem.chanceToGet + currentChance >= winningNumber) {
                    // This is the item that won!
                    var winningItem = currentItem;
                    resolve(winningItem);
                } else if (x + 1 < itemPoolWeCanWinFrom.length) {
                    currentChance = currentChance + currentItem.chanceToGet;
                } else {
                    reject("Nothing won!");
                }
            }
        }.bind(this))

        // Maybe have a chance to fail in general and not give anything
    }
}