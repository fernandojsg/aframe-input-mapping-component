/* global AFRAME */

if (typeof AFRAME === 'undefined') {
  throw new Error('Component attempted to register before AFRAME was available.');
}

require('./activators');
require('./behaviours');

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
      var modifier = null;
      if (eventName.indexOf('.') !== -1) {
        var aux = eventName.split('.');
        button = aux[0]; // eg: trackpad
        modifierName = aux[1]; // eg: doublepress
        var Activator = AFRAME.inputActivators[modifierName];
        if (!Activator) {
          console.error('input-mapping: No activator found');
          break;
        }

        var onActivate = OnActivate(eventName);
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
    if (mappings && mappings.keyboard) {
      mappings = mappings.keyboard;
      var key = event.keyCode === 32 ? 'Space' : event.key;
      var keyEvent = (key + '_' + event.type.substr(3)).toLowerCase();
      var mapEvent = mappings[keyEvent];
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