/*global module:false*/
module.exports = function(grunt) {

  'use strict';

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    meta : {
      banner : '/*!\n' +
      ' * GMaps.js v<%= pkg.version %>\n' +
      ' * <%= pkg.homepage %>\n' +
      ' *\n' +
      ' * Copyright <%= grunt.template.today("yyyy") %>, <%= pkg.author %>\n' +
      ' * Released under the <%= pkg.license %> License.\n' +
      ' */\n\n'
    },

    concat: {
      options: {
        banner: '<%= meta.banner %>'
      },
      dist: {
        src: [
          'lib/gmaps.core.js',
          'lib/gmaps.controls.js',
          'lib/gmaps.markers.js',
          'lib/gmaps.overlays.js',
          'lib/gmaps.geometry.js',
          'lib/gmaps.layers.js',
          'lib/gmaps.routes.js',
          'lib/gmaps.geofences.js',
          'lib/gmaps.static.js',
          'lib/gmaps.map_types.js',
          'lib/gmaps.styles.js',
          'lib/gmaps.streetview.js',
          'lib/gmaps.events.js',
          'lib/gmaps.utils.js',
          'lib/gmaps.native_extensions.js'
        ],
        dest: 'gmaps.js'
      }
    },

    jasmine: {
      options: {
        template: 'test/template/jasmine-gmaps.html',
        specs: 'test/spec/*.js',
        vendor: 'http://maps.google.com/maps/api/js?sensor=true',
        styles: 'test/style.css'
      },
      src : '<%= concat.dist.src %>'
    },

    watch : {
      files : '<%= concat.dist.src %>',
      tasks : 'default'
    },

    jshint : {
      all : ['Gruntfile.js']
    }

  });

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-jasmine');

  grunt.registerTask('test', ['jshint', 'jasmine']);
  grunt.registerTask('default', ['test', 'concat']);
};