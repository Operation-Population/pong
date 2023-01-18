import { Dash_TriggerZone, Dash_Tweaker } from "dcldash"
let ats = 0
let bts = 0
//Entities
const disk = new Entity()
const goalPost = new Entity()
const scoreBoard = new Entity()
const arche1 = new Entity()
const arche2 = new Entity()
const glass = new Entity()
const ground = new Entity()
const surround = new Entity()
const floor = new Entity()

//---
const camera = new Camera()

//adding the models
disk.addComponent(new GLTFShape('models/PongChamp_Assets_disk.glb'))
goalPost.addComponent(new GLTFShape('models/PongChamp_Assets_GoalPosts.glb'))
scoreBoard.addComponent(new GLTFShape('models/PongChamp_Assets_ScoreBoard.glb'))
arche1.addComponent(new GLTFShape('models/PongChamp_Env_arche1.glb'))
arche2.addComponent(new GLTFShape('models/PongChamp_Env_arches.glb'))
glass.addComponent(new GLTFShape('models/PongChamp_Env_ArenaGlass.glb'))
ground.addComponent(new GLTFShape('models/PongChamp_Env_ArenaGround.glb'))
surround.addComponent(new GLTFShape('models/PongChamp_Env_ArenaSurround.glb'))
floor.addComponent(new GLTFShape('models/PongChamp_Env_Floor.glb'))




//arche1.setParent(ground)
//arche2.setParent(ground)
goalPost.setParent(ground)
surround.setParent(ground)
glass.setParent(ground)
scoreBoard.setParent(ground)



//Position fill

ground.addComponent(new Transform({
  position: new Vector3(48.000, 0.880, 59.000),
  scale: new Vector3(1.000, 1.000, 1.000),
  rotation: new Quaternion().setEuler(0.000, 270.000, 0.000)
}))
arche2.addComponent(new Transform({
  position: new Vector3(22.000, 0.000, 0.000),
  scale: new Vector3(1.000, 1.000, 1.000),
  rotation: new Quaternion().setEuler(0.000, 0.000, 0.000),
}))
scoreBoard.addComponent(new  Transform({
  position: new Vector3(0.000, 25.000, 0.000),
  scale: new Vector3(1.000, 1.000, 1.000),
  rotation: new Quaternion().setEuler(0.000, 0.000, 0.000),
}))



engine.addEntity(ground)


//Server
const ws = new WebSocket("ws://localhost:13370")

//Create ball entity
const ball = new Entity()
ball.addComponent(new Transform({ position: new Vector3(47.43,9.48,58.58) }))
ball.addComponent(new GLTFShape('models/PongChamp_Assets_disk.glb'))
ball.addComponent(
  new OnPointerDown((e) => {
    log('test')
    const userPosition = camera.position
    const ballPosition = ball.getComponent(Transform).position
    const direction = userPosition.subtract(ballPosition).multiply(new Vector3(-1,0,-1))
    ws.send(JSON.stringify(direction.asArray()))
  })
)


engine.addEntity(ball)

ws.onmessage = (ev)=>{
  const json = JSON.parse(ev.data)
  if (ball.hasComponent(BallMovement)) ball.getComponent(BallMovement).direction = new Vector3(json[0],json[1],json[2])
  else ball.addComponent(new BallMovement(new Vector3(6.5, 0, 0.4)))
}


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
    if (ball.getComponent(Transform).position.x > 65) {
      ball.getComponent(BallMovement).direction.x = ball.getComponent(BallMovement)?.direction.x * -1
    }
    if (ball.getComponent(Transform).position.x < 32) {
      ball.getComponent(BallMovement).direction.x = ball.getComponent(BallMovement)?.direction.x * -1
    }
    if (ball.getComponent(Transform).position.z > 96) {
      bTeamScore()
    }
    if (ball.getComponent(Transform).position.z < 21) {
      aTeamScore()
    }
  }
}
engine.addSystem(new BallSystem())

function aTeamScore() {
  ats++
  log(ats)
  reset()
}
function bTeamScore() {
  bts++
  log(bts)
  reset()
}
function reset() {
  
  ball
    .addComponentOrReplace(new Transform({ position: new Vector3(47.43,9.46,58.58) }))

  ball.removeComponent(BallMovement)
}



