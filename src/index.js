/* global AFRAME */

if (typeof AFRAME === 'undefined') {
  throw new Error('Component attempted to register before AFRAME was available.');
}

require('./activators');
require('./behaviours');

AFRAME.currentInputMapping = null;
AFRAME.inputMappings = {};
AFRAME.inputActions = {};
AFRAME.activeBehaviours = {};

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

    this.sceneEl.addEventListener("controllerdisconnected", function(event) {
      var controller = self.findMatchingController(event.target);
      if (controller) {
        self.removeControllerListeners(controller);
        self.removeActiveBehaviours(controller);
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

  removeActiveBehaviours: function(controller) {
    const activeBehaviourKey = `${controller.name}${controller.hand ? "_"+controller.hand : ""}`;
    for (var behaviourName in AFRAME.activeBehaviours[activeBehaviourKey]) {
      if (AFRAME.activeBehaviours[activeBehaviourKey][behaviourName].removeEventListeners) {
        AFRAME.activeBehaviours[activeBehaviourKey][behaviourName].removeEventListeners();
      }
    }
  },

  updateBehaviours: function(controller) {
    var behavioursPerController = this.mappingsPerControllers[controller.name].behaviours;
    if (!behavioursPerController) {return;}
    const activeBehaviourKey = `${controller.name}${controller.hand ? "_"+controller.hand : ""}`;
    AFRAME.activeBehaviours[activeBehaviourKey] = {};
    for (var button in behavioursPerController) {
      var behaviourName = behavioursPerController[button];
      var behaviourDefinition = AFRAME.inputBehaviours[behaviourName];
      if (behaviourDefinition) {
        var behaviour = new behaviourDefinition(controller.element, button);
        if (behaviour.addEventListeners) {
          behaviour.addEventListeners();
        }
        AFRAME.activeBehaviours[activeBehaviourKey][behaviourName] = behaviour;
      }
    }
  },

  updateControllersListeners: function (controllerObj) {
    this.removeControllerListeners(controllerObj);
    this.removeActiveBehaviours(controllerObj);

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

    function emit(event, mappedEvent){
      if (typeof mappedEvent ==='object') {
        // Handedness
        var controller = self.findMatchingController(event.target);
        mappedEvent = mappedEvent[controller.hand];
        if (!mappedEvent) { return; }
      }
      event.target.emit(mappedEvent, event.detail);
    };
    var OnActivate = function(eventName)  {
      return function (event) {
        var mapping = mappingsPerController.mappings[eventName];
        var mappedEvent = mapping[AFRAME.currentInputMapping];

        if (Array.isArray( mappedEvent)){
          for (let mappedEventItem of mappedEvent)
          {
            emit(event, mappedEventItem);
          }
        }
        else {
          emit(event, mappedEvent);
        }
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
