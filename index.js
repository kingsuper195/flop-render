
const FPS = 30;
const RENDER_STEP_TIME = 1000/FPS;

export class RenderLoop {
  sprites = [];
  callbacks = [];
  zero = document.timeline.currentTime;
  step = 0;

  constructor(renderer) {
    this.renderer = renderer;
    requestAnimationFrame(this.frame.bind(this));
  }

  addSprite(sprite) {
    this.sprites.push(sprite);
  }

  addCallback(callback) {
    this.callbacks.push(callback);
  }

  frame() {
    // Run callbacks and steps once per frame
    if((document.timeline.currentTime - this.zero) / RENDER_STEP_TIME >= this.step) {
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
}