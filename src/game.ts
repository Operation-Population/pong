import { Dash_TriggerZone, Dash_Tweaker } from "dcldash";
import { Firework } from "./components/fireworks";
import * as utils from "@dcl/ecs-scene-utils";

let blueTeamScore = 0;
let redTeamScore = 0;
//Entities
const disk = new Entity();
const goalPost = new Entity();
const scoreBoard = new Entity();
const arche1 = new Entity();
const arche2 = new Entity();
const glass = new Entity();
const field = new Entity();
const surround = new Entity();
const floor = new Entity();

//---
const camera = new Camera();

const fireworkShape = new GLTFShape("models/Firework_03.gltf");

//adding the models
disk.addComponent(new GLTFShape("models/PongChamp_Assets_disk.glb"));
goalPost.addComponent(new GLTFShape("models/PongChamp_Assets_GoalPosts.glb"));
scoreBoard.addComponent(
  new GLTFShape("models/PongChamp_Assets_ScoreBoard.glb")
);
arche1.addComponent(new GLTFShape("models/PongChamp_Env_arche1.glb"));
arche2.addComponent(new GLTFShape("models/PongChamp_Env_arches.glb"));
glass.addComponent(new GLTFShape("models/PongChamp_Env_ArenaGlass.glb"));
field.addComponent(new GLTFShape("models/PongChamp_Env_ArenaGround.glb"));
surround.addComponent(new GLTFShape("models/PongChamp_Env_ArenaSurround.glb"));
floor.addComponent(new GLTFShape("models/PongChamp_Env_Floor.glb"));

// applause.addComponent();
// applause.playing = false;
arche1.setParent(floor);
arche2.setParent(floor);
field.setParent(floor);
goalPost.setParent(field);
surround.setParent(field);
glass.setParent(field);
scoreBoard.setParent(arche1);

floor.addComponent(
  new Transform({
    position: new Vector3(56.0, 0.0, 56.0),
    scale: new Vector3(1.0, 1.0, 1.0),
    rotation: new Quaternion().setEuler(0.0, 270.0, 0.0),
  })
);
//Position fill
// Dash_Tweaker(floor);
arche1.addComponent(
  new Transform({
    position: new Vector3(0.0, 0.0, 0.0),
    scale: new Vector3(1.0, 1.0, 1.0),
    rotation: new Quaternion().setEuler(0.0, 0.0, 0.0),
  })
);

arche2.addComponent(
  new Transform({
    position: new Vector3(27.7, 0.0, -0.2),
    scale: new Vector3(1.0, 1.0, 1.0),
    rotation: new Quaternion().setEuler(0.0, 0.0, 0.0),
  })
);
// Dash_Tweaker(arche2);

field.addComponent(
  new Transform({
    position: new Vector3(0.0, -7.7, 0.0),
    scale: new Vector3(1.0, 1.0, 1.0),
    rotation: new Quaternion().setEuler(0.0, 0.0, 0.0),
  })
);
field.addComponent(new AudioSource(new AudioClip("audios/applause_sound.mp3")));
// Dash_Tweaker(field);

goalPost.addComponent(
  new Transform({
    position: new Vector3(0.0, 0.0, 0.0),
    scale: new Vector3(1.0, 1.0, 1.0),
    rotation: new Quaternion().setEuler(0.0, 0.0, 0.0),
  })
);

scoreBoard.addComponent(
  new Transform({
    position: new Vector3(0.0, 15.0, 0.0),
    scale: new Vector3(1.0, 1.0, 1.0),
    rotation: new Quaternion().setEuler(0.0, 0.0, 0.0),
  })
);

// Dash_Tweaker(scoreBoard);

engine.addEntity(floor);
// engine.addEntity(ground);

//Server
const ws = new WebSocket("ws://localhost:13370");

//Create ball entity
const ball = new Entity();
ball.addComponent(new Transform({ position: new Vector3(56.0, 0.8, 56.0) }));
ball.addComponent(new GLTFShape("models/PongChamp_Assets_disk.glb"));
ball.addComponent(
  new OnPointerDown((e) => {
    log("test");
    const userPosition = camera.position;
    const ballPosition = ball.getComponent(Transform).position;
    const direction = userPosition
      .subtract(ballPosition)
      .multiply(new Vector3(-1, 0, -1));
    if (ball.hasComponent(BallMovement))
      ball.getComponent(BallMovement).direction.z =
        ball.getComponent(BallMovement).direction.z * -1;
    else ball.addComponent(new BallMovement(new Vector3(1.5, 0, 5.4)));
    // ws.send(JSON.stringify(direction.asArray()))
  })
);

// add ball sound

ball.addComponent(new AudioSource(new AudioClip("audios/ping_pong_sound.mp3")));

engine.addEntity(ball);

