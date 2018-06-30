$(document).ready(function () {
    ////console.log("Document is ready!");
    ////console.log($("body"));
})



let window2 = window;


var app = angular.module('app', []);

let authCode = '';

window.Twitch.ext.onAuthorized(auth => {
    //console.log("Twitch verified!");
    authCode = auth;
})

app.controller('myCtrl', function ($scope) {

    let clicks = [];

    $scope.upgradePoints = 0;

    $scope.upgradeList = [];

    $scope.currentClickDamage = 1;
    $scope.currentIdleDamage = 0;

    var socket = io('https://twitchclickergame.com');

    socket.on('connect', function () {
        // Established a connection to the EBS
        // Send the EBS our token for it to verify!

        socket.on('verified', () => {
            //console.log("I'm verified")
            verified = true;
        })

        function verify() {
            if (authCode.token) {
                socket.emit('verify', authCode.token);
                socket.emit("getPanelInfo");
            } else {
                setTimeout(function () {
                    verify();
                }, 250)
            }
        }

        verify();

        socket.on("shareIdentity", () => {
            //The server needs the user to agree to share their identity, ask them!
            ////console.log("Server asked me to share identity with it");
            window2.Twitch.ext.actions.requestIdShare(function (one, two) {
                ////console.log("Something happened!");
                ////console.log(one, two);
                //TODO in the future when this is actually an extension make sure this works!
            })
        })

        socket.on('currentUpgradePoints', (currentUpgradePoints) => {
            $scope.upgradePoints = currentUpgradePoints;
        })

        socket.on('upgradeList', (upgradeList) => {
            //console.log("upgradeList", upgradeList, $scope.upgradeList);
            $scope.upgradeList = [];
            Object.keys(upgradeList).forEach(function (upgrade_name) {
                //TODO Currently this will reward everyone in the stream (we may want to develop a system in-which the people who do more damage get more points)
                upgradeList[upgrade_name].name = upgrade_name;
                let upgrade = upgradeList[upgrade_name];
                upgrade.currentDPS = $scope.calculateDamage(upgrade.level, upgrade.baseDamageMultiplierPercentage, upgrade.baseDamage, upgrade.additionalDamage);
                $scope.upgradeList.push(upgrade)
                //console.log($scope.upgradeList);
            })

            $scope.updateClickDamage();

        })


    });

    socket.on('disconnect', function () {
        window.location.reload();
    })

    setInterval(function () {
        $scope.updateClickDamage();
    }, 10000)

    $scope.calculateCost = function (currentLevel, increasePerLevel, baseCost) {
        if (currentLevel === 0) {
            return baseCost;
        }
        return Math.floor(baseCost * Math.pow(currentLevel, increasePerLevel) * 100) / 100;
    }

    $scope.calculateDamage = function (currentLevel, increasePerLevel, baseDamage, addDamage) {
        return Math.floor(((baseDamage * Math.pow(currentLevel, increasePerLevel)) + addDamage) * 100) / 100;
    }

    $scope.upgradeClicked = function (upgradeName) {
        let tempList = $scope.upgradeList;
        for (upgrade in tempList) {
            if (tempList[upgrade].name === upgradeName) {
                // Name matches to the one that was clicked
                //console.log("it matched!");
                $scope.calculateCost(tempList[upgrade].level, tempList[upgrade].baseCostMultiplierPercentage, tempList[upgrade].baseCostToUpgrade);
                if ($scope.upgradePoints >= $scope.calculateCost(tempList[upgrade].level, tempList[upgrade].baseCostMultiplierPercentage, tempList[upgrade].baseCostToUpgrade)) {
                    // The user can buy it!
                    // //console.log("Upgraded!");
                    // tempList[upgrade].level++;
                    // $scope.upgradeList = tempList;
                    socket.emit("purchaseUpgrade", upgradeName);
                    return;
                }
            }
        }
    }

    $scope.findUpgradeInList = function (list, upgrade) {
        for (num in list) {
            let upgradeInList = list[num]
            if (upgradeInList.name = upgrade) {
                return list[num];
            }
        }
    }

    $scope.updateClickDamage = function () {
        let tempDamage = 0;
        let currentInt = 0;
        let type = "active"; //Active means clicking
        $scope.upgradeList.forEach(function (upgrade) {
            currentInt = currentInt + 1;
            if (upgrade.type === type) {
                //console.log($scope.calculateDamage(upgrade.level, upgrade.baseDamageMultiplierPercentage, upgrade.baseDamage, upgrade.additionalDamage), tempDamage);
                tempDamage = tempDamage + $scope.calculateDamage(upgrade.level, upgrade.baseDamageMultiplierPercentage, upgrade.baseDamage, upgrade.additionalDamage);
            }
            if (currentInt === $scope.upgradeList.length) {
                $scope.currentClickDamage = tempDamage;
            }
        })
    }
    $scope.updateClickDamage();

    socket.on('purchasedUpgrade', function (upgrade) {
        //console.log("Purchase of upgrade is a go!", upgrade);
        let list = $scope.upgradeList;
        for (num in list) {
            if (list[num].name === upgrade.name) {
                upgrade.currentDPS = $scope.calculateDamage(upgrade.level, upgrade.baseDamageMultiplierPercentage, upgrade.baseDamage, upgrade.additionalDamage);
                list[num] = upgrade;
                $scope.upgradeList = list;
                $scope.updateClickDamage();
            }
        }
        if (!$scope.$$phase) {
            //$digest or $apply
            $scope.$apply();
        }
        //console.log($scope.upgradeList);
        return;
    })

    let verified = false;

});