
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



  setStage(x, wantedSkin) {
    return new Promise((resolve) => {
      const stage = this.renderer.createDrawable('group');
       this.renderer.updateDrawableProperties(stage, {
        position: [0, 0],
        scale: [100, 100],
        direction: 90
      });
      const WantedSkinType = {
        bitmap: 'bitmap',
        vector: 'vector',
      };

      // Bitmap
      if (wantedSkin === WantedSkinType.bitmap) {
        const image = new Image();
        image.addEventListener('load', () => {
          const bitmapSkinId = this.renderer.createBitmapSkin(image);

          this.renderer.updateDrawableProperties(stage, {
            skinId: bitmapSkinId
          });

          resolve();
        });
        image.crossOrigin = 'anonymous';
        image.src = x;
      }

      // SVG
      if (wantedSkin === WantedSkinType.vector) {
        const xhr = new XMLHttpRequest();
        xhr.addEventListener('load', () => {
          const skinId = this.renderer.createSVGSkin(xhr.responseText);

          this.renderer.updateDrawableProperties(stage, {
            skinId: skinId
          });

          resolve();
        });
        xhr.open('GET', x);
        xhr.send();
      }
    });
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

  async updateSkin(sprite) {
    return new Promise((resolve) => {

      

      const WantedSkinType = {
        bitmap: 'bitmap',
        vector: 'vector',
      };
      const wantedSkin = sprite.currentCostume.type;

      // Bitmap
      if (wantedSkin === WantedSkinType.bitmap) {
        const image = new Image();
        image.addEventListener('load', () => {
          const bitmapSkinId = this.renderer.createBitmapSkin(image);

          this.renderer.updateDrawableProperties(sprite.render, {
            skinId: bitmapSkinId
          });

          resolve();
        });
        image.crossOrigin = 'anonymous';
        image.src = sprite.currentCostume.data;
      }

      // SVG
      if (wantedSkin === WantedSkinType.vector) {
        const xhr = new XMLHttpRequest();
        xhr.addEventListener('load', () => {
          const skinId = this.renderer.createSVGSkin(xhr.responseText);

          this.renderer.updateDrawableProperties(sprite.render, {
            skinId: skinId
          });

          resolve();
        });
        xhr.open('GET', sprite.currentCostume.data);
        xhr.send();
      }
    });
  }
}