ws.onmessage = (ev) => {
  const json = JSON.parse(ev.data);
  if (ball.hasComponent(BallMovement))
    ball.getComponent(BallMovement).direction = new Vector3(
      json[0],
      json[1],
      json[2]
    );
  else ball.addComponent(new BallMovement(new Vector3(6.5, 0, 0.4)));
};

//Create ball movement component
@Component("BallMovement")
class BallMovement {
  direction: Vector3;
  constructor(direction: Vector3) {
    this.direction = direction;
  }
}
//System Creation
class BallSystem implements ISystem {
  update(dt: number): void {
    if (ball.hasComponent(BallMovement)) {
      ball
        .getComponent(Transform)
        .position.addInPlace(
          ball
            .getComponent(BallMovement)
            .direction.multiply(new Vector3().setAll(dt / 1))
        );
    }
    if (ball.getComponent(Transform).position.x > 74) {
      // play ballSOund
      ball.getComponent(AudioSource).playOnce();
      ball.getComponent(BallMovement).direction.x =
        ball.getComponent(BallMovement)?.direction.x * -1;
    }
    if (ball.getComponent(Transform).position.x < 38) {
      ball.getComponent(AudioSource).playOnce();
      ball.getComponent(BallMovement).direction.x =
        ball.getComponent(BallMovement)?.direction.x * -1;
    }
    if (ball.getComponent(Transform).position.z > 94) {
      redTeamScored();
    }
    if (ball.getComponent(Transform).position.z < 18) {
      // ball.addComponent(
      //   new AudioSource(new AudioClip("audios/applause_sound.mp3"))
      // );
      // ball.getComponent(AudioSource).playOnce();
      blueTeamScored();
    }
  }
}
let fireworks: Firework[] = [];

export const fireworkWest = new Firework(
  fireworkShape,
  new Transform({
    position: new Vector3(-0.1, -0.7, -36.8),
    scale: new Vector3(1.0, 1.0, 1.0),
    rotation: new Quaternion().setEuler(25.0, 20.0, 15.0),
  })
);
// Dash_Tweaker(fireworkWest);

export const fireworkEast = new Firework(
  fireworkShape,
  new Transform({
    position: new Vector3(-0.1, -0.7, 36.2),
    scale: new Vector3(1.0, 1.0, 1.0),
    rotation: new Quaternion().setEuler(25.0, 200.0, 15.0),
  })
);

export const fireworkNorth = new Firework(
  fireworkShape,
  new Transform({
    position: new Vector3(-47.1, -0.7, 1.2),
    scale: new Vector3(1.0, 1.0, 1.0),
    rotation: new Quaternion().setEuler(25.0, 110.0, 15.0),
  })
);

export const fireworkSouth = new Firework(
  fireworkShape,
  new Transform({
    position: new Vector3(45.9, -0.7, 2.2),
    scale: new Vector3(1.0, 1.0, 1.0),
    rotation: new Quaternion().setEuler(25.0, 290.0, 15.0),
  })
);

export const fireworkCenter = new Firework(
  fireworkShape,
  new Transform({
    position: new Vector3(-0.1, 0.1, -0.8),
    scale: new Vector3(1.0, 1.0, 1.0),
    rotation: new Quaternion().setEuler(25.0, 290.0, 15.0),
  })
);

fireworkWest.setParent(floor);
fireworkEast.setParent(floor);
fireworkNorth.setParent(floor);
fireworkSouth.setParent(floor);
// fireworkCenter.setParent(floor);

fireworks.push(fireworkEast);
fireworks.push(fireworkNorth);
fireworks.push(fireworkSouth);
fireworks.push(fireworkWest);
fireworks.push(fireworkWest);
// fireworks.push(fireworkCenter);
Dash_Tweaker(fireworkCenter);

function setFireWorks() {
  for (let index = 0; index < fireworks.length; index++) {
    // fireworks[index].launch();
    utils.setTimeout(1000, () => {
      fireworks[index].launch();
    });
  }
}

engine.addSystem(new BallSystem());

function blueTeamScored() {
  blueTeamScore++;
  log("blueTeamScore", blueTeamScore);
  reset("blueTeamScore");
}
function redTeamScored() {
  redTeamScore++;
  log("redTeamScore", redTeamScore);
  reset("redTeamScore");
}
function reset(teamScored: string) {
  setFireWorks();
  field.getComponent(AudioSource).playOnce();

  log("loge", ball.getComponent(AudioSource));
  if (teamScored === "blueTeamScore") {
    ball.getComponentOrCreate(Transform).position = new Vector3(56, 0.8, 36);
  }
  if (teamScored === "redTeamScore") {
    ball.getComponentOrCreate(Transform).position = new Vector3(56, 0.8, 76);
  }
  // ball.addComponentOrReplace(
  //   new Transform({ position: new Vector3(56.0, 0.8, 56.0) })
  // );

  ball.removeComponent(BallMovement);
}

// function ballSound() {
// }
