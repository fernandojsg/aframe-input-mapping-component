/* global AFRAME */

if (typeof AFRAME === 'undefined') {
  throw new Error('Component attempted to register before AFRAME was available.');
}

AFRAME.inputMappings = {};

/**
 * Input Mapping component for A-Frame.
 */
AFRAME.registerSystem('input-mapping', {
  schema: {},
  mappings: {},
  mappingsPerControllers: {},
  currentMapping: 'default',

  /**
   * Set if component needs multiple instancing.
   */
  multiple: false,

  /**
   * Called once when component is attached. Generally for initial setup.
   */
  init: function () {
    var self = this;

    // Controllers
    this.sceneEl.addEventListener('controllerconnected', function (evt) {
      if (!AFRAME.inputMappings) {
        console.warn('controller-mapping: No mappings defined');
        return;
      }

      for (var mappingName in AFRAME.inputMappings) {
        var mapping = AFRAME.inputMappings[mappingName];
        var controllerModel = evt.detail.name;

        if (!self.mappingsPerControllers[controllerModel]) {
          self.mappingsPerControllers[controllerModel] = {};
        }

        var mappingsPerController = self.mappingsPerControllers[controllerModel];

        var controllerMappings = mapping[controllerModel];
        if (!controllerMappings) {
          console.warn('controller-mapping: No mappings defined for controller type: ', controllerModel);
          return;
        }

        for (var eventName in controllerMappings) {
          mapping = controllerMappings[eventName];
          if (!mappingsPerController[eventName]) {
            mappingsPerController[eventName] = {};
          }

          mappingsPerController[eventName][mappingName] = mapping;
        }
      }

      for (var eventName in mappingsPerController) {
        self.sceneEl.addEventListener(eventName, function(event2) {
          var mapping = mappingsPerController[event2.type];

          var mappedEvent = mapping[self.currentMapping] ? mapping[self.currentMapping] : mapping.default;
          if (mappedEvent) {
            evt.detail.target.emit(mappedEvent, event2.detail);
          }
        });
      }
    });

    // Keyboard (Very WIP)
    var scene = this.sceneEl;
    document.addEventListener('keyup', function (event) {
      var mappings = AFRAME.inputMappings[self.currentMapping];

      if (mappings && mappings.keyboard) {
        mappings = mappings.keyboard;

        var mapEvent = mappings[event.key + '_up'];
        if (mapEvent) {
          scene.emit(mapEvent);
        }
      }
    });
    /*
    document.addEventListener('keydown', function (event) {
    });
    document.addEventListener('keypress', function (event) {
    });
    */
  },

  /**
   * Called when component is attached and when component data changes.
   * Generally modifies the entity based on the data.
   */
  update: function (oldData) { },

  /**
   * Called when a component is removed (e.g., via removeAttribute).
   * Generally undoes all modifications to the entity.
   */
  remove: function () { },

  /**
   * Called on each scene tick.
   */
  // tick: function (t) { },

  /**
   * Called when entity pauses.
   * Use to stop or remove any dynamic or background behavior such as events.
   */
  pause: function () { },

  /**
   * Called when entity resumes.
   * Use to continue or add any dynamic or background behavior such as events.
   */
  play: function () { },

  getActiveMapping: function () {
    return this.currentMapping;
  },

  setActiveMapping: function (mapping) {
    if (AFRAME.inputMappings[mapping]) {
      this.currentMapping = mapping;
    } else {
      console.warn('aframe-input-mapping-component: Trying to activate a mapping that doesn\'t exist:', mapping);
    }
  }
});

AFRAME.registerInputMappings = function(mappings) {
  // @todo Overwrite just the conflicts instead of the whole mapping
  AFRAME.inputMappings = mappings;
};

if (AFRAME.DEFAULT_INPUT_MAPPINGS) {
  AFRAME.registerInputMappings(AFRAME.DEFAULT_INPUT_MAPPINGS);
}
