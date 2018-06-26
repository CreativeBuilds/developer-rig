var app = require('express')();
var http = require('http').Server(app);


var fs = require("fs");

// UNCOMMENT THE ONE WITH HTTP IF YOU WANT HTTP, OR VISE VERSA (DONT FORGET TO GO TO THE BOTTOM OF THE PAGE AND SWAP THAT TOO!)


// var io = require('socket.io')(http);

var mysql = require('mysql')

var jwt = require('jsonwebtoken');

var config = require('./config.json');

var io = require('socket.io');

var upgradeList = require('./upgrades.json');

var connection = mysql.createConnection({
    host: config.mysql.host,
    user: config.mysql.user,
    password: config.mysql.password,
    database: config.mysql.database
});

connection.connect(function (err) {
    if (err) {
        console.error('error connecting: ' + err.stack);
        return;

    } else {

        connection.query("CREATE TABLE users (id INT AUTO_INCREMENT PRIMARY KEY, user_id VARCHAR(255), opaque_user_id VARCHAR(255), level INT, upgrade_points FLOAT, upgrades TEXT)", function (err, result) {
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

        function run(https) {
            // Import all extra stuff

            io.attach(https,{
                pingInterval: 10000,
                pingTimeout: 5000,
                cookie: false
            })

            const Boss = class Boss {
                //Initiates the boss
                constructor(name, floor, type, amountOfActivePlayers) {

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

                    let maxAmount = Object.keys(users).length;
                    let currentAmount = 0;

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
                amountOfActivePlayers = 1
            } = {}) {
                //This just gens a new boss
                console.log("Made a new boss");
                currentBoss = new Boss(name, floor, type, amountOfActivePlayers);
                console.log(io);
                io.emit('newBoss');
                io.emit('newFloor', floor);
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

            function selectFromTable(table, toSearch, toMatch, callback) {
                connection.query(`SELECT * FROM ` + table + ` WHERE ` + toSearch + ` = '` + toMatch + `'`, callback);
            }

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
                            connection.query(`INSERT INTO users (user_id, opaque_user_id, level, upgrade_points, upgrades) VALUES ('${decoded.user_id}','${decoded.opaque_user_id}',1,0,'${JSON.stringify(returnLevelUpgradeList(upgradeList))}')`, function (err, result) {
                                if (err) {
                                    callback(err, null);
                                } else {
                                    getOrMakeUser(decoded, callback);
                                }
                            })
                        } else {
                            result[0].upgrades = JSON.parse(result[0].upgrades);
                            callback(null, result[0]);
                        }
                    }
                })
            }

            //Returns a user object not an array!
            function getUserWithUsername(username, callback) {
                selectFromTable('users', 'user_id', username, function (err, result) {
                    if (err) {
                        callback(err, null);
                    } else if (result.length === 0) {
                        callback(null, {});
                    } else {
                        callback(null, result[0]);
                    }
                })
            }

            //Returns an error if it fails, if not it returns true! (Through callback)
            function updateAUsersProperty(username, field, info, callback) {
                getUserWithUsername(username, function (err, user) {
                    if (err) {
                        callback(err, null);
                    } else {
                        connection.query(`UPDATE users SET ${field} = '${info}' WHERE user_id = '${username}'`, function (err, result) {
                            if (err) {
                                callback(err, null);
                            } else {
                                callback(null, true);
                            }
                        })
                    }
                })
            }

            function getPropertyOfAUser(username, property, callback) {
                getUserWithUsername(username, function (err, user) {
                    if (err) {
                        callback(err, null);
                    } else {
                        callback(err, user[property]);
                    }
                })
            }

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





            // Deal the passive damage for everyone in the stream once a second! TODO (May have to move this setInterval internally)
            setInterval(function () {
                currentBoss.idleDamage(users);
            }, 1000);

            function getUser(userID) {
                //Return a user object
            }

            let users = {};

            let socketUsers = {};

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
                    let secret = new Buffer.from(config.secret, 'base64');
                    jwt.verify(token, secret, function (err, decoded) {
                        if (err) {
                            console.log(err);
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
                                            let upgrades = addUpgradeInfoBack(result.upgrades, upgradeList, decoded.user_id);
                                            users[decoded.user_id] = new User(decoded.user_id, result.level, 0, 0, upgrades);
                                            socketUsers[decoded.user_id] = [socket];

                                            socket.emit('verified');
                                            socket.emit('upgradeList', upgrades);
                                            socket.emit('newFloor', currentBoss.floor);
                                        }
                                    })

                                } else {

                                    getOrMakeUser(decoded, function (err, result) {
                                        if (err) {
                                            throw err;
                                        } else {
                                            let upgrades = addUpgradeInfoBack(result.upgrades, upgradeList, decoded.user_id);
                                            socketUsers[decoded.user_id].push(socket);
                                            socket.emit('verified');
                                            socket.emit('upgradeList', upgrades);
                                            socket.emit('newFloor', currentBoss.floor);
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

            // http.listen(4000, function () {
            //     console.log('listening on *:4000');
            // });

            https.listen(80, function () {
                console.log("https is listening on *:80");
            })



        }

        if (config.useHTTP) {
            io = io(http);
            http.listen(4000, function () {
                console.log('http is listening on *:4000');
                run(http, io);
            })
        } else {
            config.httpsSettings.express = app;
            config.httpsSettings.logFunction = function (message) {
                console.log(message);
            }
            config.httpsSettings.io = require('socket.io');
            
            require("./custom/greenlock-express-wrapper.js").listen(config.httpsSettings, function (server) {
                run(server, io)
            });
        }


    }
});