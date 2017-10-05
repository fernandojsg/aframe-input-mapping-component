## aframe-input-mapping-component

[![Version](http://img.shields.io/npm/v/aframe-input-mapping-component.svg?style=flat-square)](https://npmjs.org/package/aframe-input-mapping-component)
[![License](http://img.shields.io/npm/l/aframe-input-mapping-component.svg?style=flat-square)](https://npmjs.org/package/aframe-input-mapping-component)

A Input Mapping component for A-Frame.

For [A-Frame](https://aframe.io).

### API

| Property | Description | Default Value |
| -------- | ----------- | ------------- |
|          |             |               |

### Installation

#### Browser

Install and use by directly including the [browser files](dist):

```html
<head>
  <title>My A-Frame Scene</title>
  <script src="https://aframe.io/releases/0.6.0/aframe.min.js"></script>
  <script src="https://unpkg.com/aframe-input-mapping-component/dist/aframe-input-mapping-component.min.js"></script>
</head>

<body>
  <a-scene>
    <a-entity input-mapping="foo: bar"></a-entity>
  </a-scene>
</body>
```

<!-- If component is accepted to the Registry, uncomment this. -->
<!--
Or with [angle](https://npmjs.com/package/angle/), you can install the proper
version of the component straight into your HTML file, respective to your
version of A-Frame:

```sh
angle install aframe-input-mapping-component
```
-->

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
