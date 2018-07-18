function clicked() {
    $('#registerClicks').click();
}

var parentElement = $('#clickArea');

let pixi;

let bossIndex = -2;
let textIndex = -3;
let groundIndex = -1;

let currentBossGameObject;

var generateNewBossGameObject = function () {};

var mouse = {
    x: 0,
    y: 0
};

let toAdd = null;

let amountOfTexts = 0;

function startGame() {

    pixi = new PIXI.Application(parentElement.width(), parentElement.height(), {
        backgroundColor: 0x2c2630
    });

    let stage = pixi.stage;

    stage.updateLayersOrder = function () {
        stage.children.sort(function(a,b) {
            a.zIndex = a.zIndex || 0;
            b.zIndex = b.zIndex || 0;
            return b.zIndex - a.zIndex
        });
    };
    

    

    pixi.bossClicked = function (currentClickDamage) {
        let currentDamage = Math.floor(currentClickDamage * 100) / 100;
        // let bitmapText = new PIXI.extras.BitmapText(currentDamage.toString(), {font:{}});
        let text = new PIXI.Text(currentDamage.toString(), {
            fontFamily: "Roboto",
            fill: 0xf1f1f1,
            align: "center"
        });
        text.x = mouse.x;
        text.y = mouse.y;
        text.zIndex = textIndex;
        text.anchor.set(0.5);

        pixi.stage.addChild(text);

        amountOfTexts++;

        console.log(mouse, amountOfTexts);

        let tick = function (delta) {
            let babyp = this;
            try {
                text.y = text.y - (1 * delta);
                text.alpha = text.alpha - (0.01 * delta)
            } catch (err) {
                babyp.destroy();
                
            }

        }

        pixi.ticker.add(tick);
        setTimeout(function () {
            text.destroy();
            amountOfTexts--;
        }, 10000)


    }

    document.getElementById("clickArea").appendChild(pixi.view);

    function addImage({
        imageLocation,
        posX,
        posY,
        anchor = 0.5,
        callback = function () {}
    }) {
        let image = PIXI.Sprite.fromImage(imageLocation);
        image.anchor.set(anchor);

        image.x = posX;
        image.y = posY;

        if (callback) {
            callback(image);
        } else {
            pixi.stage.addChild(image);
            stage.updateLayersOrder();
        }

    }

    function makeGround() {
        let container = new PIXI.Container();
        container.zIndex = groundIndex;
        pixi.stage.addChild(container);
        // Get the width of the screen and see how many times it can be divided by 32;
        let xImageLength = Math.ceil(parentElement.width() / 32);
        for (let y = 0; y < 3; y++) {
            for (let x = 0; x < xImageLength; x++) {
                let imgObject = {};
                switch (y) {
                    case 0:
                        imgObject.imageLocation = "imgs/grass.png";
                        break;
                    case 1:
                        imgObject.imageLocation = "imgs/dirt.png";
                        break;
                    case 2:
                        imgObject.imageLocation = "imgs/dirtToStone.png";
                }
                let texture = new PIXI.Sprite(PIXI.Texture.fromImage(imgObject.imageLocation));
                texture.anchor.set(0);
                texture.x = x * 32;
                texture.y = y * 32;
                container.addChild(texture);
            }
        }

        container.height = 96;
        container.x = 0;
        container.y = (pixi.screen.height - 192 + 25);
    }

    function makeSky() {
        var container = new PIXI.Container();
        // Get the width of the screen and see how many times it can be divided by 32;
        let yImageLength = Math.ceil(parentElement.height() / 32);
        let xImageLength = Math.ceil(parentElement.width() / 32);
        for (let y = 0; y < yImageLength; y++) {
            for (let x = 0; x < xImageLength; x++) {
                let imgObject = {};
                if (y === 1 && x === 1) {
                    imgObject.imageLocation = "imgs/sun.png";
                } else {
                    imgObject.imageLocation = "imgs/sky.png";
                }
                let texture = new PIXI.Sprite(PIXI.Texture.fromImage(imgObject.imageLocation));
                texture.anchor.set(0);
                texture.x = x * 32;
                texture.y = y * 32;
                container.addChild(texture);
            }
        }
        container.x = 0;
        container.y = 0;
        pixi.stage.addChild(container);
    }

    generateNewBossGameObject = function({
        imageLocation
    }) {
        if (currentBossGameObject) {
            currentBossGameObject.destroy();
        }

        addImage({
            imageLocation: imageLocation,
            posX: pixi.screen.width / 2,
            posY: (pixi.screen.height) - (96 * 2) - (92 / 5),
            callback: function (image) {
                image.interactive = true;

                image.buttonMode = true;

                image.on("pointerdown", clicked);
                image.zIndex = bossIndex;
                pixi.stage.addChild(image);
                stage.updateLayersOrder();

                currentBossGameObject = image;
            }
        });
    }

    makeSky();
    makeGround();

    generateNewBossGameObject({
        imageLocation: 'imgs/tempboss.png'
    });

}