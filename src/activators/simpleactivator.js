function createSimpleActivator(suffix) {
  return function (el, button, onActivate) {
    el.addEventListener(button + suffix, onActivate);
  }
}

AFRAME.registerInputActivator('down', createSimpleActivator('down'));
AFRAME.registerInputActivator('up', createSimpleActivator('up'));
AFRAME.registerInputActivator('touchstart', createSimpleActivator('touchstart'));
AFRAME.registerInputActivator('touchend', createSimpleActivator('touchend'));
