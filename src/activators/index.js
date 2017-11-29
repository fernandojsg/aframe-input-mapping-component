AFRAME.inputActivators = {};

AFRAME.registerInputActivator = function (name, definition) {
  AFRAME.inputActivators[name] = definition;
};

require('./longpress.js');
require('./doubletouch.js');
require('./doublepress.js');
require('./simpleactivator.js');