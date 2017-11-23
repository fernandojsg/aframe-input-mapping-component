function LongPress (el, button, targetEventName) {
  this.pressTimer = null;
  this.timeOut = 1000;
  
  el.addEventListener(button + 'down', event => {
    this.pressTimer = window.setTimeout(function () {
      event.target.emit(targetEventName, event.detail);
    }, 1000);
  });
  
  el.addEventListener(button + 'up', event => {
      clearTimeout(this.pressTimer);
  });
}

AFRAME.registerInputActivator('longpress', LongPress);