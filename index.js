// const getMousePosition = getMousePos;
import "./getMousePosition.js";
import "./scratch-render.js"
const canvas = document.getElementById('stage');
const renderer = new ScratchRender(canvas);
renderer.setLayerGroupOrdering(['group1']);

const drawableID = renderer.createDrawable('group1');
renderer.updateDrawableProperties(drawableID, {
    position: [0, 0],
    scale: [100, 100],
    direction: 90
});

const WantedSkinType = {
    bitmap: 'bitmap',
    vector: 'vector',
    pen: 'pen'
};

const drawableID2 = renderer.createDrawable('group1');
const wantedSkin = WantedSkinType.vector;

// Bitmap (squirrel)
const image = new Image();
image.addEventListener('load', () => {
    const bitmapSkinId = renderer.createBitmapSkin(image);
    if (wantedSkin === WantedSkinType.bitmap) {
        renderer.updateDrawableProperties(drawableID2, {
            skinId: bitmapSkinId
        });
    }
});
image.crossOrigin = 'anonymous';
image.src = 'https://cdn.assets.scratch.mit.edu/internalapi/asset/7e24c99c1b853e52f8e7f9004416fa34.png/get/';

// SVG (cat 1-a)
const xhr = new XMLHttpRequest();
xhr.addEventListener('load', () => {
    const skinId = renderer.createSVGSkin(xhr.responseText);
    if (wantedSkin === WantedSkinType.vector) {
        renderer.updateDrawableProperties(drawableID2, {
            skinId: skinId
        });
    }
});
xhr.open('GET', 'https://cdn.assets.scratch.mit.edu/internalapi/asset/b7853f557e4426412e64bb3da6531a99.svg/get/');
xhr.send();

if (wantedSkin === WantedSkinType.pen) {
    const penSkinID = renderer.createPenSkin();

    renderer.updateDrawableProperties(drawableID2, {
        skinId: penSkinID
    });

    canvas.addEventListener('click', event => {
        const rect = canvas.getBoundingClientRect();

        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        renderer.penLine(penSkinID, {
            color4f: [Math.random(), Math.random(), Math.random(), 1],
            diameter: 8
        },
        x - 240, 180 - y, (Math.random() * 480) - 240, (Math.random() * 360) - 180);
    });
}



renderer.resize(480, 360);


canvas.addEventListener('mousemove', event => {
    const mousePos = getMousePosition(event, canvas);
    renderer.extractColor(mousePos.x, mousePos.y, 30);
});

canvas.addEventListener('click', event => {
    const mousePos = getMousePosition(event, canvas);
    const pickID = renderer.pick(mousePos.x, mousePos.y);
    console.log(`You clicked on ${(pickID < 0 ? 'nothing' : `ID# ${pickID}`)}`);
    if (pickID >= 0) {
        console.dir(renderer.extractDrawableScreenSpace(pickID, mousePos.x, mousePos.y));
    }
});

const drawStep = function () {
    renderer.draw();
    // renderer.getBounds(drawableID2);
    // renderer.isTouchingColor(drawableID2, [255,255,255]);
    requestAnimationFrame(drawStep);
};
drawStep();

