## aframe-input-mapping-component

[![Version](http://img.shields.io/npm/v/aframe-input-mapping-component.svg?style=flat-square)](https://npmjs.org/package/aframe-input-mapping-component)
[![License](http://img.shields.io/npm/l/aframe-input-mapping-component.svg?style=flat-square)](https://npmjs.org/package/aframe-input-mapping-component)

Input Mapping component for [A-Frame](https://aframe.io).

Read more about it on https://blog.mozvr.com/input-mapping

![Screenshot](https://github.com/fernandojsg/aframe-input-mapping-component/raw/master/mapping.png)

### Installation

#### Browser

Install and use by directly including the [browser files](dist):

```html
<head>
  <title>My A-Frame Scene</title>
  <script src="https://aframe.io/releases/0.6.0/aframe.min.js"></script>
  <script src="https://unpkg.com/aframe-input-mapping-component/dist/aframe-input-mapping-component.min.js"></script>
</head>
```

#### npm

Install via npm:

```bash
npm install aframe-input-mapping-component
```

Then require and use.

```js
require('aframe');
require('aframe-input-mapping-component');
```

#### Register a new mapping

Define a mapping object:
```json
var mappings = {
  default: {
    'vive-controls': {
      trackpaddown: 'teleport'
    },

    'oculus-touch-controls': {
      xbuttondown: 'teleport'
    }
  },
  paint: {
    common: {
      triggerdown: 'paint'
    },
  
    'vive-controls': {
      menudown: 'toggleMenu'
    },

    'oculus-touch-controls': {
      abuttondown: 'toggleMenu'
    }
  }
}
``` 

Register it:
```javascript
AFRAME.registerInputMappings(mappings);
```
