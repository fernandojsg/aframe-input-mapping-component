AFRAME.inputModifiers = {};

AFRAME.registerInputModifier = function (name, definition) {
  AFRAME.inputModifiers[name] = definition;
};

function LongPress (el, button, targetEventName) {
  this.pressTimer = null;
  this.timeOut = 1000;
  
  el.addEventListener(button + 'down', event => {
      this.pressTimer = window.setTimeout(function () {  event.target.emit(targetEventName, event.detail); }, 1000);
  });
  
  el.addEventListener(button + 'up', event => {
      clearTimeout(this.pressTimer);
  });
}
  
function DoublePress (el, button, targetEventName) {
  this.lastTime = 0;
  this.timeOut = 250;
  
  el.addEventListener(button + 'down', event => {
      var time = performance.now();
      if (time - this.lastTime < this.timeOut) {
      event.target.emit(targetEventName, event.detail);
      } else {
      this.lastTime = time;
      }
  });
}
  
function DoubleTouch (el, button, targetEventName) {
  this.lastTime = 0;
  this.timeOut = 250;
  
  el.addEventListener(button + 'touchstart', event => {
      var time = performance.now();
      if (time - this.lastTime < this.timeOut) {
      event.target.emit(targetEventName, event.detail);
      } else {
      this.lastTime = time;
      }
  });
}
    
AFRAME.registerInputModifier('longpress', LongPress);
AFRAME.registerInputModifier('doublepress', DoublePress);
AFRAME.registerInputModifier('doubletouch', DoubleTouch);
