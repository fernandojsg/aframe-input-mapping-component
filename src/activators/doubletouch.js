function DoubleTouch (el, button, activate) {
  this.lastTime = 0;
  this.timeOut = 250;
  
  el.addEventListener(button + 'touchstart', event => {
    var time = performance.now();
    if (time - this.lastTime < this.timeOut) {
      activate(event);
    } else {
      this.lastTime = time;
    }
  });
}
    
AFRAME.registerInputActivator('doubletouch', DoubleTouch);