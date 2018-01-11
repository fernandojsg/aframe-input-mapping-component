/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

	/* global AFRAME */

	if (typeof AFRAME === 'undefined') {
	  throw new Error('Component attempted to register before AFRAME was available.');
	}

	__webpack_require__(1);
	__webpack_require__(6);

	AFRAME.currentInputMapping = null;
	AFRAME.inputMappings = {};
	AFRAME.inputActions = {};

	var behaviour = {
	  trackpad: 'dpad'
	};

	AFRAME.registerSystem('input-mapping', {
	  mappings: {},
	  mappingsPerControllers: {},
	  loadedControllers: [],

	  init: function () {
	    var self = this;

	    this.keyboardHandler = this.keyboardHandler.bind(this);

	    this.sceneEl.addEventListener('inputmappingregistered', function () {
	      self.removeControllersListeners();
	      for (var i = 0; i < self.loadedControllers.length; i++) {
	        var controllerObj = self.loadedControllers[i];
	        self.updateControllersListeners(controllerObj);
	      }
	    });

	    // Controllers
	    this.sceneEl.addEventListener('controllerconnected', function (event) {
	      var matchedController = self.findMatchingController(event.target);

	      if (matchedController) {
	        self.updateControllersListeners(matchedController);
	        return;
	      }

	      var controllerObj = {
	        name: event.detail.name,
	        hand: event.detail.component.data.hand,
	        element: event.target,
	        handlers: {},
	        activators: {}
	      };
	      self.loadedControllers.push(controllerObj);

	      self.updateControllersListeners(controllerObj);
	    });

	    this.sceneEl.addEventListener('controllerdisconnected', function (event) {
	      var controller = self.findMatchingController(event.target);
	      if (controller) {
	        self.removeControllerListeners(controller);
	      }
	    });

	    // Keyboard
	    this.addKeyboardListeners();
	  },

	  findMatchingController: function (matchElement) {
	    var controller;
	    var i;
	    for (i = 0; i < this.loadedControllers.length; i++) {
	      controller = this.loadedControllers[i];
	      if (controller.element === matchElement) {
	        return controller;
	      }
	    }
	    return undefined;
	  },

	  addKeyboardListeners: function () {
	    document.addEventListener('keyup', this.keyboardHandler);
	    document.addEventListener('keydown', this.keyboardHandler);
	    document.addEventListener('keypress', this.keyboardHandler);
	  },

	  removeKeyboardListeners: function () {
	    document.removeEventListener('keyup', this.keyboardHandler);
	    document.removeEventListener('keydown', this.keyboardHandler);
	    document.removeEventListener('keypress', this.keyboardHandler);
	  },

	  removeControllerListeners: function (controller) {
	    // Remove events handlers
	    for (var eventName in controller.handlers) {
	      var handler = controller.handlers[eventName];
	      controller.element.removeEventListener(eventName, handler);
	    }
	    controller.handlers = {};

	    // Remove activators
	    for (var activatorName in controller.activators) {
	      var activator = controller.activators[activatorName];
	      activator.removeListeners();
	    }
	    
	    controller.activators = {};
	  },

	  updateBehaviours: function (controllerObj) {
	    var controllerBehaviour = AFRAME.inputBehaviours[controllerObj.name];
	    var behavioursPerController = this.mappingsPerControllers[controllerObj.name].behaviours;
	    if (!behavioursPerController) { return; }
	    for (var button in behavioursPerController) {
	      var behaviourName = behavioursPerController[button];
	      var behaviourDefinition = AFRAME.inputBehaviours[behaviourName];
	      if (behaviourDefinition) {
	        var behaviour = new behaviourDefinition(controllerObj.element, button);
	      }
	    }
	  },

	  updateControllersListeners: function (controllerObj) {
	    this.removeControllerListeners(controllerObj);

	    if (!AFRAME.inputMappings) {
	      console.warn('input-mapping: No mappings defined');
	      return;
	    }

	    var mappingsPerController = this.mappingsPerControllers[controllerObj.name] = {
	      mappings: {},
	      behaviours: {}
	    };

	    // Create the listener for each event
	    for (var mappingName in AFRAME.inputMappings.mappings) {
	      var mapping = AFRAME.inputMappings.mappings[mappingName];

	      var commonMappings = mapping.common;
	      if (commonMappings) {
	        this.updateMappingsPerController(commonMappings, mappingsPerController, mappingName);
	      }

	      var controllerMappings = mapping[controllerObj.name];
	      if (controllerMappings) {
	        this.updateMappingsPerController(controllerMappings, mappingsPerController, mappingName);
	      } else {
	        console.warn('input-mapping: No mappings defined for controller type: ', controllerObj.name);
	      }
	    }

	    // Mapping the behaviours
	    for (var mappingName in AFRAME.inputMappings.behaviours) {
	      var behaviour = AFRAME.inputMappings.behaviours[mappingName];

	      var controllerBehaviours = behaviour[controllerObj.name];
	      if (controllerBehaviours) {
	        this.updateBehavioursPerController(controllerBehaviours, mappingsPerController, mappingName);
	      }
	    }

	    var self = this;

	    var OnActivate = function(eventName)  {
	      return function (event) {
	        var mapping = mappingsPerController.mappings[eventName];
	        var mappedEvent = mapping[AFRAME.currentInputMapping];
	        if (typeof mappedEvent ==='object') {
	          // Handedness
	          var controller = self.findMatchingController(event.target);
	          mappedEvent = mappedEvent[controller.hand];
	          if (!mappedEvent) { return; }
	        }
	        event.target.emit(mappedEvent, event.detail);
	      } 
	    }; 

	    for (var eventName in mappingsPerController.mappings) {
	      // Check for activators
	      if (eventName.indexOf('.') !== -1) {
	        var aux = eventName.split('.');
	        var button = aux[0]; // eg: trackpad
	        var activatorName = aux[1]; // eg: doublepress
	        var onActivate = OnActivate(eventName);
	        var Activator = AFRAME.inputActivators[activatorName];
	        controllerObj.activators[eventName] = new Activator(controllerObj.element, button, onActivate);
	      }
	      
	      var onActivate = OnActivate(eventName);
	      controllerObj.element.addEventListener(eventName, onActivate);
	      controllerObj.handlers[eventName] = onActivate;
	    }

	    this.updateBehaviours(controllerObj);
	  },

	  checkValidInputMapping: function () {
	    if (AFRAME.currentInputMapping === null) {
	      console.warn('input-mapping: No current input mapping defined.');
	    }
	  },

	  keyboardHandler: function (event) {
	    this.checkValidInputMapping();
	    if (AFRAME.inputMappings &&
	        AFRAME.inputMappings.mappings[AFRAME.currentInputMapping] &&
	        AFRAME.inputMappings.mappings[AFRAME.currentInputMapping].keyboard
	    ) {
	      var currentKeyboardMapping =
	            AFRAME.inputMappings.mappings[AFRAME.currentInputMapping].keyboard;
	      var key = event.keyCode === 32 ? "Space" : event.key;
	      var keyEvent = (key + "_" + event.type.substr(3)).toLowerCase();
	      var mapEvent = currentKeyboardMapping[keyEvent];
	      if (mapEvent) {
	        this.sceneEl.emit(mapEvent);
	      }
	    }
	  },

	  updateBehavioursPerController: function (behaviours, mappingsPerController, mappingName) {
	    for (var button in behaviours) {
	      var behaviour = behaviours[button];
	      
	      if (!mappingsPerController.behaviours[button]) {
	        mappingsPerController.behaviours[button] = behaviour;
	      }
	    }
	  },
	  
	  updateMappingsPerController: function (mappings, mappingsPerController, mappingName) {
	    // Generate a mapping for each controller: (Eg: vive-controls.triggerdown.default.paint)
	    for (var eventName in mappings) {
	      var mapping = mappings[eventName];
	      if (!mappingsPerController.mappings[eventName]) {
	        mappingsPerController.mappings[eventName] = {};
	      }
	      mappingsPerController.mappings[eventName][mappingName] = mapping;
	    }
	  },

	  removeControllersListeners: function () {
	    for (var i = 0; i < this.loadedControllers.length; i++) {
	      var controller = this.loadedControllers[i];
	      this.removeControllerListeners(controller);
	    }
	    this.mappingsPerControllers = {
	      mappings: {},
	      behaviours: {}
	    };
	  }
	});

	AFRAME.registerInputActions = function (inputActions, defaultActionSet) {
	  AFRAME.inputActions = inputActions;
	  if (typeof defaultActionSet !== 'undefined') {
	    if (AFRAME.inputActions[defaultActionSet]) {
	      AFRAME.currentInputMapping = defaultActionSet;
	    } else {
	      console.error(`input-mapping: trying to set a non registered action set '${defaultActionSet}'`);
	    }
	  }
	};

	AFRAME.registerInputMappings = function (data, override) {
	  if (override || Object.keys(AFRAME.inputMappings).length === 0) {
	    AFRAME.inputMappings = data;
	  } else {
	    // @todo Merge behaviours too
	    AFRAME.inputMappings.behaviours = data.behaviours;

	    // Merge mappings
	    for (var mappingName in data.mappings) {
	      var mapping = data.mappings[mappingName];
	      if (!AFRAME.inputMappings[mappingName]) {
	        AFRAME.inputMappings[mappingName] = mapping;
	        continue;
	      }

	      for (var controllerName in mapping) {
	        var controllerMapping = mapping[controllerName];
	        if (!AFRAME.inputMappings[mappingName][controllerName]) {
	          AFRAME.inputMappings[mappingName][controllerName] = controllerMapping;
	          continue;
	        }

	        for (var eventName in controllerMapping) {
	          AFRAME.inputMappings[mappingName][controllerName][eventName] = controllerMapping[eventName];
	        }
	      }
	    }
	  }

	  if (!AFRAME.scenes) { return; }

	  for (var i = 0; i < AFRAME.scenes.length; i++) {
	    AFRAME.scenes[i].emit('inputmappingregistered');
	  }
	};

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

	AFRAME.inputActivators = {};

	AFRAME.registerInputActivator = function (name, definition) {
	  AFRAME.inputActivators[name] = definition;
	};

	__webpack_require__(2);
	__webpack_require__(3);
	__webpack_require__(4);
	__webpack_require__(5);

