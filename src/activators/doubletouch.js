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
    
AFRAME.registerInputActivator('doubletouch', DoubleTouch);