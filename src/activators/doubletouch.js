function DoubleTouch (el, button, onActivate) {
  this.lastTime = 0;
  this.timeOut = 250;
  this.eventName = button + 'touchstart';
  this.el = el;
  this.onActivate = onActivate;
  
  this.onButtonDown = this.onButtonDown.bind(this);

  el.addEventListener(this.eventName, this.onButtonDown);
}

DoubleTouch.prototype = {
  onButtonDown (event) {
    var time = performance.now();
    if (time - this.lastTime < this.timeOut) {
      this.onActivate(event.detail);
    } else {
      this.lastTime = time;
    }
  },

  removeListeners () {
    this.el.removeEventListener(this.eventName, this.onButtonDown);
  }
}

AFRAME.registerInputActivator('doubletouch', DoubleTouch);