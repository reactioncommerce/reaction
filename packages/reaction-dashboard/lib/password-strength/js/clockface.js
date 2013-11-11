/**
* Clockface - v1.0.0
* Clockface timepicker for Twitter Bootstrap
*
* Confusion with noon and midnight: 
* http://en.wikipedia.org/wiki/12-hour_clock
* Here considered '00:00 am' as midnight and '12:00 pm' as noon.
*
* Author: Vitaliy Potapov
* Project page: http://github.com/vitalets/clockface
* Copyright (c) 2012 Vitaliy Potapov. Released under MIT License.
**/
(function ($) {

    var Clockface = function (element, options) {
        this.$element = $(element);
        this.options = $.extend({}, $.fn.clockface.defaults, options, this.$element.data());
        this.init();  
     };

    Clockface.prototype = {
        constructor: Clockface, 
        init: function () {
          //apply template
          this.$clockface = $($.fn.clockface.template);
          this.$clockface.find('.l1 .cell, .left.cell').html('<div class="outer"></div><div class="inner"></div>'); 
          this.$clockface.find('.l5 .cell, .right.cell').html('<div class="inner"></div><div class="outer"></div>'); 
          this.$clockface.hide();

          this.$outer = this.$clockface.find('.outer');
          this.$inner = this.$clockface.find('.inner');
          this.$ampm = this.$clockface.find('.ampm');

          //internal vars
          this.ampm = null;
          this.hour = null;
          this.minute = null;
          
          //click am/pm 
          this.$ampm.click($.proxy(this.clickAmPm, this));

          //click cell
          this.$clockface.on('click', '.cell', $.proxy(this.click, this));

          this.parseFormat();
          this.prepareRegexp();

          //set ampm text
          this.ampmtext = this.is24 ? {am: '12-23', pm: '0-11'} : {am: 'AM', pm: 'PM'};

          this.isInline = this.$element.is('div');
          if(this.isInline) {
            this.$clockface.addClass('clockface-inline').appendTo(this.$element);
          } else {
            this.$clockface.addClass('dropdown-menu').appendTo('body');
            if(this.options.trigger === 'focus') {
              this.$element.on('focus.clockface', $.proxy(function(e) { this.show(); }, this));
            }

            // Click outside hide it. Register single handler for all clockface widgets
            $(document).off('click.clockface').on('click.clockface', $.proxy(function (e) {
                var $target = $(e.target);
                //click inside some clockface --> do nothing
                if ($target.closest('.clockface').length) {
                  return;
                }
                //iterate all open clockface and close all except current
                $('.clockface-open').each(function(){
                  if(this === e.target) {
                    return;
                  }
                  $(this).clockface('hide');
                });
            }, this));
          }

          //fill minutes once
          this.fill('minute');
        },

        /*
        Displays widget with specified value
        */
        show: function(value) {
            if(this.$clockface.is(':visible')) {
              return;
            }
            if(!this.isInline) {
                if(value === undefined) {
                  value = this.$element.val();
                }
                this.$element.addClass('clockface-open');
                this.$element.on('keydown.clockface', $.proxy(this.keydown, this));
                this.place();
                $(window).on('resize.clockface', $.proxy(this.place, this));
            }
            this.$clockface.show();
            this.setTime(value);

            //trigger shown event
            this.$element.triggerHandler('shown.clockface', this.getTime(true));
        },
        /*
        hides widget
        */
        hide: function() {
            this.$clockface.hide();
            if(!this.isInline) {
              this.$element.removeClass('clockface-open');  
              this.$element.off('keydown.clockface');
              $(window).off('resize.clockface');
            }

            //trigger hidden event
            this.$element.triggerHandler('hidden.clockface', this.getTime(true));            
        },

        /*
        toggles show/hide
        */
        toggle: function(value) {
          if(this.$clockface.is(':visible')) {
            this.hide();
          } else {
            this.show(value);
          }
        },

         /*
        Set time of clockface. Am/pm will be set automatically.
        Value can be Date object or string
        */
        setTime: function(value) {
          var res, hour, minute, ampm = 'am';

          //no new value 
          if(value === undefined) {
            //if ampm null, it;s first showw, need to render hours ('am' by default)
            if(this.ampm === null) {
              this.setAmPm('am');
            }
            return;
          }

          //take value from Date object
          if(value instanceof Date) {
            hour = value.getHours();
            minute = value.getMinutes();
          }

          //parse value from string
          if(typeof value === 'string' && value.length) { 
            res = this.parseTime(value);

            //'24' always '0'
            if(res.hour === 24) {
              res.hour = 0;
            }

            hour = res.hour;             
            minute = res.minute;             
            ampm = res.ampm;             
          }

          //try to set ampm automatically
          if(hour > 11 && hour < 24) {
            ampm = 'pm';
            //for 12h format substract 12 from value 
            if(!this.is24 && hour > 12) {
              hour -= 12;
            }
          } else if(hour >= 0 && hour < 11) {
                //always set am for 24h and for '0' in 12h 
                if(this.is24 || hour === 0) {
                   ampm = 'am';
               } 
               //otherwise ampm should be defined in value itself and retrieved when parsing
          }      

          this.setAmPm(ampm);
          this.setHour(hour);
          this.setMinute(minute);
        },   

        /*
        Set ampm and re-fill hours
        */
        setAmPm: function(value) {
          if(value === this.ampm) {
             return;
          } else {
             this.ampm = value === 'am' ? 'am' : 'pm';
          }

          //set link's text
          this.$ampm.text(this.ampmtext[this.ampm]);

          //re-fill and highlight hour
          this.fill('hour');
          this.highlight('hour');
        },   
        /*
        Sets hour value and highlight if possible
        */
        setHour: function(value) {
          value = parseInt(value, 10);
          value = isNaN(value) ? null : value;
          if(value < 0 || value > 23) {
            value = null;
          }

          if(value === this.hour) {
            return;
          } else {
            this.hour = value;
          }

          this.highlight('hour');
        },

        /*
        Sets minute value and highlight
        */
        setMinute: function(value) {
          value = parseInt(value, 10);
          value = isNaN(value) ? null : value;
          if(value < 0 || value > 59) {
            value = null;
          }

          if(value === this.minute) {
            return;
          } else {
            this.minute = value;
          }

          this.highlight('minute');
        },        

        /*
        Highlights hour/minute
        */
        highlight: function(what) {
          var index,
              values = this.getValues(what),
              value = what === 'minute' ? this.minute : this.hour,
              $cells = what === 'minute' ? this.$outer : this.$inner;

          $cells.removeClass('active');

          //find index of value and highlight if possible
          index = $.inArray(value, values);
          if(index >= 0) {
            $cells.eq(index).addClass('active');
          }
        },

        /*
        Fill values around
        */ 
        fill: function(what) {
          var values = this.getValues(what),
              $cells = what === 'minute' ? this.$outer : this.$inner,
              leadZero = what === 'minute';           

          $cells.each(function(i){
            var v = values[i];
            if(leadZero && v < 10) {
              v = '0' + v;
            }
            $(this).text(v);
          });
        },          

        /*
        returns values of hours or minutes, depend on ampm and 24/12 format (0-11, 12-23, 00-55, etc)
        param what: 'hour'/'minute'
        */
        getValues: function(what) {
          var values = [11, 0, 1, 10, 2, 9, 3, 8, 4, 7, 6, 5],
              result = [];

          if(what === 'minute') {
              $.each(values, function(i, v) { result[i] = v*5; });
          } else if(this.ampm === 'pm') {
              if(this.is24) {
                $.each(values, function(i, v) { result[i] = v+12; });
              } else {
                result = values.slice();
                result[1] = 12; //need this to show '12' instead of '0' for 12h pm
              }
          } else {
             result = values.slice();
          }
          return result;
        },

        /*
        Click cell handler.
        Stores hour/minute and highlights.
        On second click deselect value
        */
        click: function(e) {
          var $target = $(e.target),
              value = $target.hasClass('active') ? null : $target.text();
          if($target.hasClass('inner')) {
            this.setHour(value);
          } else {
            this.setMinute(value);
          }

          //update value in input
          if(!this.isInline) {
            this.$element.val(this.getTime());
          }          

          //trigger pick event
          this.$element.triggerHandler('pick.clockface', this.getTime(true));  
        },

        /*
        Click handler on ampm link
        */
        clickAmPm: function(e) {
          e.preventDefault();
          //toggle am/pm
          this.setAmPm(this.ampm === 'am' ? 'pm' : 'am');

          //update value in input
          if(!this.isInline && !this.is24) {
            this.$element.val(this.getTime());
          }    

          //trigger pick event
          this.$element.triggerHandler('pick.clockface', this.getTime(true));                  
        },
        

        /*
        Place widget below input
        */
        place: function(){
          var zIndex = parseInt(this.$element.parents().filter(function() {
                   return $(this).css('z-index') != 'auto';
             }).first().css('z-index'), 10)+10,
             offset = this.$element.offset();
          this.$clockface.css({
            top: offset.top + this.$element.outerHeight(),
            left: offset.left,
            zIndex: zIndex
          });
        },  

        /*
        keydown handler (for not inline mode)
        */
        keydown: function(e) {
          //tab, escape, enter --> hide
          if(/^(9|27|13)$/.test(e.which)) {
            this.hide();
            return;
          } 

          clearTimeout(this.timer);
          this.timer = setTimeout($.proxy(function(){
            this.setTime(this.$element.val());
          }, this), 500);
        },  

        /*
        Parse format from options and set this.is24
        */
        parseFormat: function() {
          var format = this.options.format,
              hFormat = 'HH',
              mFormat = 'mm';

          //hour format    
          $.each(['HH', 'hh', 'H', 'h'], function(i, f){
            if(format.indexOf(f) !== -1) {
              hFormat = f;
              return false;
            }
          });

          //minute format
          $.each(['mm', 'm'], function(i, f){
            if(format.indexOf(f) !== -1) {
              mFormat = f;
              return false;
            }
          });          

          //is 24 hour format
          this.is24 = hFormat.indexOf('H') !== -1; 

          this.hFormat = hFormat;
          this.mFormat = mFormat;
        },

       

        /*
        Parse value passed as string or Date object
        */
        parseTime: function(value) {
          var hour = null, 
              minute = null, 
              ampm = 'am', 
              parts = [], digits;

            value = $.trim(value);

            //try parse time from string assuming separator exist
            if(this.regexpSep) {
                parts = value.match(this.regexpSep);
            }

            if(parts && parts.length) {
              hour = parts[1] ? parseInt(parts[1], 10) : null;
              minute = parts[2] ? parseInt(parts[2], 10): null;
              ampm = (!parts[3] || parts[3].toLowerCase() === 'a') ? 'am' : 'pm';
            } else {
              //if parse with separator failed, search for 1,4-digit block and process it
              //use reversed string to start from end (usefull with full dates)
              //see http://stackoverflow.com/questions/141348/what-is-the-best-way-to-parse-a-time-into-a-date-object-from-user-input-in-javas
              value = value.split('').reverse().join('').replace(/\s/g, '');
              parts = value.match(this.regexpNoSep);
              if(parts && parts.length) {
                ampm = (!parts[1] || parts[1].toLowerCase() === 'a') ? 'am' : 'pm';
                //reverse back
                digits = parts[2].split('').reverse().join('');
                //use smart analyzing to detect hours and minutes
                switch(digits.length) {
                  case 1:
                    hour = parseInt(digits, 10); //e.g. '6'
                  break;
                  case 2:
                    hour = parseInt(digits, 10); //e.g. '16'
                    //if((this.is24 && hour > 24) || (!this.is24 && hour > 12)) { //e.g. 26
                    if(hour > 24) { //e.g. 26
                      hour = parseInt(digits[0], 10);
                      minute = parseInt(digits[1], 10);
                    }
                  break;
                  case 3:
                    hour = parseInt(digits[0], 10);  //e.g. 105
                    minute = parseInt(digits[1]+digits[2], 10); 
                    if(minute > 59) { 
                      hour = parseInt(digits[0]+digits[1], 10); //e.g. 195
                      minute = parseInt(digits[2], 10); 
                      if(hour > 24) {
                        hour = null;
                        minute = null;
                      }
                    }
                  break;
                  case 4:
                    hour = parseInt(digits[0]+digits[1], 10); //e.g. 2006
                    minute = parseInt(digits[2]+digits[3], 10);
                    if(hour > 24) {
                      hour = null;
                    }
                    if(minute > 59) {
                      minute = null;
                    }
                }
              }
            }

          return {hour: hour, minute: minute, ampm: ampm};
        },

        prepareRegexp: function() {
            //take separator from format
            var sep = this.options.format.match(/h\s*([^hm]?)\s*m/i); //HH-mm, HH:mm
            if(sep && sep.length) {
              sep = sep[1];
            } 

            //sep can be null for HH, and '' for HHmm 
            this.separator = sep;
    
            //parse from string
            //use reversed string and regexp to parse 2-digit minutes first
            //see http://stackoverflow.com/questions/141348/what-is-the-best-way-to-parse-a-time-into-a-date-object-from-user-input-in-javas
            //this.regexp = new RegExp('(a|p)?\\s*((\\d\\d?)' + sep + ')?(\\d\\d?)', 'i');

            //regexp, used with separator
            this.regexpSep = (this.separator && this.separator.length) ? new RegExp('(\\d\\d?)\\s*\\' + this.separator + '\\s*(\\d?\\d?)\\s*(a|p)?', 'i') : null;

            //second regexp applied if previous has no result or separator is empty (to reversed string)
            this.regexpNoSep = new RegExp('(a|p)?\\s*(\\d{1,4})', 'i');
        },

        /*
        Returns time as string in specified format
        */
        getTime: function(asObject) {
          if(asObject === true) {
            return {
              hour: this.hour,
              minute: this.minute,
              ampm: this.ampm
            };
          }

          var hour = this.hour !== null ? this.hour + '' : '',
              minute = this.minute !== null ? this.minute + '' : '',
              result = this.options.format;

          if(!hour.length && !minute.length) {
            return '';
          }   

          if(this.hFormat.length > 1 && hour.length === 1) {
            hour = '0' + hour;
          }   

          if(this.mFormat.length > 1 && minute.length === 1) {
            minute = '0' + minute;
          }

          //delete separator if no minutes
          if(!minute.length && this.separator) {
            result = result.replace(this.separator, '');
          }

          result = result.replace(this.hFormat, hour).replace(this.mFormat, minute);
          if(!this.is24) {
            if(result.indexOf('A') !== -1) {
               result = result.replace('A', this.ampm.toUpperCase());
            } else {
               result = result.replace('a', this.ampm);
            }
          }

          return result;
        },

        /*
        Removes widget and detach events
        */
        destroy: function() {
          this.hide();
          this.$clockface.remove();
          if(!this.isInline && this.options.trigger === 'focus') {
            this.$element.off('focus.clockface');
          }          
        }
    };

    $.fn.clockface = function ( option ) {
        var d, args = Array.apply(null, arguments);
        args.shift();

        //getTime returns string (not jQuery onject)
        if(option === 'getTime' && this.length && (d = this.eq(0).data('clockface'))) {
          return d.getTime.apply(d, args);
        }

        return this.each(function () {
            var $this = $(this),
            data = $this.data('clockface'),
            options = typeof option == 'object' && option;
            if (!data) {
                $this.data('clockface', (data = new Clockface(this, options)));
            }
            if (typeof option == 'string' && typeof data[option] == 'function') {
                data[option].apply(data, args);
            }
        });
    };  
    
    $.fn.clockface.defaults = {
        //see http://momentjs.com/docs/#/displaying/format/
        format: 'H:mm',
        trigger: 'focus' //focus|manual
    };
   

 $.fn.clockface.template = ''+
      '<div class="clockface">' +
          '<div class="l1">' +
              '<div class="cell"></div>' +
              '<div class="cell"></div>' +
              '<div class="cell"></div>' +
          '</div>' +
          '<div class="l2">' +
                '<div class="cell left"></div>' +
                '<div class="cell right"></div>' +
          '</div>'+
          '<div class="l3">' +
                '<div class="cell left"></div>' +
                '<div class="cell right"></div>' +
                '<div class="center"><a href="#" class="ampm"></a></div>' +
          '</div>'+
          '<div class="l4">' +
                '<div class="cell left"></div>' +
                '<div class="cell right"></div>' +
          '</div>'+
          '<div class="l5">' +
                '<div class="cell"></div>' +
                '<div class="cell"></div>' +
                '<div class="cell"></div>' +
          '</div>'+
      '</div>';  

}(window.jQuery));