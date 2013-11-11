CKEditor 4 Changelog
====================

## CKEditor 4.0.1

Fixed issues:

* [#9655](http://dev.ckeditor.com/ticket/9655): Support for IE Quirks Mode in new Moono skin.
* Accessibility issues (mainly on inline editor): [#9364](http://dev.ckeditor.com/ticket/9364), [#9368](http://dev.ckeditor.com/ticket/9368), [#9369](http://dev.ckeditor.com/ticket/9369), [#9370](http://dev.ckeditor.com/ticket/9370), [#9541](http://dev.ckeditor.com/ticket/9541), [#9543](http://dev.ckeditor.com/ticket/9543), [#9841](http://dev.ckeditor.com/ticket/9841), [#9844](http://dev.ckeditor.com/ticket/9844).
* Magic-line:
    * [#9481](http://dev.ckeditor.com/ticket/9481): Added accessibility support for Magic-line.
    * [#9509](http://dev.ckeditor.com/ticket/9509): Added Magic-line support for forms.
    * [#9573](http://dev.ckeditor.com/ticket/9573): Magic-line doesn't disappear on `mouseout` in the specific case.
* [#9754](http://dev.ckeditor.com/ticket/9754): [Webkit] Cut & paste simple unformatted text generates inline wrapper in Webkits.
* [#9456](http://dev.ckeditor.com/ticket/9456): [Chrome] Properly paste bullet list style from MS-Word.
* [#9699](http://dev.ckeditor.com/ticket/9699), [#9758](http://dev.ckeditor.com/ticket/9758): Improved selection locking when selecting by dragging.
* Context menu:
    * [#9712](http://dev.ckeditor.com/ticket/9712): Context menu open destroys editor focus.
    * [#9366](http://dev.ckeditor.com/ticket/9366): Context menu should be displayed over floating toolbar.
    * [#9706](http://dev.ckeditor.com/ticket/9706): Context menu generates JS error in inline mode when editor attached to header element.
* [#9800](http://dev.ckeditor.com/ticket/9800): Hide float panel when resizing window.
* [#9721](http://dev.ckeditor.com/ticket/9721): Padding in content of div based editor puts editing area under bottom UI space.
* [#9528](http://dev.ckeditor.com/ticket/9528): Host page's `box-sizing` style shouldn't influence editor UI elements.
* [#9503](http://dev.ckeditor.com/ticket/9503): Forms plugin adds context menu listeners only on supported input types. Added support for `tel, email, search` and `url` input types.
* [#9769](http://dev.ckeditor.com/ticket/9769): Improved floating toolbar positioning in narrow window.
* [#9875](http://dev.ckeditor.com/ticket/9875): Table dialog doesn't populate width correctly.
* [#8675](http://dev.ckeditor.com/ticket/8675): Deleting cells in nested table removes outer table cell.
* [#9815](http://dev.ckeditor.com/ticket/9815): Can't edit dialog fields on editor initialized in jQuery UI modal dialog.
* [#8888](http://dev.ckeditor.com/ticket/8888): CKEditor dialogs do not show completely in small window.
* [#9360](http://dev.ckeditor.com/ticket/9360): [Inline editor] Blocks shown for a div stay permanently even after user exists editing the div.
* [#9531](http://dev.ckeditor.com/ticket/9531): [Firefox & Inline editor] Toolbar is lost when closing format combo by clicking on its button.
* [#9553](http://dev.ckeditor.com/ticket/9553): Table width incorrectly set when `border-width` style is specified.
* [#9594](http://dev.ckeditor.com/ticket/9594): Cannot tab past CKEditor when it is in read only mode.
* [#9658](http://dev.ckeditor.com/ticket/9658): [IE9] Justify not working on selected image.
* [#9686](http://dev.ckeditor.com/ticket/9686): Added missing contents styles for `<pre>`.
* [#9709](http://dev.ckeditor.com/ticket/9709): PasteFromWord should not depend on configuration from other styles.
* [#9726](http://dev.ckeditor.com/ticket/9726): Removed color dialog dependency from table tools.
* [#9765](http://dev.ckeditor.com/ticket/9765): Toolbar Collapse command documented incorrectly on Accessibility Instructions dialog.
* [#9771](http://dev.ckeditor.com/ticket/9771): [Webkit & Opera] Fixed scrolling issues when pasting.
* [#9787](http://dev.ckeditor.com/ticket/9787): [IE9] onChange isn't fired for checkboxes in dialogs.
* [#9842](http://dev.ckeditor.com/ticket/9842): [Firefox 17] When we open toolbar menu for the first time & press down arrow key, focus goes to next toolbar button instead of menu options.
* [#9847](http://dev.ckeditor.com/ticket/9847): Elements path shouldn't be initialized on inline editor.
* [#9853](http://dev.ckeditor.com/ticket/9853): `Editor#addRemoveFormatFilter` is exposed before it really works.
* [#8893](http://dev.ckeditor.com/ticket/8893): Value of `pasteFromWordCleanupFile` config is now taken from instance configuration.
* [#9693](http://dev.ckeditor.com/ticket/9693): Removed "live preview" checkbox from UI color picker.


## CKEditor 4.0

The first stable release of the new CKEditor 4 code line.

The CKEditor JavaScript API has been kept compatible with CKEditor 4, whenever
possible. The list of relevant changes can be found in the [API Changes page of
the CKEditor 4 documentation][1].

[1]: http://docs.ckeditor.com/#!/guide/dev_api_changes "API Changes""