/***/ }),
/* 2 */
/***/ (function(module, exports) {

	function LongPress (el, button, onActivate) {
	  this.lastTime = 0;
	  this.timeOut = 250;
	  this.eventNameDown = button + 'down';
	  this.eventNameUp = button + 'up';

	  this.el = el;
	  this.onActivate = onActivate;
	  
	  this.onButtonDown = this.onButtonDown.bind(this);
	  this.onButtonUp = this.onButtonUp.bind(this);
	  
	  el.addEventListener(this.eventNameDown, this.onButtonDown);
	  el.addEventListener(this.eventNameUp, this.onButtonUp);
	}

	LongPress.prototype = {
	  onButtonDown (event) {
	    var self = this;
	    this.pressTimer = window.setTimeout(function () {
	      self.onActivate(event);
	    }, 1000);
	  },

	  onButtonUp (event) {
	    clearTimeout(this.pressTimer);
	  },

	  removeListeners () {
	    this.el.removeEventListener(this.eventNameDown, this.onButtonDown);
	    this.el.removeEventListener(this.eventNameUp, this.onButtonUp);
	  }
	}

	AFRAME.registerInputActivator('longpress', LongPress);

/***/ }),
/* 3 */
/***/ (function(module, exports) {

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

/***/ }),
/* 4 */
/***/ (function(module, exports) {

	function DoublePress (el, button, onActivate) {
	  this.lastTime = 0;
	  this.timeOut = 250;
	  this.eventName = button + 'down';
	  this.el = el;
	  this.onActivate = onActivate;
	  
	  this.onButtonDown = this.onButtonDown.bind(this);

	  el.addEventListener(this.eventName, this.onButtonDown);
	}

	DoublePress.prototype = {
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

	AFRAME.registerInputActivator('doublepress', DoublePress);

/***/ }),
/* 5 */
/***/ (function(module, exports) {

	function createSimpleActivator(suffix) {
	  return function (el, button, onActivate) {
	    el.addEventListener(button + suffix, onActivate);
	  }
	}

	AFRAME.registerInputActivator('down', createSimpleActivator('down'));
	AFRAME.registerInputActivator('up', createSimpleActivator('up'));
	AFRAME.registerInputActivator('touchstart', createSimpleActivator('touchstart'));
	AFRAME.registerInputActivator('touchend', createSimpleActivator('touchend'));


/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

	AFRAME.inputBehaviours = {};

	AFRAME.registerInputBehaviour = function (name, definition) {
	  AFRAME.inputBehaviours[name] = definition;
	};

	__webpack_require__(7);

/***/ }),
/* 7 */
/***/ (function(module, exports) {

	function DPad (el, buttonName) {
	  this.buttonName = buttonName;
	  this.onButtonPresed = this.onButtonPresed.bind(this);
	  this.onAxisMove = this.onAxisMove.bind(this);
	  el.addEventListener('trackpaddown', this.onButtonPresed);
	  el.addEventListener('trackpadup', this.onButtonPresed);
	  el.addEventListener('axismove', this.onAxisMove);
	  this.lastPos = [0,0];
	  this.el = el;
	};

	DPad.prototype = {
	  onAxisMove: function(event) {
	    this.lastPos = event.detail.axis;
	  },
	  
	  onButtonPresed: function (event) {
	    const [x, y] = this.lastPos;
	    const state = 'trackpadup'.includes(event.type) ? "up" : "down";
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

	  removeListeners: function () {
	    el.removeEventListener('trackpaddown', this.onButtonPresed);
	    el.removeEventListener('trackpadup', this.onButtonPresed);
	    el.removeEventListener('axismove', this.onAxisMove);
	  }
	};

	const angleToDirection = function (angle) {
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

	AFRAME.registerInputBehaviour('dpad', DPad);


/***/ })
/******/ ]);