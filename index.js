
const FPS = 30;
const RENDER_STEP_TIME = 1000 / FPS;

export class RenderLoop {
  sprites = [];
  callbacks = [];
  zero = document.timeline.currentTime;
  step = 0;
  fps = FPS;

  constructor(renderer) {
    this.renderer = renderer;
    requestAnimationFrame(this.frame.bind(this));
  }

  addSprite(sprite) {
    sprite.setRenderLoop(this);
    this.sprites.push(sprite);
  }

  addCallback(callback) {
    this.callbacks.push(callback);
  }

  frame() {
    // Run callbacks and steps once per frame
    if ((document.timeline.currentTime - this.zero) / RENDER_STEP_TIME >= this.step) {
      this.callbacks.forEach(callback => callback(this));
      this.drawStep();
      this.step++;
    }
    requestAnimationFrame(this.frame.bind(this));
  }

  drawStep() {
    this.sprites.forEach(sprite =>
      this.renderer.updateDrawableProperties(sprite.render, sprite.getRendererProps())
    );
    this.renderer.draw();
  }

  updateSkin(sprite) {
    const WantedSkinType = {
      bitmap: 'bitmap',
      vector: 'vector',
    };
    const wantedSkin = sprite.currentCostume.type;

    // Bitmap (squirrel)
    const image = new Image();
    image.addEventListener('load', () => {
      const bitmapSkinId = renderer.createBitmapSkin(image);
      if (wantedSkin === WantedSkinType.bitmap) {
        this.renderer.updateDrawableProperties(sprite.render, {
          skinId: bitmapSkinId
        });
      }
    });
    image.crossOrigin = 'anonymous';
    image.src = sprite.currentCostume.data;

    // SVG (cat 1-a)
    const xhr = new XMLHttpRequest();
    xhr.addEventListener('load', () => {
      const skinId = renderer.createSVGSkin(xhr.responseText);
      if (wantedSkin === WantedSkinType.vector) {
        this.renderer.updateDrawableProperties(sprite.render, {
          skinId: skinId
        });
      }
    });
    xhr.open('GET', sprite.currentCostume.data);
    xhr.send();
  }
}