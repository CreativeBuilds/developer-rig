$(document).ready(function () {
    ////console.log("Document is ready!");
    ////console.log($("body"));
})

let window2 = window;

var app = angular.module('app', []);

app.filter('inventorySort', function () {
    return function (inventory, type, rarity) {

        let out = [];

        angular.forEach(inventory, function (item) {
            if (type && type !== "any") {
                if (!item.type) return;
                if (item.type !== type) return;
            }

            if (rarity && rarity !== "any") {
                if (!item.rarity) return;
                if (item.rarity !== rarity) return;
            }

            out.push(item);
        })

        return out;


    }
})

let authCode = '';

window.Twitch.ext.onAuthorized(auth => {
    //console.log("Twitch verified!");
    authCode = auth;
})

app.controller('myCtrl', function ($scope) {

    let clicks = [];

    $scope.upgradePoints = 0;

    $scope.gems = 0;

    $scope.upgradeList = [];
    $scope.inventory = [];
    $scope.itemOverlay = {
        name: "test",
        type: "crate",
        imageLocation: "commonCrate200px.png"
    };

    $scope.sort = {};

    $scope.sort.rarity = "any";
    $scope.sort.type = "any";
    $scope.sort.sort = "name";

    $scope.rarities = [
        "any",
        "common",
        "uncommon",
        "rare",
        "epic",
        "legendary",
        "mythic"
    ]

    $scope.types = [
        "any",
        "crate",
        "mainHand",
        "offHand",
        "head",
        "breastplate",
        "legs",
        "feet"
    ]
    $scope.sorts = [
        "name",
        "type",
        "rarity"
    ]

    let panels = {
        "upgrades": {
            position: 0,
            width: 110
        },
        "inventory": {
            position: 1,
            width: 110
        }
    }
    let currentPos = 0;

    let isInTransition = false;

    $scope.currentClickDamage = 1;
    $scope.currentIdleDamage = 0;

    let triggerRunning = false;
    $scope.triggerShake = function ($event) {
        if (triggerRunning) return;
        triggerRunning = true;
        $($event.currentTarget).addClass("animated");
        $($event.currentTarget).addClass("headShake");
        $($event.currentTarget).removeClass("clickable");
        setTimeout(function () {
            $($event.currentTarget).addClass("clickable");
            $($event.currentTarget).removeClass("headShake");
            triggerRunning = false;
        }, 750)
    }

    $scope.removeItemOverlay = function () {
        $('#itemOverlay').css('opacity', 0);
        setTimeout(function () {
            $('#itemOverlay').css('display', 'none');
            $('#itemOverlay').css('opacity', 1);
        }, 250)
    }

    $scope.openItemOverlay = function (item) {
        console.log(item);
        let item2 = {};
        item2.imageLocation = item.imageLocation;
        item2.name = item.name;
        item2.stackSize = item.stackSize || false;
        item2.type = item.type;
        console.log("ITEM OVERLAY TYPE", item.type);
        item2.level = item.level;
        item2.item = item;


        if (item.baseProtection) {
            if (item.level > 1) {
                item2.protection = item.baseProtection * Math.pow(item.protectionMultiplier, item.level - 1);
            } else {
                item2.protection = item.baseProtection;
            }
            item2.protectionMultiplier = item.protectionMultiplier;
            item2.costMultiplier = item.costMultiplier;
            item2.baseCost = item.baseCost;
        }

        if(item.level > 1){
            console.log(item.baseCost, item.costMultiplier, item.level)
            item2.cost = item.baseCost * Math.pow(item.costMultiplier, item.level - 1);
        } else {
            console.log(item.baseCost);
            item2.cost = item.baseCost;
        }

        // purchaseAmount needs to be set server side for all crates;
        item2.unlockAmount = item.unlockAmount || 100;
        $scope.itemOverlay = item2;
        $scope.itemOverlay.type = item.type;
        $scope.itemOverlay.imageLocation = item2.imageLocation.replace('.png', "200px.png");
        $scope.itemOverlay.imageLocation = item2.imageLocation.replace('.jpg', "200px.jpg");
        console.log(item);

        setTimeout(function () {
            console.log($scope.itemOverlay);
            $('#itemOverlay').css('display', 'block');
        }, 10)
    }

    $scope.buyCrate = function ($event, item) {
        if (!item.unlockAmount) {
            $scope.triggerShake($event);
            $scope.itemOverlay.reason = "Invalid Purchase Amount!";
            setTimeout(function () {
                $scope.itemOverlay.reason = "";
            }, 1000)
            return;
        }

        if (item.unlockAmount > $scope.gems) {
            $scope.triggerShake($event);
            console.log(item.unlockAmount, $scope.gems);
            $scope.itemOverlay.reason = "Not Enough Gems!";
            // In the future ask user to buy/watch ads for gems Kappa
            setTimeout(function () {
                $scope.itemOverlay.reason = "";
            }, 1000)
            return;
        }

        console.log("sent socket emit to buy crate", item);
        $scope.itemOverlay.stackSize = $scope.itemOverlay.stackSize - 1;
        if ($scope.itemOverlay.stackSize <= 0) {
            $scope.removeItemOverlay();
            $scope.itemOverlay = null;
        }
        socket.emit("purchaseCrate", item);
    }

    let moving = false;

    $scope.inventoryFilterOpen = function () {
        if (moving) return;
        moving = true;
        $('#inventoryFilterMenu').css('display', 'block');
        $('#inventoryFilterMenu').addClass('animated');
        $('#inventoryFilterMenu').addClass('fadeInLeft');
        $('#inventoryFilterButton').addClass('animated');
        $('#inventoryFilterButton').addClass('fadeOutRight');
        $('#inventoryFilterButtonClose').css('display', "block");
        $('#inventoryFilterButtonClose').addClass('animated');
        $('#inventoryFilterButtonClose').addClass('fadeInLeft');
        setTimeout(function () {
            $('#inventoryFilterButton').css('display', 'none');
            $('#inventoryFilterButton').removeClass('animated');
            $('#inventoryFilterButton').removeClass('fadeOutRight');
            $('#inventoryFilterButtonClose').removeClass('animated');
            $('#inventoryFilterButtonClose').removeClass('fadeInLeft');
            $('#inventoryFilterMenu').removeClass('animated');
            $('#inventoryFilterMenu').removeClass('fadeInLeft');
            moving = false;
        }, 750)
    }

    $scope.inventoryFilterClose = function () {
        if (moving) return;
        moving = true;
        $('#inventoryFilterMenu').addClass('animated');
        $('#inventoryFilterMenu').addClass('fadeOutRight');
        $('#inventoryFilterButton').css('display', 'block');
        $('#inventoryFilterButton').addClass('animated');
        $('#inventoryFilterButton').addClass('fadeInLeft');
        $('#inventoryFilterButtonClose').addClass('animated');
        $('#inventoryFilterButtonClose').addClass('fadeOutRight');
        setTimeout(function () {
            $('#inventoryFilterButtonClose').css('display', "none");
            $('#inventoryFilterButton').removeClass('animated');
            $('#inventoryFilterButton').removeClass('fadeInLeft');
            $('#inventoryFilterButtonClose').removeClass('animated');
            $('#inventoryFilterButtonClose').removeClass('fadeOutRight');
            $('#inventoryFilterMenu').css('display', "none");
            $('#inventoryFilterMenu').removeClass('animated');
            $('#inventoryFilterMenu').removeClass('fadeOutRight');
            moving = false;
        }, 750)
    }

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
            try {
                $scope.$apply();
            } catch (err) {}
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
                try {
                    $scope.$apply();
                } catch (err) {

                }
            })

            $scope.updateClickDamage();

        })

        socket.on("inventory", function (inventory) {
            $scope.inventory = inventory;
            console.log("Inventory has been updated!", inventory);
            try {
                $scope.$apply();
            } catch (err) {

            }
            let element = $('#inventoryItems');

            console.log("Children", element.children, element.children().length);
            if (element.children().length >= 42) {
                element.css('grid-template-columns', '1fr 1fr 1fr 1fr 1fr');
                element.css('overflow-y', 'scroll');
            } else {
                element.css('grid-template-columns', '1fr 1fr 1fr 1fr 1fr 1fr');
                element.css('overflow-y', 'auto');
            }
        })

        socket.on("newCrate", function () {
            console.log("We just got a crate!");
        })

        socket.on('gems', function (gems) {
            $scope.gems = gems;
            console.log(gems, $scope.gems, "GOT GEMS");
            try {
                $scope.$apply();
            } catch (err) {

            }
        })

    });

    $scope.move = function (side) {
        if (isInTransition) return;
        if (side === "left") {
            Object.keys(panels).forEach(function (key) {
                if (panels[key].position === currentPos - 1) {
                    isInTransition = true;
                    let currentLeft = Math.floor($('#overlay').css('left').replace(/[^-\d\.]/g, ''));
                    newLeft = currentLeft - panels[key].width;
                    let ulCurrentLeft = Math.floor($('#menuContent').css('left').replace(/[^-\d\.]/g, ''));
                    newUlLeft = ulCurrentLeft + panels[key].width;
                    $('#menuContent').css('left', `${newUlLeft}px`);
                    setTimeout(function () {
                        isInTransition = false;
                    }, 250)
                    currentPos = currentPos - 1;
                }
            })
        } else {
            Object.keys(panels).forEach(function (key) {
                if (panels[key].position === currentPos + 1) {
                    isInTransition = true;
                    let currentLeft = Math.floor($('#overlay').css('left').replace(/[^-\d\.]/g, ''));
                    newLeft = currentLeft + panels[key].width;
                    let ulCurrentLeft = Math.floor($('#menuContent').css('left').replace(/[^-\d\.]/g, ''));
                    newUlLeft = ulCurrentLeft - panels[key].width;
                    $('#menuContent').css('left', `${newUlLeft}px`);
                    setTimeout(function () {
                        isInTransition = false;
                    }, 250)
                    currentPos = currentPos + 1;
                }
            })
        }
    }

    $scope.open = function (name) {
        console.log("Opened!", name);
        if (isInTransition) return;
        let totalWidthToAdd = 0;
        let totalLoops = 0;
        Object.keys(panels).forEach(function (key) {
            totalLoops++;
            console.log(panels, key);
            if (panels[key].position < panels[name].position) {
                console.log("updated totalWidthToAdd", totalWidthToAdd);
                totalWidthToAdd = totalWidthToAdd + panels[key].width;
            }
            console.log(totalLoops, Object.keys(panels).length);
            if (totalLoops === Object.keys(panels).length) {

                console.log(`${40 - totalWidthToAdd}px`);
                isInTransition = true;
                $('#overlay').css('left', `${totalWidthToAdd}px`);
                setTimeout(function () {
                    $('#menuContent').css('left', `${40 - totalWidthToAdd}px`);
                    setTimeout(function () {
                        isInTransition = false;
                    }, 500)
                }, 250)
                $('.activeWindow').css('opacity', "0");
                setTimeout(function () {
                    $('.activeWindow').css('display', 'none');
                    $(`#${name}`).css('display', "block");
                    $(`#${name}`).css('opacity', "1");
                    $('.activeWindow').removeClass("activeWindow");
                    $(`#${name}`).addClass("activeWindow");
                }, 250)
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

    socket.on('newBoss', function () {
        socket.emit("getUpgradePoints");
    })

    let verified = false;

});