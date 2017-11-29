function DPad (el, buttonName) {
  this.buttonName = buttonName;
  this.onButtonPresed = this.onButtonPresed.bind(this);
  this.onAxisMove = this.onAxisMove.bind(this);
  el.addEventListener('trackpaddown', this.onButtonPresed);
  el.addEventListener('trackpadup', this.onButtonPresed);
  el.addEventListener('axismove', this.onAxisMove);
  this.lastPos = [0,0];
  this.el = el;
};

DPad.prototype = {
  onAxisMove: function(event) {
    this.lastPos = event.detail.axis;
  },
  
  onButtonPresed: function (event) {
    const [x, y] = this.lastPos;
    const state = 'trackpadup'.includes(event.type) ? "up" : "down";
    var centerZone = 0.5;
    const direction =
      state === "up" && this.lastDirection // Always trigger the up event for the last down event
        ? this.lastDirection
        : x * x + y * y < centerZone * centerZone // If within center zone angle does not matter
          ? "center"
          : angleToDirection(Math.atan2(x, y));

    this.el.emit(`${this.buttonName}dpad${direction}${state}`);
        
    if (state === "down") {
      this.lastDirection = direction;
    } else {
      delete this.lastDirection;
    }
  },

  removeListeners: function () {
    el.removeEventListener('trackpaddown', this.onButtonPresed);
    el.removeEventListener('trackpadup', this.onButtonPresed);
    el.removeEventListener('axismove', this.onAxisMove);
  }
};

const angleToDirection = function (angle) {
  angle = (angle * THREE.Math.RAD2DEG + 180 + 45) % 360;
  if (angle > 0 && angle < 90) {
    return "down";
  } else if (angle >= 90 && angle < 180) {
    return "left";
  } else if (angle >= 180 && angle < 270) {
    return "up";
  } else {
    return "right";
  }
};

AFRAME.registerInputBehaviour('dpad', DPad);
