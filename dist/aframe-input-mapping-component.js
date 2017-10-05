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
/***/ (function(module, exports) {

	/* global AFRAME */

	if (typeof AFRAME === 'undefined') {
	  throw new Error('Component attempted to register before AFRAME was available.');
	}

	/**
	 * Input Mapping component for A-Frame.
	 */
	AFRAME.registerSystem('input-mapping', {
	  schema: {},
	  mappings: {},
	  currentSection: 'DEFAULT',

	  /**
	   * Set if component needs multiple instancing.
	   */
	  multiple: false,

	  /**
	   * Called once when component is attached. Generally for initial setup.
	   */
	  init: function () {

	    if (AFRAME.DEFAULT_INPUT_MAPPINGS) {
	      this.registerInputMappings(AFRAME.DEFAULT_INPUT_MAPPINGS);
	    }

	    var self = this;

	    // Controllers
	    this.sceneEl.addEventListener('controller-connected', function (evt) {
	      var controllerModel = evt.detail.type;
	      if (!this.mappings) {
	        console.warn('controller-mapping: No mappings defined');
	        return;
	      }

	      var controllerMappings = this.mappings[controllerModel];
	      if (!controllerMappings) {
	        console.warn('controller-mapping: No mappings defined for controller type: ', controllerModel);
	        return;
	      }

	      for (var eventName in controllerMappings) {
	        self.sceneEl.addEventListener(controllerMappings[eventName], function(evt) {
	          console.log(eventName, controllerMappings[eventName], evt);
	          self.sceneEl.emit(eventName, evt);
	        });
	      }
	    });

	    // Keyboard
	    if (this.mappings['KEYBOARD']) {
	      document.addEventListener('keyup', function (event) {

	      });
	      document.addEventListener('keydown', function (event) {

	      });
	      document.addEventListener('keypress', function (event) {

	      });
	    }
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

	  registerInputMappings: function (mappings) {
	    this.mappings = mappings;
	  },

	  setActiveSection: function (section) {
	    if (this.mappings[section]) {
	      this.currentSection = section;
	    } else {
	      console.warn('aframe-input-mapping-component: Trying to activate a section that doesn\'t exist:', section);
	    }
	  }
	});

	AFRAME.registerInputMappings = function(mappings) {
	  // Add mapping
	  AFRAME.scenes[0].sceneEl.systems['input-mapping'].registerInputMappings(mappings);
	};

	AFRAME.DEFAULT_INPUT_MAPPINGS = {
	  'GLOBAL': {
	    'KEYBOARD': {
	      testlog: 't'
	    }
	  }
	}


/***/ })
/******/ ]);