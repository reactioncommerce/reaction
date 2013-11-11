GMaps.prototype.createControl = function(options) {
  var control = document.createElement('div');

  control.style.cursor = 'pointer';
  control.style.fontFamily = 'Arial, sans-serif';
  control.style.fontSize = '13px';
  control.style.boxShadow = 'rgba(0, 0, 0, 0.398438) 0px 2px 4px';

  for (var option in options.style) {
    control.style[option] = options.style[option];
  }

  if (options.id) {
    control.id = options.id;
  }

  if (options.classes) {
    control.className = options.classes;
  }

  if (options.content) {
    control.innerHTML = options.content;
  }

  for (var ev in options.events) {
    (function(object, name) {
      google.maps.event.addDomListener(object, name, function(){
        options.events[name].apply(this, [this]);
      });
    })(control, ev);
  }

  control.index = 1;

  return control;
};

GMaps.prototype.addControl = function(options) {
  var position = google.maps.ControlPosition[options.position.toUpperCase()];

  delete options.position;

  var control = this.createControl(options);
  this.controls.push(control);
  
  this.map.controls[position].push(control);

  return control;
};
