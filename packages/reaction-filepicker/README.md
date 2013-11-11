# Filepicker.io on demand package for Meteor
(forked from loadpicker/impicker and customized for reaction packages)

Package to use Filepicker in Meteor, loads on demand, optional callback.

## How to install

1. Install Meteorite (if not already installed)

        npm install -g meteorite

2. Add package

        mrt add impicker

## A. How to use with upload button

1. Set your Filepicker key on client JS

        var key = "your filepicker key";


2. Call the script on demand from template.yourTemplate.created or template.yourTemplate.rendered

        loadPicker(key);


3. Call Filepicker from template.yourTemplate.events with a click or submit event

        filepicker.pick();


#### Sample integration

```
if (Meteor.isClient) {
  Session.set("widgetSet", false);
  var key = "xxxxxxxxxxxxxxxxx";

  Template.home.rendered = function ( ) {
    if (!Session.get("widgetSet")) {
      loadPicker(key);
    }
  };

  Template.home.events({
    'click button' : function () {
      filepicker.pick();
    }
  });
}
```

## B. How to use with drop widget or drop area

1. Set your Filepicker key on client JS

        var key = "your filepicker key";

2. Call the script on demand from template.yourTemplate.created or template.yourTemplate.rendered with callback

        loadPicker(key, callback);

3. Call Filepicker from template.yourTemplate.events and include callback function to create widget or drop pane

        var cb = function () {
          filepicker.constructWidget(document.getElementById('constructed-widget'));
          filepicker.makeDropPane($('#exampleDropPane')[0], { });
        };

        loadPicker(key, cb);


#### Sample integration with widget or drop pane and callback

```
if (Meteor.isClient) {
  Session.set("widgetSet", false);
  var key = "insert key here";

Template.hello.rendered = function () {
    if (!Session.get("widgetSet")) {
      var cb = function () {
        filepicker.constructWidget(document.getElementById('constructed-widget'));
        filepicker.makeDropPane($('#exampleDropPane')[0], { });
      };
      loadPicker(key, cb);
    }
  };
```

HTML (include the type tag for the widget!):

    <h1>Widget</h1>
      <div id="constructed-widget" value="empty" type="filepicker-dragdrop" style="display: none;">
      </div>
    <h1>Drop Pane</h1>
      <div id="exampleDropPane">Drop Here!</div>
      <div><pre id="localDropResult"></pre></div>

CSS for drop pane

    #exampleDropPane {
      text-align: center;
      padding: 20px;
      background-color: #F6F6F6;
      border: 1px dashed #666;
      border-radius: 6px;
      margin-bottom: 20px;
    }
