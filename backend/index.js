var app = require('express')();
var http = require('http').Server(app);

var https = require('https');

var cors = require('cors');

var Random = require("random-js");
var random = new Random(Random.engines.mt19937().autoSeed());

app.use(cors({
    origin: "https://localhost.rig.twitch.tv:8081"
}))

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "https://localhost.rig.twitch.tv:8081");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

var fs = require("fs");

var mysql = require('mysql');

var db = require('./imports/db.js');

var jwt = require('jsonwebtoken');

var config = require('./config.json');

var upgradeList = require('./upgrades.json');

var MainHand = require('./imports/mainHand.js');
var OffHand = require('./imports/offHand.js');
var Head = require('./imports/head.js');
var Breastplate = require('./imports/breastplate.js');
var Legs = require('./imports/legs.js');
var Feet = require('./imports/feet.js');
var Crate = require('./imports/crate.js');

db.connect(null, function () {
    let connection = db.get();

    let makeItem = function(item){
        return new Promise(function(resolve, reject){
            if(typeof item === "string"){
                item = JSON.parse(item);
            }
            switch (item.type) {
                case "mainHand":
                    resolve(new MainHand(item));
                    break;
                case "offHand":
                    resolve(new OffHand(item));
                    break;
                case "head":
                    resolve(new Head(item));
                    break;
                case "breastplate":
                    resolve(new Breastplate(item));
                    break;
                case "legs":
                    resolve(new Legs(item));
                    break;
                case "feet":
                    resolve(new Feet(item));
                    break;
                case "crate":
                    resolve(new Case(item));
                default:
                    console.log(item.type, item);
                    reject("Type not compatible");
            }
        })
    }

    connection.query("CREATE TABLE users (id INT AUTO_INCREMENT PRIMARY KEY, user_id VARCHAR(255), opaque_user_id VARCHAR(255), level INT, upgrade_points FLOAT, gems INT, upgrades TEXT, inventory TEXT, equippedItems TEXT)", function (err, result) {
        if (err) {
            // If the table exits (do nothing);
            if (err.message.includes("already exists")) {
                console.log("Table exists")
            } else {
                console.log(err.message);
                throw err;
            }
        }
    })

    app.get('/', function (req, res) {
        res.send('<h1>Hello world</h1>');
    });

    let io = null;

    let users = {};

    let socketUsers = {};

    let findItemInInventory = function(item, inventory){
        if(typeof inventory === "string"){
            inventory = JSON.parse(inventory);
        }
        if(typeof item === "string"){
            let uuid =  item;
            return new Promise(function(resolve, reject){
                for(let x = 0; x < inventory.length; x++){
                    if(inventory[x].uuid === uuid){
                        resolve(inventory[x])
                        return;
                    } else if(x + 1 >= inventory.length) {
                        resolve(null);
                    }
                }
            })
        } else if(typeof item === "object"){
            return new Promise(function(resolve, reject){
                for(let x = 0; x < inventory.length; x++){
                    // console.log("looping inventory", inventory[x], inventory[x].uuid, item.uuid);
                    if(inventory[x].uuid === item.uuid){
                        resolve(inventory[x])
                    } else if(x + 1 >= inventory.length) {
                        resolve(null);
                    }
                }
            })
        }
        
    }

    const Boss = class Boss {
        //Initiates the boss
        constructor(name, floor, rarity, amountOfActivePlayers, secondsTillDeath = 60) {

            // All of these are variables for each boss, more can be added
            this.name = name;
            console.log(floor);
            console.log(amountOfActivePlayers);
            this.health = 100 * floor * amountOfActivePlayers;
            this.totalHealth = this.health;
            this.floor = floor;
            this.rewardUpgradePoints = floor; //TODO Remove this as a hardcode and make it a changeable variable;
            this.usersWhoHelped = {};
            this.floor = floor;
            this.rarity = rarity;
            let thisBoss = this;
            this.timeUntilFinished = Date.now() + (secondsTillDeath * 1000)
            this.usersLost = function () {
                Object.keys(users).forEach(function (user_id) {
                    //TODO Currently this will reward everyone in the stream (we may want to develop a system in-which the people who do more damage get more points)

                    let sockets = seeIfUserHasASocketConnected(user_id, socketUsers);
                    sockets.forEach(function (socket) {
                        console.log("Emitting to the sockets!");
                        socket.emit("bossWon")
                    });
                })

                generateNewBoss({
                    name: "John",
                    floor: 1,
                    "amountOfActivePlayers": Object.keys(thisBoss.usersWhoHelped).length
                });
            }
            this.expires = setTimeout(function () {
                this.usersLost();
            }.bind(this), 60*1000)
        }

        damage(usersDamage, user_id) {
            if (user_id === "undefined" || typeof user_id === "undefined") return;
            let thisBoss = this;
            console.log("dealing damage to the boss, current health:", this.health, user_id);

            if (this.health === 0) return;
            console.log("Got past this!")
            if (this.health - usersDamage < 0) {
                console.log("Health is set to 0!");
                this.health = 0;
            } else {
                console.log()
                this.health = this.health - usersDamage;
            }
            if (!thisBoss.usersWhoHelped[user_id]) {
                thisBoss.usersWhoHelped[user_id] = {
                    "passiveDamage": 0,
                    "activeDamage": usersDamage
                };
            } else {
                thisBoss.usersWhoHelped[user_id].activeDamage = thisBoss.usersWhoHelped[user_id].activeDamage + usersDamage;
            }
            if (thisBoss.testIfKilled()) {
                thisBoss.handleDeath();
            }
        }

        // Returns a boolean value (true = dead false = still alive)
        testIfKilled() {
            if (this.health <= 0) {
                return true;
            } else {
                return false;
            }
        }

        // Basically just reward users
        handleDeath() {
            console.log("You just beat a man to death...... GOOD JOB!!!");
            console.log("----------------------------------------------");
            console.log(this.usersWhoHelped);
            console.log("----------------------------------------------");
            let thisBoss = this;
            clearTimeout(this.expires);

            let maxAmount = Object.keys(users).length;
            let currentAmount = 0;


            let chanceToGetCrateFunction = function () {
                // These are stats out of 100 for each user to get a type of crate
                switch (thisBoss.type) {
                    case "common":
                        return 50;
                    case "uncommon":
                        return 40;
                    case "rare":
                        return 25;
                    case "epic":
                        return 15;
                    case "legendary":
                        return 5;
                    case "mythic":
                        return 2;
                }
                return 0;
            };

            let chanceToGetCrate = chanceToGetCrateFunction();

            let usersWhoHelped = this.usersWhoHelped;
            Object.keys(usersWhoHelped).forEach(function (user) {
                // TODO Change >= to >
                if (usersWhoHelped[user].activeDamage >= 0) {
                    if (random.integer(1, 1000) <= 25) {
                        getPropertyOfAUser(user, "gems", function (err, gems) {
                            updateAUsersProperty(user, "gems", gems + 1, function (err) {
                                if (err) return;
                                console.log("USER JUST GOT GEMS!");
                            })
                        })

                    }
                }
            })

            Object.keys(users).forEach(function (user_id) {
                //TODO Currently this will reward everyone in the stream (we may want to develop a system in-which the people who do more damage get more points)
                getPropertyOfAUser(user_id, "upgrade_points", function (err, points) {
                    if (err) {
                        throw err;
                    } else {
                        users[user_id].upgradePoints = points + thisBoss.rewardUpgradePoints;
                        updateAUsersProperty(user_id, "upgrade_points", points + thisBoss.rewardUpgradePoints, function (err, isTrue) {
                            if (err) throw err;
                            if (isTrue) {
                                console.log("Successfully updated the users points!");
                                currentAmount++;
                                if (currentAmount === maxAmount) {
                                    console.log("Amount of users who've helped!", Object.keys(thisBoss.usersWhoHelped).length);
                                    generateNewBoss({
                                        name: "John",
                                        floor: thisBoss.floor + 1,
                                        "amountOfActivePlayers": Object.keys(thisBoss.usersWhoHelped).length
                                    });
                                }
                            }
                        });

                    }
                })

                if (random.integer(1, 100) >= 50) {
                    // Only do this if the user wins a crate.
                    db.parseInventory(user_id, function (err, inventory) {
                        if (err) {
                            return;
                        } else {

                            let done = false;

                            for (let x = 0; x < inventory.length; x++) {
                                // console.log("X:", x);
                                if (!inventory[x]) continue;
                                if (!thisBoss) continue;
                                if (inventory[x].rarity === thisBoss.rarity && inventory[x].type === "crate" && !done && inventory[x].stackSize < 10000) {
                                    inventory[x].stackSize = inventory[x].stackSize + 1;
                                    done = true;
                                } else if (x + 1 === inventory.length && !done) {
                                    inventory.push(new Crate({
                                        "rarity": thisBoss.rarity
                                    }));
                                }
                            }

                            if (inventory.length === 0) {
                                inventory.push(new Crate({
                                    "rarity": thisBoss.rarity
                                }));
                            }

                            db.updateAUsersProperty(user_id, "inventory", inventory, function (err, bool) {
                                if (err) return;
                                if (bool) {
                                    console.log(user_id, 'got a crate of rarity:', thisBoss.rarity);
                                    let sockets = seeIfUserHasASocketConnected(user_id, socketUsers);
                                    sockets.forEach(function (socket) {
                                        console.log("Emitting to the sockets!");
                                        socket.emit("newCrate");
                                        socket.emit("inventory", inventory);
                                    })
                                }

                            })



                        }
                    })
                }



            })
        }

        // Do idle damage for everyone in the stream
        idleDamage(users) {
            let thisBoss = this;
            if (thisBoss.health === 0) return;
            let maxNum = Object.keys(users);
            let currentNum = 0;
            Object.keys(users).forEach(function (user_id) {
                if (user_id === "undefined" || typeof user_id === "undefined") return;
                if (!users[user_id].isActive) return;
                let passiveDamage = users[user_id].passiveDamage;
                if (thisBoss.health - passiveDamage < 0) {
                    console.log("Health is set to 0!");
                    thisBoss.health = 0;
                } else {
                    thisBoss.health = thisBoss.health - passiveDamage;
                }
                currentNum++;
                if (!thisBoss.usersWhoHelped[user_id]) {
                    thisBoss.usersWhoHelped[user_id] = {
                        "passiveDamage": passiveDamage,
                        "activeDamage": 0
                    };
                    console.log("set passiveDamage");
                } else {
                    thisBoss.usersWhoHelped[user_id].passiveDamage = thisBoss.usersWhoHelped[user_id].passiveDamage + passiveDamage;
                    console.log("updated passiveDamage", thisBoss.usersWhoHelped[user_id], user_id)
                }
                if (thisBoss.testIfKilled()) {
                    console.log("Should be killed!");
                    thisBoss.handleDeath();
                }
            })
        }

        // returns the current health of the boss
        get getHealth() {
            return this.health;
        }

        get getTotalHealth() {
            return this.totalHealth;
        }
    };

    const User = class User {
        constructor(user_id, level, passiveDamage, upgradePoints = 0, usersUpgradeList = upgradeList) {
            this.user_id = user_id;
            this.level = level;
            this.upgradePoints = upgradePoints;
            this.upgradeList = usersUpgradeList;
            this.isActive = false;
            this.damageFromUpgrade = function (upgrade) {
                return calculateDamage(upgrade.level, upgrade.baseDamageMultiplierPercentage, upgrade.baseDamage, upgrade.additionalDamage);
            }
        }

        static getUser(listOfUsers, user_id) {
            //gets a user object from a list of users
            return listOfUsers[user_id];
        }

        get activeDamage() {
            if (!this.isActive) return 0;
            let totalDamage = 0;
            let list = returnUpgradesWithType(this.upgradeList, "active");
            let thisCopy = this;
            list.forEach(function (upgrade) {
                totalDamage = totalDamage + thisCopy.damageFromUpgrade(upgrade);
            })
            thisCopy = null;
            return totalDamage;
        }

        get passiveDamage() {
            if (!this.isActive) return 0;
            let totalDamage = 0;
            let list = returnUpgradesWithType(this.upgradeList, "passive");
            let thisCopy = this;
            list.forEach(function (upgrade) {
                totalDamage = totalDamage + thisCopy.damageFromUpgrade(upgrade);
            })
            thisCopy = null;
            return totalDamage


        }
    }

    // returns the position of the upgrade in the array provided
    function findUpgradeInList(list, find) {
        return list[find];
    }

    // Takes a list of upgrades and returns a list of ones that match "type"
    function returnUpgradesWithType(list, type) {
        let tempList = [];
        let max = Object.keys(list).length;
        let tempPoints = 0;
        Object.keys(list).forEach(function (upgrade) {
            if (list[upgrade].type === type) {
                tempList.push(list[upgrade]);
            }

        })
        return tempList;
    }

    //users is an object of all the users online
    //their twitch username is tied to a list of all of their sockets
    //
    //This will return null/undefined if their is no sockets!
    function seeIfUserHasASocketConnected(username, users) {
        return users[username];
    }

    //Is working
    function returnASocketFromAListOfSockets(list, find) {
        for (socket of list) {
            if (socket.id === find.id) {
                return socket;
            }
        }
        return null;
    }

    function removeObjFromArray(arr, obj) {
        console.log(arr.length);
        for (let int = 0; int < arr.length; int++) {
            let item = arr[int];
            if (item === obj) {
                arr.splice(int, 1);
                int--;
            }
        }
        return arr;
    }

    // TODO make a function that will generate a 'boss name'
    // TODO maybe calculate rewardUpgradePoints/health based on floor

    // Types
    /*
        Common
        Uncommon
        Rare
        Epic
        Legendary
        Mythical
    */

    function generateNewBoss({
        name = "John",
        floor = 1,
        type = "common",
        amountOfActivePlayers = 1,
        secondsTillDeath = 60
    } = {}) {
        //This just gens a new boss
        currentBoss = new Boss(name, floor, type, amountOfActivePlayers, secondsTillDeath);

        try {
            io.emit('newBoss');
            console.log("Time Until Finished", Date.now() + (secondsTillDeath * 1000));
            io.emit('newFloor', {floorNum:floor,timeUntilFinished:currentBoss.timeUntilFinished});
        } catch (err) {
            console.log(err, io);
        }

    }
    generateNewBoss();


    function calculateCost(currentLevel, increasePerLevel, baseCost) {
        if (currentLevel === 0) {
            return baseCost;
        }
        return Math.floor(baseCost * Math.pow(currentLevel, increasePerLevel) * 100) / 100;
    }

    function calculateDamage(currentLevel, increasePerLevel, baseDamage, additionalDamage) {
        return Math.floor(((baseDamage * Math.pow(currentLevel, increasePerLevel)) + additionalDamage) * 100) / 100;
    }

    // function to test and see if a user has enough points to unlock the next level of their upgrade.
    function userCanPurchaseUpgrade(user_id, upgradeName, users) {
        if (!users[user_id]) return;
        let user = users[user_id];
        if (!user.upgradeList[upgradeName]) return;
        let upgrade = user.upgradeList[upgradeName];
        if (user.upgradePoints >= calculateCost(upgrade.level, upgrade.baseCostMultiplierPercentage, upgrade.baseCostToUpgrade)) {
            return true;
        } else {
            return false;
        }
    }

    function userPurchasedUpgrade(user_id, upgradeName, users) {
        if (!users[user_id]) return false;
        let user = users[user_id];
        if (!user.upgradeList[upgradeName]) return false;
        let upgrade = user.upgradeList[upgradeName];
        let upgradeCost = calculateCost(upgrade.level, upgrade.baseCostMultiplierPercentage, upgrade.baseCostToUpgrade);
        if (user.upgradePoints >= upgradeCost) {
            //Emit to the socket their new points
            user.upgradePoints = user.upgradePoints - upgradeCost;
            user.upgradeList[upgradeName].level = upgrade.level + 1;
            updateAUsersProperty(user_id, "upgrade_points", user.upgradePoints, function (err, updated) {
                if (err) throw err;
                if (updated) console.log("Updated the points after the user purchased an upgrade!");
            })
            updateAUsersProperty(user_id, "upgrades", JSON.stringify(user.upgradeList), function (err, updated) {
                if (err) throw err;
                if (updated) console.log("Updated the upgrades after the user purchased an upgrade!");
            })

            return true;
        } else {
            return false;
        }
    }

    selectFromTable = db.selectFromTable;

    // Will take a object in the form of upgrade.json and strip everything except the levels (useful for saving in the database))
    function returnLevelUpgradeList(list) {
        let tempObj = {};
        Object.keys(list).forEach(function (upgrade_name) {
            tempObj[upgrade_name] = {
                "level": list[upgrade_name].level
            };
        })
        console.log("Returning", tempObj);
        return tempObj;
    }

    function addUpgradeInfoBack(listFromDatabase, list, username) {
        let haveToUpdate = false;
        Object.keys(list).forEach(function (upgrade_name) {
            if (!listFromDatabase[upgrade_name]) {
                haveToUpdate = true;
                listFromDatabase[upgrade_name].level = list[upgrade_name].level;
            } else {
                list[upgrade_name].level = listFromDatabase[upgrade_name].level;
            }
        })
        if (haveToUpdate && username) {
            updateAUsersProperty(username, "upgrades", listFromDatabase);
        }
        console.log("returning", list);
        return list;
    }

    function getOrMakeUser(decoded, callback) {
        selectFromTable('users', 'opaque_user_id', decoded.opaque_user_id, function (err, result) {
            if (err) {
                callback(err, null);
            } else {
                if (result.length === 0) {
                    // User doesn't exist (make the user!)
                    let inventory = [];
                    let equippedItems = {
                        "head":{},
                        "breastplate":{},
                        "legs":{},
                        "feet":{},
                        "mainHand":{},
                        "offHand":{}
                    };
                    connection.query(`INSERT INTO users (user_id, opaque_user_id, level, upgrade_points, gems, upgrades, inventory, equippedItems) VALUES ('${decoded.user_id}','${decoded.opaque_user_id}',1,0,100,'${JSON.stringify(returnLevelUpgradeList(upgradeList))}','${JSON.stringify(inventory)}','${JSON.stringify(equippedItems)}')`, function (err, result) {
                        if (err) {
                            callback(err, null);
                        } else {
                            getOrMakeUser(decoded, callback);
                        }
                    })
                } else {
                    result[0].upgrades = JSON.parse(result[0].upgrades);
                    result[0].equippedItems = JSON.parse(result[0].equippedItems);
                    callback(null, result[0]);
                }
            }
        })
    }

    //Returns a user object not an array!
    var getUserWithUsername = db.getUserWithUsername;


    //Returns an error if it fails, if not it returns true! (Through callback)
    var updateAUsersProperty = db.updateAUsersProperty;
    var getPropertyOfAUser = db.getPropertyOfAUser;

    function sendAMessageToAllOfAUsersSockets(user_id, messageName, infoToSend, users) {
        for (socket of users[user_id]) {
            socket.emit(messageName, infoToSend);
        }
    }

    function getUsersClickDamage(username, callback) {
        getPropertyOfAUser(username, "upgrades", function (err, upgrades) {
            if (err) {
                callback(err, null);
            } else {
                let parsedUpgrades = JSON.parse(upgrades);
                let clickDamage = parsedUpgrades['Click Damage'];

                callback(null, calculateDamage(clickDamage.level, clickDamage.baseDamageMultiplierPercentage, clickDamage.baseDamage, clickDamage.additionalDamage));
            }
        })
    }

    setInterval(function () {
        currentBoss.idleDamage(users);
    }, 1000);

    function setupIO(https, callback) {


        io = require('socket.io')(https);

        setInterval(function () {
            io.sockets.emit("bossInfo", {
                "health": currentBoss.getHealth,
                "totalHealth": currentBoss.getTotalHealth
            })
        }, 1000)


        io.on('connection', function (socket) {
            console.log('a user connected');

            // have an array called clicks which is an array of Date.now()'s then compare a new value with the first value in the array (if there are 10 items in the array)
            let clicks = [];

            // User is verifying after connecting! (Tie their socket id with their twitch account!)
            socket.on('verify', token => {
                //Use JWT to verify the token

                if (typeof token === "string") {
                    var tokenSecret = config.secret;
                    var type = "overlay";
                } else {
                    if (token.type === "panel") {
                        var tokenSecret = config.panelSecret;
                        var type = "panel";
                    } else {
                        var tokenSecret = config.secret;
                        var type = "overlay";
                    }
                    token = token.token;
                }

                let secret = new Buffer.from(tokenSecret, 'base64');
                jwt.verify(token, secret, function (err, decoded) {
                    if (err) {
                        console.log(err);
                        socket.disconnect(0)
                    } else {
                        if (decoded.opaque_user_id[0] !== 'U') {
                            //The user is not logged into twitch, dont allow them to do anything
                            socket.disconnect(0);
                        } else if (!decoded.user_id) {
                            // User has not shared their identity with us, dont allow them do do anything
                            console.log("user did not share identity with us!")
                            socket.emit('shareIdentity');
                            socket.disconnect(0);
                        } else {
                            //User has shared their identity with us!
                            socket.user_id = decoded.user_id;
                            if (!seeIfUserHasASocketConnected(decoded.user_id, socketUsers)) {
                                //User is connecting for the first time
                                // TODO if the user doesn't have all of the upgrades from the upgradeList then we need to update it!
                                getOrMakeUser(decoded, function (err, result) {
                                    if (err) {
                                        throw err;
                                    } else {
                                        //socket.type = type;
                                        let upgrades = addUpgradeInfoBack(result.upgrades, upgradeList, decoded.user_id);
                                        users[decoded.user_id] = new User(decoded.user_id, result.level, 0, 0, upgrades);
                                        socketUsers[decoded.user_id] = [socket];

                                        socket.emit('verified');
                                        socket.emit('upgradeList', upgrades);
                                        socket.emit('newFloor', {floorNum:currentBoss.floor,timeUntilFinished: currentBoss.timeUntilFinished});
                                        socket.emit('inventory', JSON.parse(result.inventory));
                                        socket.emit('equippedItems', result.equippedItems);  
                                        socket.emit('gems', result.gems || 0);
                                    }
                                })

                            } else {

                                getOrMakeUser(decoded, function (err, result) {
                                    if (err) {
                                        throw err;
                                    } else {
                                        //socket.type = type;
                                        let upgrades = addUpgradeInfoBack(result.upgrades, upgradeList, decoded.user_id);
                                        socketUsers[decoded.user_id].push(socket);
                                        socket.emit('verified');
                                        socket.emit('upgradeList', upgrades);
                                        socket.emit('newFloor', {floorNum:currentBoss.floor,timeUntilFinished: currentBoss.timeUntilFinished});
                                        socket.emit('inventory', JSON.parse(result.inventory));
                                        socket.emit('equippedItems', result.equippedItems);  
                                        socket.emit('gems', result.gems || 0);
                                    }
                                })
                            }
                        }
                    }
                });
            })

            // This is a video overlay trying to get info about all current stats (boss)
            socket.on('getVideoOverlayInfo', () => {
                console.log("got request for info sending back info!")
                socket.emit("bossInfo", {
                    "health": currentBoss.getHealth,
                    "totalHealth": currentBoss.getTotalHealth
                })
            })

            socket.on('purchaseCrate', (item) => {
                console.log("got purchase crate")
                if (!item) return;
                db.getPropertyOfAUser(socket.user_id, "gems", function (err, gems) {
                    if (err) return;
                    if (!gems) return;
                    db.parseInventory(socket.user_id, function (err, inventory) {
                        if (err) return;
                        let done = false;
                        for (let x = 0; x < inventory.length; x++) {
                            let dbItem = inventory[x];
                            // console.log(dbItem, item, done, inventory, x);
                            if (dbItem.name === item.name && dbItem.type === item.type && dbItem.type === "crate" && done === false) {
                                // This is the matching crate!
                                done = true;

                                // User doesn't have enough
                                if (dbItem.unlockAmount > gems) return;
                                if (Math.floor(gems - dbItem.unlockAmount) < 0) return;
                                db.updateAUsersProperty(socket.user_id, "gems", Math.floor(gems - dbItem.unlockAmount), function (err) {
                                    if (err) return;
                                    let crate = new Crate({
                                        rarity: dbItem.rarity
                                    });
                                    crate.open.then(function (crateItem) {
                                        // TODO update cases to actually make the right item
                                        console.log(crateItem.baseCost);
                                        switch (crateItem.type) {
                                            case "mainHand":
                                                var itemObject = new MainHand({
                                                    name: crateItem.name,
                                                    level: 1,
                                                    rarity: crateItem.rarity,
                                                    baseCost: crateItem.baseCost,
                                                    baseDamage: crateItem.baseDamage,
                                                    imageLocation: crateItem.imageLocation || ''
                                                });
                                                break;
                                            case "offHand":
                                                var itemObject = new OffHand({
                                                    name: crateItem.name,
                                                    level: 1,
                                                    rarity: crateItem.rarity,
                                                    baseCost: crateItem.baseCost,
                                                    baseDamage: crateItem.baseDamage,
                                                    imageLocation: crateItem.imageLocation || ''
                                                });
                                                break;
                                            case "head":
                                                var itemObject = new Head({
                                                    name: crateItem.name,
                                                    level: 1,
                                                    rarity: crateItem.rarity,
                                                    baseCost: crateItem.baseCost,
                                                    baseProtection: crateItem.baseProtection,
                                                    imageLocation: crateItem.imageLocation || ''
                                                });
                                                break;
                                            case "breastplate":
                                                var itemObject = new Breastplate({
                                                    name: crateItem.name,
                                                    level: 1,
                                                    rarity: crateItem.rarity,
                                                    baseCost: crateItem.baseCost,
                                                    baseProtection: crateItem.baseProtection,
                                                    imageLocation: crateItem.imageLocation || ''
                                                });
                                                break;
                                            case "legs":
                                                var itemObject = new Legs({
                                                    name: crateItem.name,
                                                    level: 1,
                                                    rarity: crateItem.rarity,
                                                    baseCost: crateItem.baseCost,
                                                    baseProtection: crateItem.baseProtection,
                                                    imageLocation: crateItem.imageLocation || ''
                                                });
                                                break;
                                            case "feet":
                                                var itemObject = new Feet({
                                                    name: crateItem.name,
                                                    level: 1,
                                                    rarity: crateItem.rarity,
                                                    baseCost: crateItem.baseCost,
                                                    baseProtection: crateItem.baseProtection,
                                                    imageLocation: crateItem.imageLocation || ''
                                                });
                                                break;
                                        }
                                        inventory[x].stackSize = inventory[x].stackSize - 1;
                                        if (inventory[x].stackSize === 0) {
                                            inventory.splice(x, 1);
                                        }
                                        inventory.push(itemObject);

                                        // TODO Change this so it sends an animation to the overlay before sending to the inventory tab

                                        socket.emit("inventory", inventory);
                                        socket.emit("gems", gems);
                                        db.updateAUsersProperty(socket.user_id, "inventory", inventory, function (err) {
                                            if (err) {
                                                console.error("There was an error giving the use the item they got from the crate!");
                                            } else {
                                                console.log("User got a ", crateItem.name);
                                            }
                                        })
                                    })
                                })


                            }
                        }
                    })
                })
            })

            socket.on('equip', (item) => {
                // Get the users current inventory
                if(item.type === "case") return;
                db.getPropertyOfAUser(socket.user_id, "inventory", function(err, inventory){
                    if(err) return;
                    if(!inventory) return;
                    inventory = JSON.parse(inventory);
                    findItemInInventory(item, inventory).then((dbItem)=>{
                        if(!item) return;
                        if(!dbItem) return;
                        if(dbItem.type === "case") return;
                        db.getPropertyOfAUser(socket.user_id, "equippedItems", function(err, equippedItems){
                            if(err) return;
                            if(!equippedItems) equippedItems = {};
                            if(typeof equippedItems === "string"){
                                equippedItems = JSON.parse(equippedItems);
                            }
                            inventory.splice(inventory.indexOf(dbItem),1);
                            let finish = function(){
                                db.updateAUsersProperty(socket.user_id, "equippedItems", equippedItems, function(){});
                                db.updateAUsersProperty(socket.user_id, "inventory", inventory, function(){});
                                socket.emit("inventory", inventory);
                                socket.emit("equippedItems", equippedItems);
                            }
                            if(equippedItems[dbItem.type]){
                                if(typeof equippedItems[dbItem.type] === "string"){
                                    equippedItems[dbItem.type] = JSON.parse(equippedItems[dbItem.type]);
                                }
                                if(Object.keys(equippedItems[dbItem.type]).length === 0){
                                    finish();
                                    return;
                                } else {
                                    console.log(equippedItems[dbItem.type], typeof equippedItems[dbItem.type], dbItem.type, equippedItems);
                                    makeItem(equippedItems[dbItem.type]).then((item)=>{
                                        inventory.push(item);
                                        equippedItems[dbItem.type] = dbItem;
                                        finish();
                                    }).catch((err)=>{
                                        console.log(err);
                                        return;
                                    })
                                }
                            } else {
                                equippedItems[dbItem.type] = dbItem;
                                finish();
                            }
                            
                        })
                    })

                })
            })

            //TODO find a socket based on socket id

            // User clicked the screen (This is how we will detect when people click the boss)
            // TODO im going to have to add support so people can't spam more than 10 clicks a second
            socket.on('screenClicked', function () {

                if (clicks.length === 10) {
                    //Max amount has been reached (see if the most recent click is atleast 1000 milliseconds older than the first item in that array)
                    if (Date.now() - clicks[9] > 100) {
                        //User can click otherwise throw away this click!
                        console.log("User verified click!");
                        clicks.splice(0, 1);
                        clicks.push(Date.now());
                        //Get the user object and run damage against the boss
                        let userObject = User.getUser(users, socket.user_id);
                        currentBoss.damage(userObject.activeDamage, socket.user_id);
                    } else {
                        console.log("Threw away the click!");
                    }
                } else {
                    console.log(clicks);
                    clicks.push(Date.now());
                    let userObject = User.getUser(users, socket.user_id);
                    if (userObject) {
                        currentBoss.damage(userObject.activeDamage, socket.user_id);
                    }

                }
            })

            // User is now requesting their current upgradePoints because the boss was killed!
            socket.on('getUpgradePoints', function () {
                // Get the users info by socket.user_id and send them back their upgrade points
                getPropertyOfAUser(socket.user_id, "upgrade_points", function (err, points) {
                    if (err) {} else {
                        if (!users[socket.user_id]) return;
                        users[socket.user_id].upgradePoints = points;
                        socket.emit("currentUpgradePoints", points)
                    }

                })

            })

            // User is requesting to purchase an upgrade!
            socket.on('purchaseUpgrade', function (upgradeName) {
                // Test to see if the user can purchase this upgrade with their current points

                if (userCanPurchaseUpgrade(socket.user_id, upgradeName, users)) {
                    console.log("User can purchase this upgrade!");
                    if (userPurchasedUpgrade(socket.user_id, upgradeName, users)) {
                        sendAMessageToAllOfAUsersSockets(socket.user_id, "currentUpgradePoints", users[socket.user_id].upgradePoints, socketUsers);
                        let upgrade = users[socket.user_id].upgradeList[upgradeName];
                        upgrade.name = upgradeName;
                        sendAMessageToAllOfAUsersSockets(socket.user_id, "purchasedUpgrade", upgrade, socketUsers);
                    }
                } else {
                    console.log("User can't purchase this upgrade!");
                }
            })

            socket.on('joinFight', function () {
                if (socket.user_id) {
                    if (!users[socket.user_id]) return;
                    users[socket.user_id].isActive = true;
                    socket.emit("joinedFight");
                }
            })

            socket.on('disconnect', function () {
                if (socket.user_id) {
                    if (!seeIfUserHasASocketConnected(socket.user_id, socketUsers)) {
                        // console.log("Returned!");
                        return;
                    }
                    //user was on user list!
                    if (!returnASocketFromAListOfSockets(socketUsers[socket.user_id], socket)) {
                        //Error occured this shouldn't happen
                        // console.log("Error!!!!!!");
                    } else {
                        //Delete the socket from the users array
                        // console.log(users[socket.user_id].length)
                        let oldSocket = returnASocketFromAListOfSockets(socketUsers[socket.user_id], socket)
                        removeObjFromArray(socketUsers[socket.user_id], oldSocket);
                        // console.log(users[socket.user_id].length)
                    }
                    if (socketUsers[socket.user_id].length === 0) {
                        //No more sockets connected!
                        delete socketUsers[socket.user_id];
                        // console.log("User is fully disconnected!", users);
                    } else {
                        //There are still sockets connected
                        //console.log(users[socket.user_id]);
                    }
                    // console.log("Removed a socket from the user connected!");
                } else {
                    // console.log("No socket.user_id?", socket.user_id);
                    return;
                }
            })

        });

        callback(https);
    }

    function run() {
        // Import all extra stuff

        // http.listen(4000, function () {
        //     console.log('listening on *:4000');
        // });

        if (config.useHTTP) {
            setupIO(function (http) {
                http.listen(4000, function () {
                    console.log('http is listening on *:4000');
                })
            })
        } else {
            config.httpsSettings.express = app;
            config.httpsSettings.logFunction = function (message) {
                console.log(message);
            }
            config.httpsSettings.https = https;
            config.httpsSettings.setupIO = setupIO;
            //Should launch the https server
            require("./custom/greenlock-express-wrapper.js").listen(config.httpsSettings);
        }
    }


    run()



})

// connection.connect(function (err) {
//     if (err) {
//         console.error('error connecting: ' + err.stack);
//         return;

//     } else {}
// });