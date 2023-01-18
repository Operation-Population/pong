import { Dash_TriggerZone, Dash_Tweaker } from "dcldash";
let TeamAScore = 0;
let TeamBScore = 0;

//Create ball entity

const floor = new Entity();
const floor_model = new GLTFShape("models/PongChamp_Env_Floor.glb");
floor.addComponent(floor_model);
floor.addComponent(new Transform({ position: new Vector3(56, 0, 56) }));
// Dash_Tweaker(floor);

//add dual arche
const dual_arches_entity = new Entity();
const dual_arches_model = new GLTFShape("models/PongChamp_Env_arches.glb");
dual_arches_entity.addComponent(dual_arches_model);
dual_arches_entity.addComponentOrReplace(
  new Transform({
    position: new Vector3(1.0, 0.0, -32.0),
    scale: new Vector3(1.0, 1.0, 1.0),
    rotation: new Quaternion().setEuler(0.0, 90.0, 360.0),
  })
);
// Dash_Tweaker(dual_arches_entity);
dual_arches_entity.setParent(floor);

const arche_entity = new Entity();
const arche_entity_model = new GLTFShape("models/PongChamp_Env_arche1.glb");
arche_entity.addComponent(arche_entity_model);
arche_entity.addComponentOrReplace(
  new Transform({
    position: new Vector3(0.0, 0.0, -4.0),
    scale: new Vector3(1.0, 1.0, 1.0),
    rotation: new Quaternion().setEuler(360.0, 90.0, 360.0),
  })
);
// Dash_Tweaker(arche_entity);
arche_entity.setParent(floor);

const arena_ground_entity = new Entity();
const arena_ground_model = new GLTFShape(
  "models/PongChamp_Env_ArenaGround.glb"
);
arena_ground_entity.addComponent(arena_ground_model);
arena_ground_entity.addComponentOrReplace(
  new Transform({
    position: new Vector3(0.0, -7.7, -4.0),
    scale: new Vector3(1.0, 1.0, 1.0),
    rotation: new Quaternion().setEuler(360.0, 90.0, 0.0),
  })
);

// Dash_Tweaker(arena_ground_entity);
arena_ground_entity.setParent(floor);

const ball = new Entity();

ball.addComponent(
  new Transform({
    position: new Vector3(55.9, 0.8, 52.0),
  })
);
ball.addComponent(new GLTFShape("models/PongChamp_Assets_disk.glb"));
ball.addComponent(
  new OnPointerDown((e) => {
    if (ball.hasComponent(BallMovement))
      ball.getComponent(BallMovement).direction.z =
        ball.getComponent(BallMovement).direction.z * -1;
    else ball.addComponent(new BallMovement(new Vector3(1.5, 0, 5.4)));
  })
);

Dash_Tweaker(ball);
// ball.setParent(arena_ground_entity);

const goal_post_entity = new Entity();
const goal_post_model = new GLTFShape("models/PongChamp_Assets_GoalPosts.glb");
goal_post_entity.addComponent(goal_post_model);
goal_post_entity.addComponentOrReplace(
  new Transform({
    position: new Vector3(0.0, 0.0, 0.0),
    scale: new Vector3(1.0, 1.0, 1.0),
    rotation: new Quaternion().setEuler(360.0, 360.0, 0.0),
  })
);
// Dash_Tweaker(goal_post_entity);
goal_post_entity.setParent(arena_ground_entity);
arena_ground_entity.setParent(floor);

const arena_glass_entity = new Entity();
const arena_glass_model = new GLTFShape("models/PongChamp_Env_ArenaGlass.glb");

arena_glass_entity.addComponent(arena_glass_model);
arena_glass_entity.addComponentOrReplace(
  new Transform({
    position: new Vector3(0.0, -8.0, -4.0),
    scale: new Vector3(1.0, 1.0, 1.0),
    rotation: new Quaternion().setEuler(360.0, 90.0, 0.0),
  })
);

arena_glass_entity.setParent(floor);

// Dash_Tweaker(arena_glass_entity);

const score_board_entity = new Entity();
const score_board_model = new GLTFShape(
  "models/PongChamp_Assets_ScoreBoard.glb"
);

score_board_entity.addComponent(score_board_model);
score_board_entity.addComponentOrReplace(
  new Transform({
    position: new Vector3(0.0, 15.0, 0.0),
    scale: new Vector3(1.0, 1.0, 1.0),
    rotation: new Quaternion().setEuler(360.0, 90.0, 0.0),
  })
);

score_board_entity.setParent(arche_entity);

// Dash_Tweaker(score_board_entity);

const arena_surround_entity = new Entity();
const arena_surround_model = new GLTFShape(
  "models/PongChamp_Env_ArenaSurround.glb"
);

arena_surround_entity.addComponent(arena_surround_model);
arena_surround_entity.addComponentOrReplace(
  new Transform({
    position: new Vector3(0.0, 0.0, -4.0),
    scale: new Vector3(1.0, 1.0, 1.0),
    rotation: new Quaternion().setEuler(360.0, 90.0, 360.0),
  })
);

arena_surround_entity.setParent(floor);

// Dash_Tweaker(arena_surround_entity);

engine.addEntity(floor);
engine.addEntity(ball);

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
    if (ball.getComponent(Transform).position.x > 73) {
      ball.getComponent(BallMovement).direction.x =
        ball.getComponent(BallMovement)?.direction.x * -1;
    }
    if (ball.getComponent(Transform).position.x < 38) {
      ball.getComponent(BallMovement).direction.x =
        ball.getComponent(BallMovement)?.direction.x * -1;
    }
    if (ball.getComponent(Transform).position.z > 93) {
      bTeamScore();
    }
    if (ball.getComponent(Transform).position.z < 10) {
      aTeamScore();
    }
  }
}
engine.addSystem(new BallSystem());

function aTeamScore() {
  TeamAScore++;
  reset();
}
function bTeamScore() {
  TeamBScore++;
  reset();
}
function reset() {
  log("heyehey");
  ball.addComponentOrReplace(
    new Transform({ position: new Vector3(9.2, 0.88, 20.44) })
  );
}
