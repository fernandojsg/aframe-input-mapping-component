/* global AFRAME */

if (typeof AFRAME === 'undefined') {
  throw new Error('Component attempted to register before AFRAME was available.');
}

AFRAME.currentMapping = 'default';
AFRAME.inputMappings = {};

/**
 * Input Mapping component for A-Frame.
 */
AFRAME.registerSystem('input-mapping', {
  schema: {},
  mappings: {},
  mappingsPerControllers: {},
  _handlers: {},

  /**
   * Set if component needs multiple instancing.
   */
  multiple: false,

  /**
   * Called once when component is attached. Generally for initial setup.
   */
  init: function () {
    var self = this;

    this.keyboardHandler = this.keyboardHandler.bind(this);

    this.sceneEl.addEventListener('inputmappingregistered', function () {
      // @todo React to runtime input mappings register
    });

    // Controllers
    this.sceneEl.addEventListener('controllerconnected', function (evt) {
      if (!AFRAME.inputMappings) {
        console.warn('controller-mapping: No mappings defined');
        return;
      }

      for (var mappingName in AFRAME.inputMappings) {
        var mapping = AFRAME.inputMappings[mappingName];
        var controllerType = evt.detail.name;

        if (!self.mappingsPerControllers[controllerType]) {
          self.mappingsPerControllers[controllerType] = {};
        }

        var mappingsPerController = self.mappingsPerControllers[controllerType];

        function updateMappingsPerController (mappings) {
          // Generate a mapping for each controller: (Eg: vive-controls.triggerdown.default.paint)
          for (var eventName in mappings) {
            var mapping = mappings[eventName];
            if (!mappingsPerController[eventName]) {
              mappingsPerController[eventName] = {};
            }
            mappingsPerController[eventName][mappingName] = mapping;
          }
        }

        var commonMappings = mapping.common;
        if (commonMappings) {
          updateMappingsPerController(commonMappings);
        }

        var controllerMappings = mapping[controllerType];
        if (controllerMappings) {
          updateMappingsPerController(controllerMappings);
        } else {
          console.warn('controller-mapping: No mappings defined for controller type: ', controllerType);
        }

      }

      // Create the listener for each event
      self.removeControllersListeners();

      for (var eventName in mappingsPerController) {
        var key = controllerType + '->' + eventName;
        if (!self._handlers[key]) {
          var handler = function (event) {
            var mapping = mappingsPerController[event.type];
            var mappedEvent = mapping[AFRAME.currentMapping] ? mapping[AFRAME.currentMapping] : mapping.default;
            if (mappedEvent) {
              evt.detail.target.emit(mappedEvent, event.detail);
            }
          };
          evt.detail.target.addEventListener(eventName, handler);
          self._handlers[key] = handler;
        }
      }
    });

    // Keyboard
    document.addEventListener('keyup', this.keyboardHandler);
    document.addEventListener('keydown', this.keyboardHandler);
    document.addEventListener('keypress', this.keyboardHandler);
  },

  keyboardHandler: function (event) {
    var mappings = AFRAME.inputMappings[AFRAME.currentMapping];

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

  removeControllersListeners: function () {
    for (var controllerType in this.mappingsPerControllers) {
      var mappingPerController = this.mappingsPerControllers[controllerType];
      for (var eventName in mappingPerController) {
        var key = controllerType + '->' + eventName;
        this.sceneEl.removeEventListener(eventName, this._handlers[key]);
      }
    }

    this._handlers = {};
    this.mappingsPerControllers = {};
  },

});

AFRAME.registerInputMappings = function(mappings, override) {
  if (override || Object.keys(AFRAME.inputMappings).length === 0) {
    AFRAME.inputMappings = mappings;
  } else {
    for (var mappingName in mappings) {
      var mapping = mappings[mappingName];
      if (!AFRAME.inputMappings[mappingName]) {
        AFRAME.inputMappings[mappingName] = mapping;
        continue;
      }

      for (var controllerName in mapping) {
        var controllerMapping = mapping[controllerName]
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

  for (var i = 0; i < AFRAME.scenes.length; i++) {
    AFRAME.scenes[i].emit('inputmappingregistered');
  }
};

if (AFRAME.DEFAULT_INPUT_MAPPINGS) {
  AFRAME.registerInputMappings(AFRAME.DEFAULT_INPUT_MAPPINGS);
}
