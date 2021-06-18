Gyeonghwon (甄萱:Animated image marker enabler for canvas-based map APIs)
==============

Library to display Animated images in a context in canvas.

With the old HTML DOM div-based map API, it was very easy to create animated markers. You simply had to create a marker using an image such as Animated GIF or APNG.  
However, with the new map API using HTML canvas or WebGL, it is no longer possible to create animated markers by simply using animated images as markers.  
Here is a sample of a marker in OpenLayer, which does not move .  
https://code4history.dev/Gyeonghwon/index2.html

Therefore, we developed Gyeonghwon as a platform to easily create animated markers on the new map API using Animated images.  
Here is a sample of a marker that actually works.  
https://code4history.dev/Gyeonghwon/index.html

Now it supports Animated GIF, APNG and Animated webp.  
The current implementation already works properly, but the API interface is a reference implementation and is subject to change based on feedback and other factors.  
In particular, this library is not made for a specific Map API, but since the operation tests are done only with OpenLayers, changes may occur to make the interface compatible with other Map APIs.

The library requires support from the following technologies in order to run:

 * [Canvas](http://caniuse.com/#feat=canvas)
 * [Typed Arrays](http://caniuse.com/#feat=typedarrays)
 * [Blob URLs](http://caniuse.com/#feat=bloburls)
 * [requestAnimationFrame](http://caniuse.com/#feat=requestanimationframe)
 
These technologies are supported in all modern browsers and IE starting with version 10.
