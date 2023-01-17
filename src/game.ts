import { Dash_TriggerZone, Dash_Tweaker } from "dcldash"
let ats = 0
let bts = 0




//Create ball entity
const ball = new Entity()
ball.addComponent(new Transform({ position: new Vector3(1, 0.8, 1) }))
ball.addComponent(new SphereShape())
ball.addComponent(
  new OnPointerDown((e) => {
    if (ball.hasComponent(BallMovement)) ball.getComponent(BallMovement).direction.z = ball.getComponent(BallMovement).direction.z * -1
    else ball.addComponent(new BallMovement(new Vector3(1.5, 0, 5.4)))
  })
)
engine.addEntity(ball)

//Create ball movement component
@Component('BallMovement')
class BallMovement {
  direction: Vector3
  constructor(direction: Vector3) {
    this.direction = direction
  }
}
//System Creation
class BallSystem implements ISystem {
  update(dt: number): void {
    if (ball.hasComponent(BallMovement)) {
      ball
        .getComponent(Transform)
        .position.addInPlace(ball.getComponent(BallMovement).direction.multiply(new Vector3().setAll(dt / 1)))
    }
    if (ball.getComponent(Transform).position.x > 14) {
      ball.getComponent(BallMovement).direction.x = ball.getComponent(BallMovement)?.direction.x * -1
    }
    if (ball.getComponent(Transform).position.x < 1) {
      ball.getComponent(BallMovement).direction.x = ball.getComponent(BallMovement)?.direction.x * -1
    }
    if (ball.getComponent(Transform).position.z > 63) {
     bTeamScore()
    }
    if (ball.getComponent(Transform).position.z < 1) {
     aTeamScore()
    }
  }
}
engine.addSystem(new BallSystem())



function aTeamScore() {
  ats++
  reset()  
}
function bTeamScore() {
  bts++
  reset()
}
function reset() {
  log("heyehey")
  ball
  .addComponentOrReplace(new Transform({position: new Vector3(9.20,0.88,20.44)}))
}



