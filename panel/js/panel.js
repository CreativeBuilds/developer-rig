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

    let panels = {
        "upgrades": {
            position:0,
            width: 110
        },
        "inventory": {
            position:1,
            width:110
        }
    }
    let currentPos = 0;

    let isInTransition = false;

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
                authCode.type = "panel";
                socket.emit('verify', authCode);
                socket.emit("getPanelInfo");
                socket.emit("getUpgradePoints");
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
            try{
                $scope.$apply();
            } catch(err){
            }
        })

        socket.on('upgradeList', (upgradeList) => {
            console.log("upgradeList", upgradeList, $scope.upgradeList);
            $scope.upgradeList = [];
            Object.keys(upgradeList).forEach(function (upgrade_name) {
                //TODO Currently this will reward everyone in the stream (we may want to develop a system in-which the people who do more damage get more points)
                upgradeList[upgrade_name].name = upgrade_name;
                let upgrade = upgradeList[upgrade_name];
                upgrade.currentDPS = $scope.calculateDamage(upgrade.level, upgrade.baseDamageMultiplierPercentage, upgrade.baseDamage, upgrade.additionalDamage);
                $scope.upgradeList.push(upgrade)
                console.log($scope.upgradeList);
                try{
                    $scope.$apply();
                } catch(err) {

                }
            })

            $scope.updateClickDamage();

        })


    });

    $scope.move = function(side){
        if(isInTransition)return;
        if(side === "left"){
            Object.keys(panels).forEach(function(key){
                if(panels[key].position === currentPos - 1){
                    isInTransition = true;
                    let currentLeft = Math.floor($('#overlay').css('left').replace(/[^-\d\.]/g, ''));
                    newLeft = currentLeft - panels[key].width;
                    let ulCurrentLeft = Math.floor($('#menuContent').css('left').replace(/[^-\d\.]/g, ''));
                    newUlLeft = ulCurrentLeft + panels[key].width;
                    $('#menuContent').css('left', `${newUlLeft}px`);
                    setTimeout(function(){
                        isInTransition = false;
                    },250)
                    currentPos = currentPos - 1;
                }
            })
        } else {
            Object.keys(panels).forEach(function(key){
                if(panels[key].position === currentPos + 1){
                    isInTransition = true;
                    let currentLeft = Math.floor($('#overlay').css('left').replace(/[^-\d\.]/g, ''));
                    newLeft = currentLeft + panels[key].width;
                    let ulCurrentLeft = Math.floor($('#menuContent').css('left').replace(/[^-\d\.]/g, ''));
                    newUlLeft = ulCurrentLeft - panels[key].width;
                    $('#menuContent').css('left', `${newUlLeft}px`);
                        setTimeout(function(){
                            isInTransition = false;
                        },250)
                    currentPos = currentPos + 1;
                }
            })
        }
    }

    $scope.open = function(name){
        console.log("Opened!", name);
        if(isInTransition)return;
        let totalWidthToAdd = 0;
        let totalLoops = 0;
        Object.keys(panels).forEach(function(key){
            totalLoops++;
            console.log(panels, key);
            if(panels[key].position < panels[name].position){
                console.log("updated totalWidthToAdd", totalWidthToAdd);
                totalWidthToAdd = totalWidthToAdd + panels[key].width;
            }
            console.log(totalLoops, Object.keys(panels).length);
            if(totalLoops === Object.keys(panels).length){

                console.log(`${40 - totalWidthToAdd}px`);
                isInTransition = true;
                $('#overlay').css('left', `${totalWidthToAdd}px`);
                setTimeout(function(){
                    $('#menuContent').css('left', `${40 - totalWidthToAdd}px`);
                    setTimeout(function(){
                        isInTransition = false;
                    },500)
                },250)
                $('.activeWindow').css('opacity', "0");
                setTimeout(function(){
                    $('.activeWindow').css('display', 'none');
                    $(`#${name}`).css('display', "block");
                    $(`#${name}`).css('opacity',"1");
                    $('.activeWindow').removeClass("activeWindow");
                    $(`#${name}`).addClass("activeWindow");
                },250)
                currentPos = panels[name].position;
                
                
            }
        })
        
    }

    // socket.on('disconnect', function () {
    //     window.location.reload();
    // })

    setInterval(function () {
        $scope.updateClickDamage();
        socket.emit("getUpgradePoints");
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
        console.log(tempList);
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
                    console.log("Emitted purchase!")
                    socket.emit("purchaseUpgrade", upgradeName);
                    return;
                } else {
                    console.log("Don't have enough to buy!", $scope.calculateCost(tempList[upgrade].level, tempList[upgrade].baseCostMultiplierPercentage, tempList[upgrade].baseCostToUpgrade), $scope.upgradePoints);
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

    socket.on('newBoss', function(){
        socket.emit("getUpgradePoints");
    })

    let verified = false;

});