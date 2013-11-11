# jQuery Tags Input Plugin 

Do you use tags to organize content on your site? 
This plugin will turn your boring tag list into a 
magical input that turns each tag into a style-able 
object with its own delete link. The plugin handles 
all the data - your form just sees a comma-delimited 
list of tags!

[Get it from Github](https://github.com/xoxco/jQuery-Tags-Input)

[View Demo](http://xoxco.com/projects/code/tagsinput/)

[Test it yourself using this jsFiddle Demo](http://jsfiddle.net/7aDak/)

Created by [XOXCO](http://xoxco.com)


## Instructions

First, add the Javascript and CSS files to your <head> tag:

	<script src="jquery.tagsinput.js"></script>
	<link rel="stylesheet" type="text/css" href="jquery.tagsinput.css" />

Create a real input in your form that will contain a comma-separated list of 
tags. You can put any default or existing tags in the value attribute, and 
they'll be handled properly.

	<input name="tags" id="tags" value="foo,bar,baz" />

Then, simply call the tagsInput function on any field that should be treated as
a list of tags.

	$('#tags').tagsInput();

If you want to use jQuery.autocomplete, you can pass in a parameter with the 
autocomplete url.

	$('#tags').tagsInput({
	  autocomplete_url:'http://myserver.com/api/autocomplete'
	});

If you're using the bassistance jQuery.autocomplete, which takes extra 
parameters, you can also send in options to the autocomplete plugin, as 
described here.

	$('#tags').tagsInput({    
	  autocomplete_url:'http://myserver.com/api/autocomplete',
	  autocomplete:{selectFirst:true,width:'100px',autoFill:true}
	});

You can add and remove tags by calling the addTag() and removeTag() functions.

	$('#tags').addTag('foo');
	$('#tags').removeTag('bar');

You can import a list of tags using the importTags() function...

	$('#tags').importTags('foo,bar,baz');

You can also use importTags() to reset the tag list...

	$('#tags').importTags('');

And you can check if a tag exists using tagExist()...

	if ($('#tags').tagExist('foo')) { ... }

If additional functionality is required when a tag is added or removed, you may
specify callback functions via the onAddTag and onRemoveTag parameters.  Both 
functions should accept a single tag as the parameter.

If you do not want to provide a way to add tags, or you would prefer to provide 
an alternate interface for adding tags to the box, you may pass an false into 
the optional 'interactive' parameter. The tags will still be rendered as per 
usual, and the addTag and removeTag functions will operate as expected.   

If you want a function to be called every time a tag is updated/deleted, set it
as the 'onChange' option.

By default, if the cursor is immediately after a tag, hitting backspace will 
delete that tag. If you want to override this, set the 'removeWithBackspace' 
option to false.

## Options

	$(selector).tagsInput({
	   'autocomplete_url': url_to_autocomplete_api,
	   'autocomplete': { option: value, option: value},
	   'height':'100px',
	   'width':'300px',
	   'interactive':true,
	   'defaultText':'add a tag',
	   'onAddTag':callback_function,
	   'onRemoveTag':callback_function,
	   'onChange' : callback_function,
	   'removeWithBackspace' : true,
	   'minChars' : 0,
	   'maxChars' : 0 //if not provided there is no limit,
	   'placeholderColor' : '#666666'
	});
