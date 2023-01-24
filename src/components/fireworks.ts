import * as utils from "@dcl/ecs-scene-utils";
export class Firework extends Entity {
  private fireworkLaunchSound = new AudioClip("sounds/fireworkLaunch.mp3");
  private fireworkExplodeSound = new AudioClip("sounds/fireworkExplode.mp3");

  constructor(model: GLTFShape, transform: Transform) {
    super();
    engine.addEntity(this);
    this.addComponent(model);
    this.addComponent(transform);

    this.addComponent(new Animator());
    this.getComponent(Animator).addClip(
      new AnimationState("Play", { looping: false })
    );
  }
  launch() {
    // sound
    this.addComponentOrReplace(new AudioSource(this.fireworkLaunchSound));
    this.getComponent(AudioSource).playOnce();
    utils.setTimeout(1250, () => {
      this.addComponentOrReplace(new AudioSource(this.fireworkExplodeSound));
      this.getComponent(AudioSource).playOnce();
    });

    // animation
    this.getComponent(Animator).getClip("Play").play();
    utils.setTimeout(4800, () => {
      this.getComponent(Animator).getClip("Play").stop();
    });
  }
}
