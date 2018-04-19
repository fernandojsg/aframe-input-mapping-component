function DPad(el, buttonName) {
  this.buttonName = buttonName;
  this.onButtonPressed = this.onButtonPressed.bind(this);
  this.onAxisMove = this.onAxisMove.bind(this);
  this.lastPos = [0, 0];
  this.el = el;
}

DPad.prototype = {
  addEventListeners: function() {
    this.el.addEventListener("trackpaddown", this.onButtonPressed);
    this.el.addEventListener("trackpadup", this.onButtonPressed);
    this.el.addEventListener("axismove", this.onAxisMove);
  },

  removeEventListeners: function() {
    this.el.removeEventListener("trackpaddown", this.onButtonPressed);
    this.el.removeEventListener("trackpadup", this.onButtonPressed);
    this.el.removeEventListener("axismove", this.onAxisMove);
  },

  onAxisMove: function(event) {
    this.lastPos = event.detail.axis;
  },

  onButtonPressed: function(event) {
    const [x, y] = this.lastPos;
    const state = "trackpadup".includes(event.type) ? "up" : "down";
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

  removeListeners: function() {
    el.removeEventListener("trackpaddown", this.onButtonPressed);
    el.removeEventListener("trackpadup", this.onButtonPressed);
    el.removeEventListener("axismove", this.onAxisMove);
  }
};

const angleToDirection = function(angle) {
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

AFRAME.registerInputBehaviour("dpad", DPad);
