# Date Range Picker for Twitter Bootstrap

![Improvely.com](http://www.dangrossman.info/wp-content/themes/2012/daterangepicker.png)

This date range picker component for Twitter Bootstrap creates a dropdown menu from which a user can 
select a range of dates. It was created for the reporting UI at [Improvely](http://www.improvely.com).

If invoked with no options, it will present two calendars to choose a start 
and end date from. Optionally, you can provide a list of date ranges the user can select from instead 
of choosing dates from the calendars. If attached to a text input, the selected dates will be inserted 
into the text box. Otherwise, you can provide a custom callback function to receive the selection.

[Live demo &amp; option usage examples](http://www.dangrossman.info/2012/08/20/a-date-range-picker-for-twitter-bootstrap/)

## Usage

This component relies on [Twitter Bootstrap](http://twitter.github.com/bootstrap/), 
[Datejs](http://www.datejs.com/) and [jQuery](http://jquery.com/).

Basic usage:

```
<script type="text/javascript" src="jquery.js"></script>
<script type="text/javascript" src="date.js"></script>
<script type="text/javascript" src="daterangepicker.js"></script>
<link rel="stylesheet" type="text/css" href="bootstrap.css" />
<link rel="stylesheet" type="text/css" href="daterangepicker.css" />

<script type="text/javascript">
$(document).ready(function() {
  $('input[name="daterange"]').daterangepicker();
});
</script>
```

Additional options allow:
* Custom callback handler called when the date range selection is made
* Setting initial start and end dates for the calendars
* Bounding the minimum and maximum selectable dates
* Overriding all labels in the interface with localized text
* Starting the calendar week on any day of week
* Overriding the direction the dropdown expands (left/right of element it's attached to)
* Setting the date format string for parsing and printing dates
* Showing week numbers

Syntax for all the options can be found in the examples.html file.

## License

This code is made available under the same license as Twitter Bootstrap. Date.js is included in this repository for convenience. It is available under the 
[MIT license](http://www.opensource.org/licenses/mit-license.php).

--

Copyright 2012 Dan Grossman

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.