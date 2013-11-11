Bootstrap-switch
========================

Demo
----
http://www.larentis.eu/switch/

Usage
-----
Just include Twitter Bootstrap, jQuery, Bootstrap Switch CSS and Javascript
``` html
<meta http-equiv="X-UA-Compatible" content="IE=9; IE=8;" />
<link rel="stylesheet" href="//netdna.bootstrapcdn.com/twitter-bootstrap/2.3.1/css/bootstrap-combined.min.css">
<link rel="stylesheet" href="bootstrap-switch.css">

<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.9.0/jquery.min.js"></script>
<script src="bootstrap-switch.js"></script>  // master
<script src="//cdnjs.cloudflare.com/ajax/libs/bootstrap-switch/1.3/bootstrapSwitch.min.js">  // from cdnjs.com
```

Less
----
If you want to use your bootstrap vars edit bootstrapSwitch.less and then compile the less file
``` bash
lessc static/less/bootstrap-switch.less static/stylesheets/bootstrap-switch.css
```

Supported browsers
------------------
I'm not going to support ancient browsers! (it works on IE8+)

Basic Example
-------------
``` html
<div class="switch">
    <input type="checkbox">
</div>
```

Large, small or mini
--------------------
``` html
<div class="switch switch-large">  <!-- switch-large, switch-small or switch-mini -->
    <input type="checkbox">
</div>
```

Colors
------
``` html
<div class="switch" data-on="danger" data-off="warning">  <!-- primary, info, success, warning, danger and default -->
    <input type="checkbox">
</div>
```

Animation
---------
``` html
<div class="switch" data-animated="false">
    <input type="checkbox">
</div>
```

Text
-----
``` html
<div class="switch" data-on-label="SI" data-off-label="NO">
    <input type="checkbox">
</div>
```

HTML Text
----------
``` html
<div class="switch" data-on-label="<i class='icon-ok icon-white'></i>" data-off-label="<i class='icon-remove'></i>">
    <input type="checkbox">
</div>
```

Initial values
--------------
``` html
<div class="switch">
    <input type="checkbox" checked="checked" disabled="disabled">
</div>
```

Event handler
-------------
``` javascript
$('#mySwitch').on('switch-change', function (e, data) {
    var $el = $(data.el)
      , value = data.value;
    console.log(e, $el, value);
});
```

Methods
-------
``` javascript
$('#mySwitch').bootstrapSwitch('toggleActivation');
$('#mySwitch').bootstrapSwitch('isActive');
$('#mySwitch').bootstrapSwitch('setActive', false);
$('#mySwitch').bootstrapSwitch('setActive', true);
$('#mySwitch').bootstrapSwitch('toggleState');
$('#mySwitch').bootstrapSwitch('setState', true);
$('#mySwitch').bootstrapSwitch('status');  // returns true or false
$('#mySwitch').bootstrapSwitch('destroy');
```

License
-------
Licensed under the Apache License, Version 2.0
http://www.apache.org/licenses/LICENSE-2.0
