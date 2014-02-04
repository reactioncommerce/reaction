bootstrap-wysiwyg
=================

Tiny bootstrap-compatible WISWYG rich text editor, based on browser execCommand, built originally for [MindMup](http://www.mindmup.com). Here are the key features:

* Automatically binds standard hotkeys for common operations on Mac and Windows
* Drag and drop files to insert images, support image upload (also taking photos on mobile devices)
* Allows a custom built toolbar, no magic markup generators, enabling the web site to use all the goodness of Bootstrap, Font Awesome and so on...
* Does not force any styling - it's all up to you
* Uses standard browser features, no magic non-standard code, toolbar and keyboard configurable to execute any supported [browser command](https://developer.mozilla.org/en/docs/Rich-Text_Editing_in_Mozilla
)
* Does not create a separate frame, backup text areas etc - instead keeps it simple and runs everything inline in a DIV
* (Optionally) cleans up trailing whitespace and empty divs and spans
* Requires a modern browser (tested in Chrome 26, Firefox 19, Safari 6)
* Supports mobile devices (tested on IOS 6 Ipad/Iphone and Android 4.1.1 Chrome)

Basic Usage
-----------

See http://mindmup.github.com/bootstrap-wysiwyg/

Customising
-----------
You can assign commands to hotkeys and toolbar links. For a toolbar link, just put the execCommand command name into a data-edit attribute.
For more info on execCommand, see http://www.quirksmode.org/dom/execCommand.html and https://developer.mozilla.org/en/docs/Rich-Text_Editing_in_Mozilla

```html
<div class="btn-toolbar" data-role="editor-toolbar" data-target="#editor">
  <a class="btn btn-large" data-edit="bold"><i class="icon-bold"></i></a>
</div>
```

To pass arguments to a command, separate a command with a space.

```html
  <a data-edit="fontName Arial">...</a>
```

You can also use input type='text' with a data-edit attribute. When the value
is changed, the command from the data-edit attribute will be applied using the
input value as the command argument

```html
<input type="text" data-edit="createLink">
```
If the input type is file, when a file is selected the contents will be read in using the FileReader API and the data URL will be used as the argument

```html
<input type="file" data-edit="insertImage">
```

To change hotkeys, specify the map of hotkeys to commands in the hotKeys option. For example:

```javascript
$('#editor').wysiwyg({
  hotKeys: {
    'ctrl+b meta+b': 'bold',
    'ctrl+i meta+i': 'italic',
    'ctrl+u meta+u': 'underline',
    'ctrl+z meta+z': 'undo',
    'ctrl+y meta+y meta+shift+z': 'redo'
  }
});
```

Styling for mobile devices
--------------------------

This editor should work pretty well with mobile devices, but you'll need to consider the following things when styling it:
- keyboards on mobile devices take a huge part of the screen
- having to scroll the screen to touch the toolbar can cause the editing component to lose focus, and the mobile device keyboard might go away
- mobile devices tend to move the screen viewport around to ensure that the focused element is shown, so it's best that the edit box is glued to the top

For the content attachment editor on MindMup, we apply the following rules to mobile device styling:
- edit box is glued to the top, so the focus doesn't jump around
- toolbar is below the edit box
- on portrait screens, edit box size is 50% of the screen
- on landscape screens, edit box size is 30% of the screen
- as the screen gets smaller, non-critical toolbar buttons get hidden into a "other" menu

Dependencies
------------
* jQuery http://jquery.com/
* jQuery HotKeys https://github.com/jeresig/jquery.hotkeys
* Bootstrap http://twitter.github.com/bootstrap/
