AFRAME.inputBehaviours = {};

AFRAME.registerInputBehaviour = function (name, definition) {
  AFRAME.inputBehaviours[name] = definition;
};

require('./dpad.js');