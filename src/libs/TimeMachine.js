export default class TimeMachine {
  constructor(ctx) {
    this.ctx = ctx
    this.data = []
    this.now = -1
  }

  add() {
    if ((this.data.length - this.now) !== 1) {
      let popCount = this.data.length - 1 - this.now
      let i
      for (i = 0; i < popCount; i++) {
        this.data.pop()
      }
    }
    this.data.push(this.ctx.get())
    this.now++
  }

  restore() {
    if (this.now == this.data.length - 1) return
    this.now++;
    return this.data[this.now]
  }

  undo() {
    if (this.now == 0) return
    this.now--;
    return this.data[this.now]
  }

  init() {
    this.now = 0
    return this.data[0]
  }

  reset() {
    let init = this.init()
    this.data = []
    this.data.push(init)
    this.now = 0
  }
}
