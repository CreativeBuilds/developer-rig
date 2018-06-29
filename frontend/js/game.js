function clicked(){
    $('#registerClicks').click();
}

var parentElement = $('#clickArea');

console.log(parentElement.width()); 

let pixi;

function startGame(){

    pixi = new PIXI.Application(parentElement.width(), parentElement.height(), {backgroundColor: 0x2c2630});

    var container = new PIXI.Container();

    document.getElementById("clickArea").appendChild(pixi.view);

    function addImage({imageLocation, posX, posY, anchor = 0.5, callback = function(){}}){
        let image = PIXI.Sprite.fromImage(imageLocation);
        image.anchor.set(anchor);

        image.x = posX;
        console.log(image.height, "IMAGE HEIGHT");
        image.y = pixi.screen.height - (container.height*2) + 25 - (184/4);
        image.y = image.y - (image.height/2);

        if(callback){
            callback(image);
        } else {
            pixi.stage.addChild(image);
        }
        
        
    }

    
    
    

    pixi.stage.addChild(container);
    
    // Get the width of the screen and see how many times it can be divided by 32;
    let xImageLength = Math.ceil(parentElement.width()/32);
    for(let y = 0; y < 3; y++){
        for(let x = 0; x < xImageLength; x++){
            let imgObject = {};
            switch(y){
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
            console.log("Texture y", texture.y, container);
            container.addChild(texture);
        }
    }

    container.height = 96;
    container.x = 0;
    console.log("screen height", pixi.screen.height, "container height", container.height);
    container.y = (pixi.screen.height - 192 + 25);

    addImage({imageLocation: 'imgs/tempboss.png', posX: pixi.screen.width / 2, posY: pixi.screen.height - 96 - (184/2), callback: function(image){
        image.interactive = true;

        image.buttonMode = true;

        image.on("pointerdown", clicked);

        pixi.stage.addChild(image);
    }});
}


