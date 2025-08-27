import { getMousePos } from "./getMousePosition.js";
import "./node_modules/@scratch/scratch-render/dist/web/scratch-render.js";

const FPS = 30;
const RENDER_STEP_TIME = 1000 / FPS;


export class RenderLoop {
  sprites = [];
  mouse = { x: 0, y: 0, click: false, trueX: 240, trueY: 180 };
  key = null;
  callbacks = [];
  zero = document.timeline.currentTime;
  step = 0;
  fps = FPS;

  constructor(canvas) {
    this.renderer = new ScratchRender(canvas);
    this.renderer.setLayerGroupOrdering(['stage','sprites']);
    requestAnimationFrame(this.frame.bind(this));
    document.addEventListener("mousemove", (e) => {
      let mpos = getMousePos(e, canvas);
      this.mouse.trueX = mpos.x;
      this.mouse.trueY = mpos.y;
      if (Math.abs(mpos.x - 240) < 241) {
        this.mouse.x = mpos.x - 240;
      } else {
        if (mpos.x - 240 > 241) {
          this.mouse.x = 240;
        }
        else {
          this.mouse.x = - 240
        }
      }
      if (Math.abs(-mpos.y + 180) < 181) {
        this.mouse.y = -mpos.y + 180;
      } else {
        if (-mpos.y + 180 > 181) {
          this.mouse.y = 180;
        }
        else {
          this.mouse.x = - 180
        }
      }

    });
    document.addEventListener("mousedown", (event) => {
      this.mouse.click = true;
    });
    document.addEventListener("mouseup", (event) => {
      this.mouse.click = false;
    });
    document.addEventListener("keydown", (event) => {
      this.key = event.key;
    });
    document.addEventListener("keyup", (event) => {
      this.key = null;
    });
  }

  async playSound(pan, pitch, volume, soundFile) {
    const audioContext = new AudioContext();
    const gainNode = audioContext.createGain();
    const res = await fetch(soundFile);
    const soundBuffer = await res.arrayBuffer();
    const audioContextBuffer = await audioContext.decodeAudioData(soundBuffer);
    const source = audioContext.createBufferSource();
    source.buffer = audioContextBuffer;
    source.playbackRate.value = pitch / 100;
    const panner = new StereoPannerNode(audioContext, { pan: (pan / 100) });
    gainNode.gain.value = volume / 100;

    source.connect(gainNode).connect(panner).connect(audioContext.destination);
    // const panner=audioContext.createPanner();


    source.start();
  }

  setStage(x, wantedSkin) {
    return new Promise((resolve) => {
      const stage = this.renderer.createDrawable('stage');
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

  _findSprite(name) {
    return this.sprites.findIndex(e => e.name == name)
  }

  addSprite(sprite, name) {
    sprite.setRenderLoop(this);
    sprite.render = this.renderer.createDrawable('sprites');
    if (this._findSprite(name) >= 0) {
      return false;
    }
    this.sprites.push({ sprite, name });
    return true;
  }

  deleteSprite(name) {
    const index = this._findSprite(name);
    if (index == -1) {
      return false;
    } else {
      this.renderer.destroyDrawable(this.sprites[index].sprite.render, 'sprites');
      this.sprites.splice(index, 1);
      return true;
    }
  }

  addGlobal(global) {
    global.setRenderLoop(this);
  }

  addCallback(callback) {
    this.callbacks.push(callback);
  }

  frame() {
    // Run callbacks and steps once per frame
    if ((document.timeline.currentTime - this.zero) / RENDER_STEP_TIME >= this.step) {
      this.drawStep();
      this.step++;
      this.callbacks.forEach(callback => callback(this));

    }
    requestAnimationFrame(this.frame.bind(this));
  }

  async drawStep() {
    this.sprites.forEach((sprite) => {
      this.renderer.updateDrawableProperties(sprite.sprite.render, sprite.sprite.getRendererProps());
    });
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