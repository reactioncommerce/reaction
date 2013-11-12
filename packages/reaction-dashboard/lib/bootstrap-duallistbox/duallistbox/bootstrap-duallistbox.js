/*jshint undef: true, unused:true */
/*global jQuery: true */

/*!=========================================================================
 *  Bootstrap Dual Listbox
 *  v2.0.1
 *
 *  Responsive dual multiple select with filtering. Designed to work on
 *  small touch devices.
 *
 *  https://github.com/istvan-meszaros/bootstrap-duallistbox
 *  http://www.virtuosoft.eu/code/bootstrap-duallistbox/
 *
 *  Copyright 2013 István Ujj-Mészáros
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 * ====================================================================== */

(function($) {
    "use strict";

    $.fn.bootstrapDualListbox = function(options) {

        return this.each(function() {
            var $this = $(this);

            if (!$this.is("select"))
            {
                return $this.find("select").each(function(index, item) {
                    $(item).bootstrapDualListbox(options);
                });
            }

            if ($this.data('duallistbox_generated')) {
                return this;
            }

            var settings = $.extend( {
                bootstrap2compatible    : false,
                preserveselectiononmove : false,            // 'all' / 'moved' / false
                moveonselect            : true,             // true/false (forced true on androids, see the comment later)
                initialfilterfrom       : '',               // string, filter selectables list on init
                initialfilterto         : '',               // string, filter selected list on init
                helperselectnamepostfix     : '_helper',    // 'string_of_postfix' / false
                infotext                : 'Showing all {0}',// text when all options are visible / false for no info text
                infotextfiltered        : '<span class="label label-warning">Filtered</span> {0} from {1}',// when not all of the options are visible due to the filter
                infotextempty           : 'Empty list',      // when there are no options present in the list
                selectorminimalheight   : 100,
                showfilterinputs        : true,
                filterplaceholder       : 'Filter',
                filtertextclear         : 'show all',
                nonselectedlistlabel    : false,            // 'string', false
                selectedlistlabel       : false             // 'string', false
            }, options);

            var container;

            if (settings.bootstrap2compatible) {
                container = $('<div class="row-fluid bootstrap-duallistbox-container bs2compatible"><div class="span6 box1"><span class="info-container"><span class="info"></span><button type="button" class="btn btn-mini clear1 pull-right">' + settings.filtertextclear + '</button></span><input placeholder="' + settings.filterplaceholder + '" class="filter" type="text"><div class="btn-group buttons"><button type="button" class="btn moveall" title="Move all"><i class="icon-arrow-right"></i><i class="icon-arrow-right"></i></button><button type="button" class="btn move" title="Move selected"><i class="icon-arrow-right"></i></button></div><select multiple="multiple" data-duallistbox_generated="true"></select></div><div class="span6 box2"><span class="info-container"><span class="info"></span><button type="button" class="btn btn-mini clear2 pull-right">' + settings.filtertextclear + '</button></span><input placeholder="' + settings.filterplaceholder + '" class="filter" type="text"><div class="btn-group buttons"><button type="button" class="btn remove" title="Remove selected"><i class="icon-arrow-left"></i></button><button type="button" class="btn removeall" title="Remove all"><i class="icon-arrow-left"></i><i class="icon-arrow-left"></i></button></div><select multiple="multiple" data-duallistbox_generated="true"></select></div></div>').insertBefore($this);
            }
            else {
                container = $('<div class="row bootstrap-duallistbox-container"><div class="col-md-6 box1"><span class="info-container"><span class="info"></span><button type="button" class="btn btn-default btn-xs clear1 pull-right">' + settings.filtertextclear + '</button></span><input placeholder="' + settings.filterplaceholder + '" class="filter" type="text"><div class="btn-group buttons"><button type="button" class="btn btn-default moveall" title="Move all"><i class="glyphicon glyphicon-arrow-right"></i><i class="glyphicon glyphicon-arrow-right"></i></button><button type="button" class="btn btn-default move" title="Move selected"><i class="glyphicon glyphicon-arrow-right"></i></button></div><select multiple="multiple" data-duallistbox_generated="true"></select></div><div class="col-md-6 box2"><span class="info-container"><span class="info"></span><button type="button" class="btn btn-default btn-xs clear2 pull-right">' + settings.filtertextclear + '</button></span><input placeholder="' + settings.filterplaceholder + '" class="filter" type="text"><div class="btn-group buttons"><button type="button" class="btn btn-default remove" title="Remove selected"><i class="glyphicon glyphicon-arrow-left"></i></button><button type="button" class="btn btn-default removeall" title="Remove all"><i class="glyphicon glyphicon-arrow-left"></i><i class="glyphicon glyphicon-arrow-left"></i></button></div><select multiple="multiple" data-duallistbox_generated="true"></select></div></div>').insertBefore($this);
            }

            var elements = {
                    originalselect: $this,
                    box1: $('.box1', container),
                    box2: $('.box2', container),
                    filterinput1: $('.box1 .filter', container),
                    filterinput2: $('.box2 .filter', container),
                    filter1clear: $('.box1 .clear1', container),
                    filter2clear: $('.box2 .clear2', container),
                    info1: $('.box1 .info', container),
                    info2: $('.box2 .info', container),
                    select1: $('.box1 select', container),
                    select2: $('.box2 select', container),
                    movebutton: $('.box1 .move', container),
                    removebutton: $('.box2 .remove', container),
                    moveallbutton: $('.box1 .moveall', container),
                    removeallbutton: $('.box2 .removeall', container),
                    form: $($('.box1 .filter', container)[0].form)
                },
                i = 0,
                selectedelements = 0,
                // Selections are invisible on android if the containing select is styled with CSS
                // http://code.google.com/p/android/issues/detail?id=16922
                isbuggyandroid = /android/i.test(navigator.userAgent.toLowerCase());

            init();

            function init()
            {
                // We are forcing to move on select and disabling preserveselection on Android
                if (isbuggyandroid) {
                    settings.moveonselect = true;
                    settings.preserveselectiononmove = false;
                }

                if (settings.moveonselect) {
                    container.addClass('moveonselect');
                }

                var originalselectname = elements.originalselect.attr('name') || '';

                if (settings.nonselectedlistlabel) {
                    var nonselectedlistid = 'bootstrap-duallistbox-nonselected-list_' + originalselectname;

                    elements.box1.prepend('<label for="' + nonselectedlistid + '">' + settings.nonselectedlistlabel + '</label>');
                    elements.select1.prop('id', nonselectedlistid);
                }

                if (settings.selectedlistlabel) {
                    var selectedlistid = 'bootstrap-duallistbox-selected-list_' + originalselectname;

                    elements.box2.prepend('<label for="' + selectedlistid + '">' + settings.selectedlistlabel + '</label>');
                    elements.select2.prop('id', selectedlistid);
                }

                if (!!settings.helperselectnamepostfix)
                {
                    elements.select1.attr('name', originalselectname + settings.helperselectnamepostfix + '1');
                    elements.select2.attr('name', originalselectname + settings.helperselectnamepostfix + '2');
                }

                var c = elements.originalselect.attr('class');

                if (typeof c !== 'undefined' && c) {
                    c = c.match(/\bspan[1-9][0-2]?/);
                    if (!c) {
                        c = elements.originalselect.attr('class');
                        c = c.match(/\bcol-md-[1-9][0-2]?/);
                    }
                }

                if (!!c) {
                    container.addClass(c.toString());
                }

                var height = (elements.originalselect.height() < settings.selectorminimalheight) ? settings.selectorminimalheight : elements.originalselect.height();

                elements.select1.height(height);
                elements.select2.height(height);

                elements.originalselect.addClass('hide');

                updateselectionstates();

                if (!settings.showfilterinputs) {
                    elements.filterinput1.hide();
                    elements.filterinput2.hide();
                } else {
                    elements.filterinput1.val(settings.initialfilterfrom);
                    elements.filterinput2.val(settings.initialfilterto);
                }

                bindevents();
                refreshselects();
            }

            function updateselectionstates()
            {
                elements.originalselect.find('option').each(function(index, item) {
                    var $item = $(item);

                    if (typeof($item.data('original-index')) === 'undefined') {
                        $item.data('original-index', i++);
                    }

                    if (typeof($item.data('_selected')) === 'undefined') {
                        $item.data('_selected', false);
                    }
                });
            }

            function refreshselects()
            {
                selectedelements = 0;

                elements.select1.empty();
                elements.select2.empty();

                elements.originalselect.find('option').each(function(index, item) {
                    var $item = $(item);

                    if ($item.prop('selected')) {
                        selectedelements++;
                        elements.select2.append($item.clone(true).prop('selected', $item.data('_selected')));
                    }
                    else {
                        elements.select1.append($item.clone(true).prop('selected', $item.data('_selected')));
                    }
                });

                filter1();
                filter2();

                refreshinfo();
            }

            function formatstring(s, args)
            {
                return s.replace(/\{(\d+)\}/g, function(match, number) {
                    return typeof args[number] !== 'undefined' ? args[number] : match;
                });
            }

            function refreshinfo()
            {
                if (!settings.infotext) {
                    return;
                }

                var visible1 = elements.select1.find('option').length,
                    visible2 = elements.select2.find('option').length,
                    all1 = elements.originalselect.find('option').length - selectedelements,
                    all2 = selectedelements,
                    content = '';

                if (all1 === 0) {
                    content = settings.infotextempty;
                }
                else if (visible1 === all1) {
                    content = formatstring(settings.infotext, [visible1, all1]);
                }
                else {
                    content = formatstring(settings.infotextfiltered, [visible1, all1]);
                }

                elements.info1.html(content);
                elements.box1.toggleClass('filtered', !(visible1 === all1 || all1 === 0));

                if (all2 === 0) {
                    content = settings.infotextempty;
                }
                else if (visible2 === all2) {
                    content = formatstring(settings.infotext, [visible2, all2]);
                }
                else {
                    content = formatstring(settings.infotextfiltered, [visible2, all2]);
                }

                elements.info2.html(content);
                elements.box2.toggleClass('filtered', !(visible2 === all2 || all2 === 0));
            }

            function bindevents()
            {
                elements.form.submit(function(e) {
                    if (elements.filterinput1.is(":focus"))
                    {
                        e.preventDefault();
                        elements.filterinput1.focusout();
                    }
                    else if (elements.filterinput2.is(":focus"))
                    {
                        e.preventDefault();
                        elements.filterinput2.focusout();
                    }
                });

                elements.originalselect.on('bootstrapduallistbox.refresh', function(e, clearselections){
                    updateselectionstates();

                    if (!clearselections) {
                        saveselections1();
                        saveselections2();
                    }
                    else {
                        clearselections12();
                    }

                    refreshselects();
                });

                elements.filter1clear.on('click', function() {
                    elements.filterinput1.val('');
                    refreshselects();
                });

                elements.filter2clear.on('click', function() {
                    elements.filterinput2.val('');
                    refreshselects();
                });

                elements.movebutton.on('click', function() {
                    move();
                });

                elements.moveallbutton.on('click', function() {
                    moveall();
                });

                elements.removebutton.on('click', function() {
                    remove();
                });

                elements.removeallbutton.on('click', function() {
                    removeall();
                });

                elements.filterinput1.on('change keyup', function() {
                    filter1();
                });

                elements.filterinput2.on('change keyup', function() {
                    filter2();
                });

                if (settings.moveonselect) {
                    settings.preserveselectiononmove = false;

                    elements.select1.on('change', function() {
                        move();
                    });
                    elements.select2.on('change', function() {
                        remove();
                    });
                }

            }

            function saveselections1()
            {
                elements.select1.find('option').each(function(index, item) {
                    var $item = $(item);

                    elements.originalselect.find('option').eq($item.data('original-index')).data('_selected', $item.prop('selected'));
                });
            }

            function saveselections2()
            {
                elements.select2.find('option').each(function(index, item) {
                    var $item = $(item);

                    elements.originalselect.find('option').eq($item.data('original-index')).data('_selected', $item.prop('selected'));
                });
            }

            function clearselections12()
            {
                elements.select1.find('option').each(function() {
                    elements.originalselect.find('option').data('_selected', false);
                });
            }

            function filter1() {
                saveselections1();

                elements.select1.empty().scrollTop(0);

                var regex = new RegExp($.trim(elements.filterinput1.val()), "gi");

                elements.originalselect.find('option').not(':selected').each(function(index, item) {
                    var $item = $(item);
                    var isFiltered = true;

                    if (item.text.match(regex)) {
                        isFiltered = false;
                        elements.select1.append($item.clone(true).prop('selected', $item.data('_selected')));
                    }

                    elements.originalselect.find('option').eq($item.data('original-index')).data('filtered1', isFiltered);
                });

                refreshinfo();
            }

            function filter2() {
                saveselections2();

                elements.select2.empty().scrollTop(0);

                var regex = new RegExp($.trim(elements.filterinput2.val()), "gi");

                elements.originalselect.find('option:selected').each(function(index, item) {
                    var $item = $(item);
                    var isFiltered = true;

                    if (item.text.match(regex)) {
                        isFiltered = false;
                        elements.select2.append($item.clone(true).prop('selected', $item.data('_selected')));
                    }

                    elements.originalselect.find('option').eq($item.data('original-index')).data('filtered2', isFiltered);
                });

                refreshinfo();
            }

            function sortoptions(select)
            {
                select.find('option').sort(function(a, b) {
                    return ($(a).data('original-index') > $(b).data('original-index')) ? 1 : -1;
                }).appendTo(select);
            }

            function changeselectionstate(original_index, selected)
            {
                elements.originalselect.find('option').each(function(index, item) {
                    var $item = $(item);

                    if ($item.data('original-index') === original_index) {
                        $item.prop('selected', selected);
                    }
                });
            }

            function move()
            {
                if (settings.preserveselectiononmove === 'all') {
                    saveselections1();
                    saveselections2();
                }
                else if (settings.preserveselectiononmove === 'moved') {
                    saveselections1();
                }

                elements.select1.find('option:selected').each(function(index, item) {
                    var $item = $(item);

                    if (!$item.data('filtered1')) {
                        changeselectionstate($item.data('original-index'), true);
                    }
                });

                refreshselects();

                sortoptions(elements.select2);
            }

            function remove()
            {
                if (settings.preserveselectiononmove === 'all') {
                    saveselections1();
                    saveselections2();
                }
                else if (settings.preserveselectiononmove === 'moved') {
                    saveselections2();
                }

                elements.select2.find('option:selected').each(function(index, item) {
                    var $item = $(item);

                    if (!$item.data('filtered2')) {
                        changeselectionstate($item.data('original-index'), false);
                    }
                });

                refreshselects();

                sortoptions(elements.select1);
            }

            function moveall()
            {
                if (settings.preserveselectiononmove === 'all') {
                    saveselections1();
                    saveselections2();
                }
                else if (settings.preserveselectiononmove === 'moved') {
                    saveselections1();
                }

                elements.originalselect.find('option').each(function(index, item) {
                    var $item = $(item);

                    if (!$item.data('filtered1')) {
                        $item.prop('selected', true);
                    }
                });

                refreshselects();
            }

            function removeall()
            {
                if (settings.preserveselectiononmove === 'all') {
                    saveselections1();
                    saveselections2();
                }
                else if (settings.preserveselectiononmove === 'moved') {
                    saveselections2();
                }

                elements.originalselect.find('option').each(function(index, item) {
                    var $item = $(item);

                    if (!$item.data('filtered2')) {
                        $item.prop('selected', false);
                    }
                });

                refreshselects();
            }
        });

    };

})(jQuery);
