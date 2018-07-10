let rarities = require('../rarities.json');
let items = require('../itemStats.json');

var Random = require("random-js");
var random = new Random(Random.engines.mt19937().autoSeed());

module.exports = class Crate{
    constructor({rarity = "common"}){
        if(typeof rarity !== "string") rarity === "common";

        for(let rarityPos = 0; rarityPos < rarities.length; rarityPos++){
            if(types[rarityPos] === rarity){
                return;
            } else if (rarityPos + 1 === rarities.length){
                // We've looped threw all the possible types and it's not available
                rarity = "common";
            }
        }

        this.rarity = rarity;
    }

    get open() {
        // Maybe have a chance to fail in general and not give anything
        let itemPoolWeCanWinFrom = items[this.rarity];
        let winningNumber = random.integer(1,100);
        let currentChance = 0;
        for(x of itemPoolWeCanWinFrom){
            let currentItem = itemPoolWeCanWinFrom[x];
            if(currentItem.chanceToGet+currentChance >= winningNumber){
                // This is the item that won!
                var winningItem = currentItem;
            } else {
                // Didn't win :(
            }
        }
        console.log("Winning Item!");
        console.log(winningItem, "winningItem");
        return winningItem;

    }
}