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

var timeout, bossImage = $('#bossImage');

bossImage.mousedown(function () {
    //console.log('boss image has been clicked!');
    timeout = setInterval(function () {
        bossImage.css('width', '95px');
        bossImage.css('height', '95px');
    }, 50)

    return false;
})

$(document).mouseup(function () {
    clearInterval(timeout);
    bossImage.css('width', '100px');
    bossImage.css('height', '100px');
    return false;
})

app.controller('myCtrl', function ($scope) {

    let clicks = [];

    $scope.bossHealth = 100;
    $scope.bossTotalHealth = 100;
    $scope.remainingHealthPercentage = 100;

    $scope.upgradePoints = 0;

    $scope.upgradeList = [];

    $scope.currentClickDamage = 1;
    $scope.currentIdleDamage = 0;
    $scope.currentFloor = 1;

    // User opened the app
    $scope.openApp = function(){
        $('#app').css('display',"block");
        $('#app').css('opacity',1);
    }

    $scope.closeApp = function(){
        $('#app').css('opacity',0);
        setTimeout(function(){
            window.location.reload();
        },250)
    }

    var socket = io('https://twitchclickergame.com');

    socket.on('connect', function () {
        // Established a connection to the EBS
        // Send the EBS our token for it to verify!

        socket.on('verified', () => {
            //console.log("I'm verified")
            verified = true;
            socket.emit('getUpgradePoints');
        })

        function verify() {
            if (authCode.token) {
                socket.emit('verify', authCode.token);
                socket.emit("getVideoOverlayInfo");
            } else {
                setTimeout(function () {
                    verify();
                }, 250)
            }
        }

        verify();

        socket.on("newFloor", (floorNum)=>{
            $scope.currentFloor = floorNum;
        })

        socket.on("shareIdentity", () => {
            //The server needs the user to agree to share their identity, ask them!
            ////console.log("Server asked me to share identity with it");
            window2.Twitch.ext.actions.requestIdShare(function (one, two) {
                ////console.log("Something happened!");
                ////console.log(one, two);
                //TODO in the future when this is actually an extension make sure this works!
            })
        })

        socket.on('bossInfo', (boss) => {
            ////console.log("Got boss info!");
            $scope.bossHealth = boss.health;
            $scope.bossTotalHealth = boss.totalHealth;

            $scope.updateHealthDisplay($scope.bossTotalHealth, $scope.bossHealth)

            ////console.log("Boss", boss);
        })

        socket.on('newBoss', () => {
            socket.emit('getUpgradePoints');
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

    let blendRGB = function (rgb1, rgb2, percentage) {
        rgb1 = rgb1.substring(4, rgb1.length - 1)
            .replace(/ /g, '')
            .split(',')
        rgb2 = rgb2.substring(4, rgb2.length - 1)
            .replace(/ /g, '')
            .split(',')

        let rDiff = (parseInt(rgb1[0]) - parseInt(rgb2[0])) * -1;
        let gDiff = (parseInt(rgb1[1]) - parseInt(rgb2[1])) * -1;
        let bDiff = (parseInt(rgb1[2]) - parseInt(rgb2[2])) * -1;
        ////console.log(percentage, 1 - percentage);
        percentage = 1 - percentage;

        let r = parseInt(rgb1[0]) + Math.floor(rDiff * percentage);
        let g = parseInt(rgb1[1]) + Math.floor(gDiff * percentage);
        let b = parseInt(rgb1[2]) + Math.floor(bDiff * percentage);

        ////console.log(rgb1[0], rgb1[1], rgb1[2], parseInt(rgb1[0]), parseInt(rgb1[1]), parseInt(rgb1[2]), rDiff, gDiff, bDiff, percentage, Math.floor(rDiff * percentage), Math.floor(gDiff * percentage), Math.floor(bDiff * percentage));

        return `rgb(${r},${g},${b})`;
    }

    $scope.calculateCost = function (currentLevel, increasePerLevel, baseCost) {
        if (currentLevel === 0) {
            return baseCost;
        }
        return Math.floor(baseCost * Math.pow(currentLevel, increasePerLevel) * 100) / 100;
    }

    $scope.calculateDamage = function (currentLevel, increasePerLevel, baseDamage, addDamage) {
        return Math.floor(((baseDamage * Math.pow(currentLevel, increasePerLevel)) + addDamage) * 100) / 100;
    }

    // User is active, fade the screen so the user can do stuff and turn display to hidden;
    $scope.joinFight = function () {
        socket.emit("joinFight");
        startGame();
    }

    socket.on("joinedFight", function () {
        let overlay = $("#joinOverlay");
        overlay.css('opacity', "0");
        overlay.css('display', "none");
    })

    $scope.updateHealthDisplay = function (totalHealth, health) {
        // Update the width of the health bar and change the color depending on how much is left;
        let startingColor = 'rgb(16,80,0)';
        let endingColor = 'rgb(78,12,12)';
        let remainingHealthPercentage = health / totalHealth;
        ////console.log(health, totalHealth, remainingHealthPercentage);
        let currentColor = blendRGB(startingColor, endingColor, remainingHealthPercentage);
        ////console.log(currentColor);
        $('#bossHealthChild').css(`background`, currentColor);
        $scope.remainingHealthPercentage = Math.floor(remainingHealthPercentage * 10000) / 100;
        if (!$scope.$$phase) {
            //$digest or $apply
            $scope.$apply();
        }
        ////console.log((remainingHealthPercentage * 100) + "%");
        $('#bossHealthChild').css(`width`, (remainingHealthPercentage * 100) + "%");


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
            if(currentInt === $scope.upgradeList.length){
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

    $scope.toggleLeftMenu = function () {
        let left = $('#leftMenu').css('left');

        if (left === "0px") {
            //That means we are in open position (have to close)
            $('#leftMenu').css('left', "-250px")
            $("#leftMenuTabArrow").rotate({
                endDeg: 0,
                easing: 'ease-in-out',
                duration: 0.5,
                persist: true
            })
        } else {
            // We are in closed position (have to open)
            $('#leftMenu').css('left', "0px");
            $("#leftMenuTabArrow").rotate({
                endDeg: 180,
                easing: 'ease-in-out',
                duration: 0.5,
                persist: true
            })
        }
    }

    

    // TODO Checks to see which upgrades can be purchased.
    let canPurchase = function () {

    }

    let verified = false;

    $scope.clicked = function () {
        if (!verified) {} else {
            if (clicks.length === 10) {
                //Max amount has been reached (see if the most recent click is atleast 1000 milliseconds older than the first item in that array)
                if (Date.now() - clicks[9] > 100) {
                    clicks.splice(0, 1);
                    clicks.push(Date.now());
                    socket.emit('screenClicked');
                    //console.log($scope.currentClickDamage);
                    if ($scope.bossHealth - $scope.currentClickDamage <= 0) {
                        $scope.bossHealth = 0;
                        $scope.updateHealthDisplay($scope.bossTotalHealth, $scope.bossHealth);
                        return;
                    }
                    $scope.bossHealth = $scope.bossHealth - $scope.currentClickDamage;
                    $scope.updateHealthDisplay($scope.bossTotalHealth, $scope.bossHealth);
                }
            } else {
                clicks.push(Date.now());
                socket.emit('screenClicked');
                if ($scope.bossHealth - $scope.currentClickDamage <= 0) {
                    $scope.updateHealthDisplay($scope.bossTotalHealth, $scope.bossHealth);
                    $scope.bossHealth = 0;
                    return;
                }
                $scope.bossHealth = $scope.bossHealth - $scope.currentClickDamage;
                $scope.updateHealthDisplay($scope.bossTotalHealth, $scope.bossHealth);
                lastClick = Date.now();
            }
        }


    }

    $('body').keydown(function(e){
        if(e.keyCode === 27){
            //The user would like to minimize the game (they hit esc)
            $scope.closeApp();
        }
    })

});



$.fn.rotate = function (options) {
    var $this = $(this),
        prefixes, opts, wait4css = 0;
    prefixes = ['-Webkit-', '-Moz-', '-O-', '-ms-', ''];
    opts = $.extend({
        startDeg: false,
        endDeg: 360,
        duration: 1,
        count: 1,
        easing: 'linear',
        animate: {},
        forceJS: false
    }, options);

    function supports(prop) {
        var can = false,
            style = document.createElement('div').style;
        $.each(prefixes, function (i, prefix) {
            if (style[prefix.replace(/\-/g, '') + prop] === '') {
                can = true;
            }
        });
        return can;
    }

    function prefixed(prop, value) {
        var css = {};
        if (!supports.transform) {
            return css;
        }
        $.each(prefixes, function (i, prefix) {
            css[prefix.toLowerCase() + prop] = value || '';
        });
        return css;
    }

    function generateFilter(deg) {
        var rot, cos, sin, matrix;
        if (supports.transform) {
            return '';
        }
        rot = deg >= 0 ? Math.PI * deg / 180 : Math.PI * (360 + deg) / 180;
        cos = Math.cos(rot);
        sin = Math.sin(rot);
        matrix = 'M11=' + cos + ',M12=' + (-sin) + ',M21=' + sin + ',M22=' + cos + ',SizingMethod="auto expand"';
        return 'progid:DXImageTransform.Microsoft.Matrix(' + matrix + ')';
    }

    supports.transform = supports('Transform');
    supports.transition = supports('Transition');

    opts.endDeg *= opts.count;
    opts.duration *= opts.count;

    if (supports.transition && !opts.forceJS) { // CSS-Transition
        if ((/Firefox/).test(navigator.userAgent)) {
            wait4css = (!options || !options.animate) && (opts.startDeg === false || opts.startDeg >= 0) ? 0 : 25;
        }
        $this.queue(function (next) {
            if (opts.startDeg !== false) {
                $this.css(prefixed('transform', 'rotate(' + opts.startDeg + 'deg)'));
            }
            setTimeout(function () {
                $this
                    .css(prefixed('transition', 'all ' + opts.duration + 's ' + opts.easing))
                    .css(prefixed('transform', 'rotate(' + opts.endDeg + 'deg)'))
                    .css(opts.animate);
            }, wait4css);

            setTimeout(function () {
                $this.css(prefixed('transition'));
                if (!opts.persist) {
                    $this.css(prefixed('transform'));
                }
                next();
            }, (opts.duration * 1000) - wait4css);
        });

    } else { // JavaScript-Animation + filter
        if (opts.startDeg === false) {
            opts.startDeg = $this.data('rotated') || 0;
        }
        opts.animate.perc = 100;

        $this.animate(opts.animate, {
            duration: opts.duration * 1000,
            easing: $.easing[opts.easing] ? opts.easing : '',
            step: function (perc, fx) {
                var deg;
                if (fx.prop === 'perc') {
                    deg = opts.startDeg + (opts.endDeg - opts.startDeg) * perc / 100;
                    $this
                        .css(prefixed('transform', 'rotate(' + deg + 'deg)'))
                        .css('filter', generateFilter(deg));
                }
            },
            complete: function () {
                if (opts.persist) {
                    while (opts.endDeg >= 360) {
                        opts.endDeg -= 360;
                    }
                } else {
                    opts.endDeg = 0;
                    $this.css(prefixed('transform'));
                }
                $this.css('perc', 0).data('rotated', opts.endDeg);
            }
        });
    }

    return $this;
};