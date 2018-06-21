var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var jwt = require('jsonwebtoken');

var config = require('./config.json');

var upgradeList = require('./upgrades.json');

app.get('/', function (req, res) {
    res.send('<h1>Hello world</h1>');
});

// Import all extra stuff
const Boss = class Boss {
    //Initiates the boss
    constructor(name, health, damagePerSecond) {

        // All of these are variables for each boss, more can be added
        this.name = name;
        this.health = health;
        this.totalHealth = health;
        this.damagePerSecond = damagePerSecond;
        this.rewardUpgradePoints = 1; //TODO Remove this as a hardcode and make it a changeable variable;

    }

    damage(usersDamage) {
        console.log("dealing damage to the boss, current health:", this.health);
        this.health = this.health - usersDamage;
        if (this.testIfKilled()) {
            this.handleDeath();
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

        let thisBoss = this;
        Object.keys(users).forEach(function (user_id) {
            //TODO Currently this will reward everyone in the stream (we may want to develop a system in-which the people who do more damage get more points)
            users[user_id].upgradePoints = users[user_id].upgradePoints + thisBoss.rewardUpgradePoints;
        })
        generateNewBoss();
    }

    // Do idle damage for everyone in the stream
    idleDamage(users) {
        let thisBoss = this;
        Object.keys(users).forEach(function (user_id) {
            let passiveDamage = users[user_id].passiveDamage;
            console.log(user_id, "is dealing passive damage to the boss, damage:", passiveDamage);
            thisBoss.damage(passiveDamage)
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
    constructor(user_id, level, activeDamage, passiveDamage, upgradePoints = 0) {
        this.user_id = user_id;
        this.level = level;
        this.activeDamage = activeDamage;
        this.passiveDamage = passiveDamage;
        this.upgradePoints = upgradePoints;
        this.upgradeList = upgradeList;
    }

    static getUser(listOfUsers, user_id) {
        //gets a user object from a list of users
        return listOfUsers[user_id];
    }
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

function generateNewBoss() {
    //This just gens a new boss
    currentBoss = new Boss("John", 100, 0);
    io.emit('newBoss');
}
generateNewBoss();

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
                console.log(decoded);
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
                        // In the future we want to get their user object by calling the database but for now we are using JSobjects
                        users[decoded.user_id] = new User(decoded.user_id, 1, 1, 0, 0)
                        socketUsers[decoded.user_id] = [socket];
                        socket.emit('verified');
                        socket.emit('upgradeList', upgradeList);
                    } else {
                        socketUsers[decoded.user_id].push(socket);
                        socket.emit('verified');
                        socket.emit('upgradeList', upgradeList);
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
                currentBoss.damage(userObject.activeDamage);
            } else {
                console.log("Threw away the click!");
            }
        } else {
            console.log(clicks);
            clicks.push(Date.now());
            let userObject = User.getUser(users, socket.user_id);
            if(userObject){
                currentBoss.damage(userObject.activeDamage);
            }
            
        }

        console.log(`${socket.user_id} has clicked the boss!`);
    })

    // User is now requesting their current upgradePoints because the boss was killed!
    socket.on('getUpgradePoints', function () {
        // Get the users info by socket.user_id and send them back their upgrade points
        socket.emit("currentUpgradePoints", users[socket.user_id].upgradePoints)
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

http.listen(4000, function () {
    console.log('listening on *:4000');
});