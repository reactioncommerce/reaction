/*!
 * jQVMap Version 1.0
 *
 * http://jqvmap.com
 *
 * Copyright 2012, Peter Schmalfeldt <manifestinteractive@gmail.com>
 * Copyright 2011-2012, Kirill Lebedev
 * Licensed under the MIT license.
 *
 * Fork Me @ https://github.com/manifestinteractive/jqvmap
 */
(function ($) {

  var apiParams = {
    colors: 1,
    values: 1,
    backgroundColor: 1,
    scaleColors: 1,
    normalizeFunction: 1,
    enableZoom: 1,
    showTooltip: 1,
    borderColor: 1,
    borderWidth: 1,
    borderOpacity: 1,
    selectedRegions: 1,
    multiSelectRegion: 1
  };

  var apiEvents = {
    onLabelShow: 'labelShow',
    onRegionOver: 'regionMouseOver',
    onRegionOut: 'regionMouseOut',
    onRegionClick: 'regionClick',
    onRegionSelect: 'regionSelect',
    onRegionDeselect: 'regionDeselect'
  };

  $.fn.vectorMap = function (options) {

    var defaultParams = {
      map: 'world_en',
      backgroundColor: '#a5bfdd',
      color: '#f4f3f0',
      hoverColor: '#c9dfaf',
      selectedColor: '#c9dfaf',
      scaleColors: ['#b6d6ff', '#005ace'],
      normalizeFunction: 'linear',
      enableZoom: true,
      showTooltip: true,
      borderColor: '#818181',
      borderWidth: 1,
      borderOpacity: 0.25,
      selectedRegions: null,
      multiSelectRegion: false
    }, map = this.data('mapObject');

    if (options === 'addMap') {
      WorldMap.maps[arguments[1]] = arguments[2];
    } else if (options === 'set' && apiParams[arguments[1]]) {
      map['set' + arguments[1].charAt(0).toUpperCase() + arguments[1].substr(1)].apply(map, Array.prototype.slice.call(arguments, 2));
    } else if (typeof options === 'string' &&
               typeof map[options] === 'function') {
      return map[options].apply(map, Array.prototype.slice.call(arguments, 1));
    } else {
      $.extend(defaultParams, options);
      defaultParams.container = this;
      this.css({ position: 'relative', overflow: 'hidden' });

      map = new WorldMap(defaultParams);

      this.data('mapObject', map);

      for (var e in apiEvents) {
        if (defaultParams[e]) {
          this.bind(apiEvents[e] + '.jqvmap', defaultParams[e]);
        }
      }
    }
  };

  var VectorCanvas = function (width, height, params) {
    this.mode = window.SVGAngle ? 'svg' : 'vml';
    this.params = params;

    if (this.mode == 'svg') {
      this.createSvgNode = function (nodeName) {
        return document.createElementNS(this.svgns, nodeName);
      };
    } else {
      try {
        if (!document.namespaces.rvml) {
          document.namespaces.add("rvml", "urn:schemas-microsoft-com:vml");
        }
        this.createVmlNode = function (tagName) {
          return document.createElement('<rvml:' + tagName + ' class="rvml">');
        };
      } catch (e) {
        this.createVmlNode = function (tagName) {
          return document.createElement('<' + tagName + ' xmlns="urn:schemas-microsoft.com:vml" class="rvml">');
        };
      }

      document.createStyleSheet().addRule(".rvml", "behavior:url(#default#VML)");
    }

    if (this.mode == 'svg') {
      this.canvas = this.createSvgNode('svg');
    } else {
      this.canvas = this.createVmlNode('group');
      this.canvas.style.position = 'absolute';
    }

    this.setSize(width, height);
  };

  VectorCanvas.prototype = {
    svgns: "http://www.w3.org/2000/svg",
    mode: 'svg',
    width: 0,
    height: 0,
    canvas: null,

    setSize: function (width, height) {
      if (this.mode == 'svg') {
        this.canvas.setAttribute('width', width);
        this.canvas.setAttribute('height', height);
      } else {
        this.canvas.style.width = width + "px";
        this.canvas.style.height = height + "px";
        this.canvas.coordsize = width + ' ' + height;
        this.canvas.coordorigin = "0 0";
        if (this.rootGroup) {
          var pathes = this.rootGroup.getElementsByTagName('shape');
          for (var i = 0, l = pathes.length; i < l; i++) {
            pathes[i].coordsize = width + ' ' + height;
            pathes[i].style.width = width + 'px';
            pathes[i].style.height = height + 'px';
          }
          this.rootGroup.coordsize = width + ' ' + height;
          this.rootGroup.style.width = width + 'px';
          this.rootGroup.style.height = height + 'px';
        }
      }
      this.width = width;
      this.height = height;
    },

    createPath: function (config) {
      var node;
      if (this.mode == 'svg') {
        node = this.createSvgNode('path');
        node.setAttribute('d', config.path);

        if (this.params.borderColor !== null) {
          node.setAttribute('stroke', this.params.borderColor);
        }
        if (this.params.borderWidth > 0) {
          node.setAttribute('stroke-width', this.params.borderWidth);
          node.setAttribute('stroke-linecap', 'round');
          node.setAttribute('stroke-linejoin', 'round');
        }
        if (this.params.borderOpacity > 0) {
          node.setAttribute('stroke-opacity', this.params.borderOpacity);
        }

        node.setFill = function (color) {
          this.setAttribute("fill", color);
          if (this.getAttribute("original") === null) {
            this.setAttribute("original", color);
          }
        };

        node.getFill = function (color) {
          return this.getAttribute("fill");
        };

        node.getOriginalFill = function () {
          return this.getAttribute("original");
        };

        node.setOpacity = function (opacity) {
          this.setAttribute('fill-opacity', opacity);
        };
      } else {
        node = this.createVmlNode('shape');
        node.coordorigin = "0 0";
        node.coordsize = this.width + ' ' + this.height;
        node.style.width = this.width + 'px';
        node.style.height = this.height + 'px';
        node.fillcolor = WorldMap.defaultFillColor;
        node.stroked = false;
        node.path = VectorCanvas.pathSvgToVml(config.path);

        var scale = this.createVmlNode('skew');
        scale.on = true;
        scale.matrix = '0.01,0,0,0.01,0,0';
        scale.offset = '0,0';

        node.appendChild(scale);

        var fill = this.createVmlNode('fill');
        node.appendChild(fill);

        node.setFill = function (color) {
          this.getElementsByTagName('fill')[0].color = color;
          if (this.getAttribute("original") === null) {
            this.setAttribute("original", color);
          }
        };

        node.getFill = function (color) {
          return this.getElementsByTagName('fill')[0].color;
        };
        node.getOriginalFill = function () {
          return this.getAttribute("original");
        };
        node.setOpacity = function (opacity) {
          this.getElementsByTagName('fill')[0].opacity = parseInt(opacity * 100, 10) + '%';
        };
      }
      return node;
    },

    createGroup: function (isRoot) {
      var node;
      if (this.mode == 'svg') {
        node = this.createSvgNode('g');
      } else {
        node = this.createVmlNode('group');
        node.style.width = this.width + 'px';
        node.style.height = this.height + 'px';
        node.style.left = '0px';
        node.style.top = '0px';
        node.coordorigin = "0 0";
        node.coordsize = this.width + ' ' + this.height;
      }

      if (isRoot) {
        this.rootGroup = node;
      }
      return node;
    },

    applyTransformParams: function (scale, transX, transY) {
      if (this.mode == 'svg') {
        this.rootGroup.setAttribute('transform', 'scale(' + scale + ') translate(' + transX + ', ' + transY + ')');
      } else {
        this.rootGroup.coordorigin = (this.width - transX) + ',' + (this.height - transY);
        this.rootGroup.coordsize = this.width / scale + ',' + this.height / scale;
      }
    }
  };

  VectorCanvas.pathSvgToVml = function (path) {
    var result = '';
    var cx = 0, cy = 0, ctrlx, ctrly;

    return path.replace(/([MmLlHhVvCcSs])((?:-?(?:\d+)?(?:\.\d+)?,?\s?)+)/g, function (segment, letter, coords, index) {
      coords = coords.replace(/(\d)-/g, '$1,-').replace(/\s+/g, ',').split(',');
      if (!coords[0]) {
        coords.shift();
      }

      for (var i = 0, l = coords.length; i < l; i++) {
        coords[i] = Math.round(100 * coords[i]);
      }

      switch (letter) {
      case 'm':
        cx += coords[0];
        cy += coords[1];
        return 't' + coords.join(',');
        break;

      case 'M':
        cx = coords[0];
        cy = coords[1];
        return 'm' + coords.join(',');
        break;

      case 'l':
        cx += coords[0];
        cy += coords[1];
        return 'r' + coords.join(',');
        break;

      case 'L':
        cx = coords[0];
        cy = coords[1];
        return 'l' + coords.join(',');
        break;

      case 'h':
        cx += coords[0];
        return 'r' + coords[0] + ',0';
        break;

      case 'H':
        cx = coords[0];
        return 'l' + cx + ',' + cy;
        break;

      case 'v':
        cy += coords[0];
        return 'r0,' + coords[0];
        break;

      case 'V':
        cy = coords[0];
        return 'l' + cx + ',' + cy;
        break;

      case 'c':
        ctrlx = cx + coords[coords.length - 4];
        ctrly = cy + coords[coords.length - 3];
        cx += coords[coords.length - 2];
        cy += coords[coords.length - 1];
        return 'v' + coords.join(',');
        break;

      case 'C':
        ctrlx = coords[coords.length - 4];
        ctrly = coords[coords.length - 3];
        cx = coords[coords.length - 2];
        cy = coords[coords.length - 1];
        return 'c' + coords.join(',');
        break;

      case 's':
        coords.unshift(cy - ctrly);
        coords.unshift(cx - ctrlx);
        ctrlx = cx + coords[coords.length - 4];
        ctrly = cy + coords[coords.length - 3];
        cx += coords[coords.length - 2];
        cy += coords[coords.length - 1];
        return 'v' + coords.join(',');
        break;

      case 'S':
        coords.unshift(cy + cy - ctrly);
        coords.unshift(cx + cx - ctrlx);
        ctrlx = coords[coords.length - 4];
        ctrly = coords[coords.length - 3];
        cx = coords[coords.length - 2];
        cy = coords[coords.length - 1];
        return 'c' + coords.join(',');
        break;

      default:
        return false;
        break;
      }

      return '';

    }).replace(/z/g, '');
  };

  var WorldMap = function (params) {
    params = params || {};
    var map = this;
    var mapData = WorldMap.maps[params.map];

    this.selectedRegions = [];
    this.multiSelectRegion = params.multiSelectRegion;

    this.container = params.container;

    this.defaultWidth = mapData.width;
    this.defaultHeight = mapData.height;

    this.color = params.color;
    this.selectedColor = params.selectedColor;
    this.hoverColor = params.hoverColor;
    this.hoverOpacity = params.hoverOpacity;
    this.setBackgroundColor(params.backgroundColor);

    this.width = params.container.width();
    this.height = params.container.height();

    this.resize();

    jQuery(window).resize(function () {
      map.width = params.container.width();
      map.height = params.container.height();
      map.resize();
      map.canvas.setSize(map.width, map.height);
      map.applyTransform();
    });

    this.canvas = new VectorCanvas(this.width, this.height, params);
    params.container.append(this.canvas.canvas);

    this.makeDraggable();

    this.rootGroup = this.canvas.createGroup(true);

    this.index = WorldMap.mapIndex;
    this.label = jQuery('<div/>').addClass('jqvmap-label').appendTo(jQuery('body')).hide();

    if (params.enableZoom) {
      jQuery('<div/>').addClass('jqvmap-zoomin').text('+').appendTo(params.container);
      jQuery('<div/>').addClass('jqvmap-zoomout').html('&#x2212;').appendTo(params.container);
    }

    map.countries = [];

    for (var key in mapData.pathes) {
      var path = this.canvas.createPath({
        path: mapData.pathes[key].path
      });

      path.setFill(this.color);
      path.id = map.getCountryId(key);
      map.countries[key] = path;

      if (this.canvas.mode == 'svg') {
        path.setAttribute('class', 'jvectormap-region');
      } else {
        jQuery(path).addClass('jvectormap-region');
      }

      jQuery(this.rootGroup).append(path);
    }

    jQuery(params.container).delegate(this.canvas.mode == 'svg' ? 'path' : 'shape', 'mouseover mouseout', function (e) {
      var path = e.target,
      code = e.target.id.split('_').pop(),
      labelShowEvent = $.Event('labelShow.jqvmap'),
      regionMouseOverEvent = $.Event('regionMouseOver.jqvmap');

      if (e.type == 'mouseover') {
        jQuery(params.container).trigger(regionMouseOverEvent, [code, mapData.pathes[code].name]);
        if (!regionMouseOverEvent.isDefaultPrevented()) {
          map.highlight(code, path);
        }
        if (params.showTooltip) {
          map.label.text(mapData.pathes[code].name);
          jQuery(params.container).trigger(labelShowEvent, [map.label, code]);

          if (!labelShowEvent.isDefaultPrevented()) {
            map.label.show();
            map.labelWidth = map.label.width();
            map.labelHeight = map.label.height();
          }
        }
      } else {
        map.unhighlight(code, path);

        map.label.hide();
        jQuery(params.container).trigger('regionMouseOut.jqvmap', [code, mapData.pathes[code].name]);
      }
    });

    jQuery(params.container).delegate(this.canvas.mode == 'svg' ? 'path' : 'shape', 'click', function (e) {
      if (!params.multiSelectRegion) {
        for (var key in mapData.pathes) {
          map.countries[key].currentFillColor = map.countries[key].getOriginalFill();
          map.countries[key].setFill(map.countries[key].getOriginalFill());
        }
      }

      var path = e.target;
      var code = e.target.id.split('_').pop();

      jQuery(params.container).trigger('regionClick.jqvmap', [code, mapData.pathes[code].name]);
      if (!regionClickEvent.isDefaultPrevented()) {
        if (map.selectedRegions.indexOf(code) !== -1) {
          map.deselect(code, path);
        } else {
          map.select(code, path);
        }
      }

      //console.log(selectedRegions);

    });

    if (params.showTooltip) {
      params.container.mousemove(function (e) {
        if (map.label.is(':visible')) {
            var left = e.pageX - 15 - map.labelWidth;
            var top = e.pageY - 15 - map.labelHeight;
            
            if(left < 0)
               left = e.pageX + 15;
            if(top < 0)
                top = e.pageY + 15;
            
            map.label.css({
                left: left,
                top: top
          });
        }
      });
    }

    this.setColors(params.colors);

    this.canvas.canvas.appendChild(this.rootGroup);

    this.applyTransform();

    this.colorScale = new ColorScale(params.scaleColors, params.normalizeFunction, params.valueMin, params.valueMax);

    if (params.values) {
      this.values = params.values;
      this.setValues(params.values);
    }

    if (params.selectedRegions) {
      if (params.selectedRegions instanceof Array) {
        for(var k in params.selectedRegions) {
          this.select(params.selectedRegions[k].toLowerCase());
        }
      } else {
        this.select(params.selectedRegions.toLowerCase());
      }
    }

    this.bindZoomButtons();
    
    if(params.pins) {
      /*if(params.pinMode) {
          if(params.pinMode != "id" && params.pinMode != "content") {
              params.pinMode = "content";
          }
      } else {
          params.pinMode = "content";
      }*/
      this.pinHandlers = false;
      this.placePins(params.pins, params.pinMode);
    }

    WorldMap.mapIndex++;
  };

  WorldMap.prototype = {
    transX: 0,
    transY: 0,
    scale: 1,
    baseTransX: 0,
    baseTransY: 0,
    baseScale: 1,
    width: 0,
    height: 0,
    countries: {},
    countriesColors: {},
    countriesData: {},
    zoomStep: 1.4,
    zoomMaxStep: 4,
    zoomCurStep: 1,

    setColors: function (key, color) {
      if (typeof key == 'string') {
        this.countries[key].setFill(color);
        this.countries[key].setAttribute("original", color);
      } else {
        var colors = key;

        for (var code in colors) {
          if (this.countries[code]) {
            this.countries[code].setFill(colors[code]);
            this.countries[code].setAttribute("original", colors[code]);
          }
        }
      }
    },

    setValues: function (values) {
      var max = 0,
      min = Number.MAX_VALUE,
      val;

      for (var cc in values) {
        val = parseFloat(values[cc]);
        if (val > max) {
          max = values[cc];
        }
        if (val && val < min) {
          min = val;
        }
      }

      this.colorScale.setMin(min);
      this.colorScale.setMax(max);

      var colors = {};
      for (cc in values) {
        val = parseFloat(values[cc]);
        if (val) {
          colors[cc] = this.colorScale.getColor(val);
        } else {
          colors[cc] = this.color;
        }
      }
      this.setColors(colors);
      this.values = values;
    },

    setBackgroundColor: function (backgroundColor) {
      this.container.css('background-color', backgroundColor);
    },

    setScaleColors: function (colors) {
      this.colorScale.setColors(colors);

      if (this.values) {
        this.setValues(this.values);
      }
    },

    setNormalizeFunction: function (f) {
      this.colorScale.setNormalizeFunction(f);

      if (this.values) {
        this.setValues(this.values);
      }
    },

    highlight: function (cc, path) {
      path = path || $('#' + this.getCountryId(cc))[0];
      if (this.hoverOpacity) {
        path.setOpacity(this.hoverOpacity);
      } else if (this.hoverColor) {
        path.currentFillColor = path.getFill() + '';
        path.setFill(this.hoverColor);
      }
    },

    unhighlight: function (cc, path) {
      path = path || $('#' + this.getCountryId(cc))[0];
      path.setOpacity(1);
      if (path.currentFillColor) {
        path.setFill(path.currentFillColor);
      }
    },

    select: function (cc, path) {
      path = path || $('#' + this.getCountryId(cc))[0];
      if(this.selectedRegions.indexOf(cc) < 0) {
        if (this.multiSelectRegion) {
          this.selectedRegions.push(cc);
        } else {
          this.selectedRegions = [cc];
        }
        // MUST BE after the change of selectedRegions
        // Otherwise, we might loop
        $(this.container).trigger('regionSelect.jqvmap', [cc]);
        if (this.selectedColor) {
          path.currentFillColor = this.selectedColor;
          path.setFill(this.selectedColor);
        }
      }
    },

    deselect: function (cc, path) {
      path = path || $('#' + this.getCountryId(cc))[0];
      if(this.selectedRegions.indexOf(cc) >= 0) {
        this.selectedRegions.splice(this.selectedRegions.indexOf(cc), 1);
        // MUST BE after the change of selectedRegions
        // Otherwise, we might loop
        $(this.container).trigger('regionDeselect.jqvmap', [cc]);
        path.currentFillColor = path.getOriginalFill();
        path.setFill(path.getOriginalFill());
      }
    },

    isSelected: function(cc) {
      return this.selectedRegions.indexOf(cc) >= 0;
    },

    resize: function () {
      var curBaseScale = this.baseScale;
      if (this.width / this.height > this.defaultWidth / this.defaultHeight) {
        this.baseScale = this.height / this.defaultHeight;
        this.baseTransX = Math.abs(this.width - this.defaultWidth * this.baseScale) / (2 * this.baseScale);
      } else {
        this.baseScale = this.width / this.defaultWidth;
        this.baseTransY = Math.abs(this.height - this.defaultHeight * this.baseScale) / (2 * this.baseScale);
      }
      this.scale *= this.baseScale / curBaseScale;
      this.transX *= this.baseScale / curBaseScale;
      this.transY *= this.baseScale / curBaseScale;
    },

    reset: function () {
      this.countryTitle.reset();
      for (var key in this.countries) {
        this.countries[key].setFill(WorldMap.defaultColor);
      }
      this.scale = this.baseScale;
      this.transX = this.baseTransX;
      this.transY = this.baseTransY;
      this.applyTransform();
    },

    applyTransform: function () {
      var maxTransX, maxTransY, minTransX, minTransY;
      if (this.defaultWidth * this.scale <= this.width) {
        maxTransX = (this.width - this.defaultWidth * this.scale) / (2 * this.scale);
        minTransX = (this.width - this.defaultWidth * this.scale) / (2 * this.scale);
      } else {
        maxTransX = 0;
        minTransX = (this.width - this.defaultWidth * this.scale) / this.scale;
      }

      if (this.defaultHeight * this.scale <= this.height) {
        maxTransY = (this.height - this.defaultHeight * this.scale) / (2 * this.scale);
        minTransY = (this.height - this.defaultHeight * this.scale) / (2 * this.scale);
      } else {
        maxTransY = 0;
        minTransY = (this.height - this.defaultHeight * this.scale) / this.scale;
      }

      if (this.transY > maxTransY) {
        this.transY = maxTransY;
      }
      else if (this.transY < minTransY) {
        this.transY = minTransY;
      }
      if (this.transX > maxTransX) {
        this.transX = maxTransX;
      }
      else if (this.transX < minTransX) {
        this.transX = minTransX;
      }

      this.canvas.applyTransformParams(this.scale, this.transX, this.transY);
    },

    makeDraggable: function () {
      var mouseDown = false;
      var oldPageX, oldPageY;
      var self = this;

      self.isMoving = false;
      self.isMovingTimeout = false;

      this.container.mousemove(function (e) {

        if (mouseDown) {
          var curTransX = self.transX;
          var curTransY = self.transY;

          self.transX -= (oldPageX - e.pageX) / self.scale;
          self.transY -= (oldPageY - e.pageY) / self.scale;

          self.applyTransform();

          oldPageX = e.pageX;
          oldPageY = e.pageY;

          self.isMoving = true;
          if (self.isMovingTimeout) {
            clearTimeout(self.isMovingTimeout);
          }

          self.container.trigger('drag');
        }

        return false;

      }).mousedown(function (e) {

        mouseDown = true;
        oldPageX = e.pageX;
        oldPageY = e.pageY;

        return false;

      }).mouseup(function () {

        mouseDown = false;

        self.isMovingTimeout = setTimeout(function () {
          self.isMoving = false;
        }, 100);

        return false;

      });
    },

    bindZoomButtons: function () {
      var map = this;
      this.container.find('.jqvmap-zoomin').click(function(){
        map.zoomIn();
      });
      this.container.find('.jqvmap-zoomout').click(function(){
        map.zoomOut();
      });
    },
    
    zoomIn: function () {
      var map = this;
      var sliderDelta = (jQuery('#zoom').innerHeight() - 6 * 2 - 15 * 2 - 3 * 2 - 7 - 6) / (this.zoomMaxStep - this.zoomCurStep);

      if (map.zoomCurStep < map.zoomMaxStep) {
        var curTransX = map.transX;
        var curTransY = map.transY;
        var curScale = map.scale;

        map.transX -= (map.width / map.scale - map.width / (map.scale * map.zoomStep)) / 2;
        map.transY -= (map.height / map.scale - map.height / (map.scale * map.zoomStep)) / 2;
        map.setScale(map.scale * map.zoomStep);
        map.zoomCurStep++;

        jQuery('#zoomSlider').css('top', parseInt(jQuery('#zoomSlider').css('top'), 10) - sliderDelta);
        
        map.container.trigger("zoomIn");
      }
    },
    
    zoomOut: function () {
      var map = this;
      var sliderDelta = (jQuery('#zoom').innerHeight() - 6 * 2 - 15 * 2 - 3 * 2 - 7 - 6) / (this.zoomMaxStep - this.zoomCurStep);

      if (map.zoomCurStep > 1) {
        var curTransX = map.transX;
        var curTransY = map.transY;
        var curScale = map.scale;

        map.transX += (map.width / (map.scale / map.zoomStep) - map.width / map.scale) / 2;
        map.transY += (map.height / (map.scale / map.zoomStep) - map.height / map.scale) / 2;
        map.setScale(map.scale / map.zoomStep);
        map.zoomCurStep--;

        jQuery('#zoomSlider').css('top', parseInt(jQuery('#zoomSlider').css('top'), 10) + sliderDelta);
        
        map.container.trigger("zoomOut");
      }
    },

    setScale: function (scale) {
      this.scale = scale;
      this.applyTransform();
    },

    getCountryId: function (cc) {
      return 'jqvmap' + this.index + '_' + cc;
    },

    getPinId: function (cc) {
      return this.getCountryId(cc)+'_pin';
    },
    
    placePins: function(pins, pinMode){
      var map = this;

      if(!pinMode || (pinMode != "content" && pinMode != "id")) {
        pinMode = "content";
      }

      if(pinMode == "content") {//treat pin as content
        jQuery.each(pins, function(index, pin){
          if(jQuery('#'+map.getCountryId(index)).length == 0){
              return;
          }
          //mapData.pathes[code].name
          var pinIndex = map.getPinId(index);
          if(jQuery('#'+pinIndex).length > 0){
            jQuery('#'+pinIndex).remove();
          }
          map.container.append('<div id="' + pinIndex + '" for="'+index+'" class="jqvmap_pin" style="position:absolute">' + pin + '</div>');
        });
      } else { //treat pin as id of an html content
        jQuery.each(pins, function(index, pin){
          if(jQuery('#'+map.getCountryId(index)).length == 0){
              return;
          }
          var pinIndex = map.getPinId(index);
          if(jQuery('#'+pinIndex).length > 0){
            jQuery('#'+pinIndex).remove();
          }
          map.container.append('<div id="' + pinIndex + '" for="'+index+'" class="jqvmap_pin" style="position:absolute"></div>');
          jQuery('#'+pinIndex).append(jQuery('#'+pin));
        });
      }

      this.positionPins();
      if(!this.pinHandlers){
        this.pinHandlers = true;//do only once
        var positionFix = function(){
          map.positionPins();
        };
        this.container.bind('zoomIn', positionFix)
        .bind('zoomOut', positionFix)
        .bind('drag', positionFix);
      }
    },

    positionPins: function(){
      var map = this;
      var pins = this.container.find('.jqvmap_pin');
      jQuery.each(pins, function(index, pinObj){
        pinObj = jQuery(pinObj);
        var countryId = map.getCountryId(pinObj.attr('for'));
        var countryObj = jQuery('#' + countryId);

        var bbox = document.getElementById(countryId).getBBox();
        var position = countryObj.position();

        var scale = map.scale;

        var left = position.left + (bbox.width / 2) * scale - pinObj.width() / 2,
        top = position.top + (bbox.height / 2) * scale - pinObj.height() / 2;

        pinObj.css('left',left).css('top',top);
      });
     },

     getPin: function(cc){
       var pinObj = jQuery('#'+this.getPinId(cc));
       return pinObj.html();
     },

     getPins: function(){
       var pins = this.container.find('.jqvmap_pin');
       var ret = new Object();
       jQuery.each(pins, function(index, pinObj){
         pinObj = jQuery(pinObj);
         var cc = pinObj.attr('for');
         var pinContent = pinObj.html();
         eval("ret." + cc + "=pinContent");
       });
       return JSON.stringify(ret);
     },

     removePin: function(cc) {
       jQuery('#'+this.getPinId(cc)).remove();
     },

     removePins: function(){
       this.container.find('.jqvmap_pin').remove();
     }
  };

  WorldMap.xlink = "http://www.w3.org/1999/xlink";
  WorldMap.mapIndex = 1;
  WorldMap.maps = {};

  var ColorScale = function (colors, normalizeFunction, minValue, maxValue) {
    if (colors) {
      this.setColors(colors);
    }
    if (normalizeFunction) {
      this.setNormalizeFunction(normalizeFunction);
    }
    if (minValue) {
      this.setMin(minValue);
    }
    if (minValue) {
      this.setMax(maxValue);
    }
  };

  ColorScale.prototype = {
    colors: [],

    setMin: function (min) {
      this.clearMinValue = min;

      if (typeof this.normalize === 'function') {
        this.minValue = this.normalize(min);
      } else {
        this.minValue = min;
      }
    },

    setMax: function (max) {
      this.clearMaxValue = max;
      if (typeof this.normalize === 'function') {
        this.maxValue = this.normalize(max);
      } else {
        this.maxValue = max;
      }
    },

    setColors: function (colors) {
      for (var i = 0; i < colors.length; i++) {
        colors[i] = ColorScale.rgbToArray(colors[i]);
      }
      this.colors = colors;
    },

    setNormalizeFunction: function (f) {
      if (f === 'polynomial') {
        this.normalize = function (value) {
          return Math.pow(value, 0.2);
        };
      }
      else if (f === 'linear') {
        delete this.normalize;
      } else {
        this.normalize = f;
      }
      this.setMin(this.clearMinValue);
      this.setMax(this.clearMaxValue);
    },

    getColor: function (value) {
      if (typeof this.normalize === 'function') {
        value = this.normalize(value);
      }

      var lengthes = [];
      var fullLength = 0;
      var l;

      for (var i = 0; i < this.colors.length - 1; i++) {
        l = this.vectorLength(this.vectorSubtract(this.colors[i + 1], this.colors[i]));
        lengthes.push(l);
        fullLength += l;
      }

      var c = (this.maxValue - this.minValue) / fullLength;

      for (i = 0; i < lengthes.length; i++) {
        lengthes[i] *= c;
      }

      i = 0;
      value -= this.minValue;

      while (value - lengthes[i] >= 0) {
        value -= lengthes[i];
        i++;
      }

      var color;
      if (i == this.colors.length - 1) {
        color = this.vectorToNum(this.colors[i]).toString(16);
      } else {
        color = (this.vectorToNum(this.vectorAdd(this.colors[i], this.vectorMult(this.vectorSubtract(this.colors[i + 1], this.colors[i]), (value) / (lengthes[i]))))).toString(16);
      }

      while (color.length < 6) {
        color = '0' + color;
      }
      return '#' + color;
    },

    vectorToNum: function (vector) {
      var num = 0;
      for (var i = 0; i < vector.length; i++) {
        num += Math.round(vector[i]) * Math.pow(256, vector.length - i - 1);
      }
      return num;
    },

    vectorSubtract: function (vector1, vector2) {
      var vector = [];
      for (var i = 0; i < vector1.length; i++) {
        vector[i] = vector1[i] - vector2[i];
      }
      return vector;
    },

    vectorAdd: function (vector1, vector2) {
      var vector = [];
      for (var i = 0; i < vector1.length; i++) {
        vector[i] = vector1[i] + vector2[i];
      }
      return vector;
    },

    vectorMult: function (vector, num) {
      var result = [];
      for (var i = 0; i < vector.length; i++) {
        result[i] = vector[i] * num;
      }
      return result;
    },

    vectorLength: function (vector) {
      var result = 0;
      for (var i = 0; i < vector.length; i++) {
        result += vector[i] * vector[i];
      }
      return Math.sqrt(result);
    }
  };

  ColorScale.arrayToRgb = function (ar) {
    var rgb = '#';
    var d;
    for (var i = 0; i < ar.length; i++) {
      d = ar[i].toString(16);
      rgb += d.length == 1 ? '0' + d : d;
    }
    return rgb;
  };

  ColorScale.rgbToArray = function (rgb) {
    rgb = rgb.substr(1);
    return [parseInt(rgb.substr(0, 2), 16), parseInt(rgb.substr(2, 2), 16), parseInt(rgb.substr(4, 2), 16)];
  };

})(jQuery);
