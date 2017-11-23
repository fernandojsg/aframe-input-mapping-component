function LongPress (el, button, activate) {
  this.pressTimer = null;
  this.timeOut = 1000;
  
  el.addEventListener(button + 'down', event => {
    this.pressTimer = window.setTimeout(function () {
      activate(event);
    }, 1000);
  });
  
  el.addEventListener(button + 'up', event => {
      clearTimeout(this.pressTimer);
  });
}

AFRAME.registerInputActivator('longpress', LongPress);