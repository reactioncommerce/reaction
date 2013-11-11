//----------------------------- Calanedar --------------------------------//
if (jQuery().fullCalendar) {
  var date = new Date();
  var d = date.getDate();
  var m = date.getMonth();
  var y = date.getFullYear();

  var h = {};

  if ($(window).width() <= 320) {
    h = {
      left: 'title, prev,next',
      center: '',
      right: 'today,month,agendaWeek,agendaDay'
    };
  } else {
    h = {
      left: 'title',
      center: '',
      right: 'prev,next,today,month,agendaWeek,agendaDay'
    };
  }

  var initDrag = function (el) {
    // create an Event Object (http://arshaw.com/fullcalendar/docs/event_data/Event_Object/)
    // it doesn't need to have a start or end
    var eventObject = {
      title: $.trim(el.text()) // use the element's text as the event title
    };
    // store the Event Object in the DOM element so we can get to it later
    el.data('eventObject', eventObject);
    // make the event draggable using jQuery UI
    el.draggable({
      zIndex: 999,
      revert: true, // will cause the event to go back to its
      revertDuration: 0 //  original position after the drag
    });
  }

  var addEvent = function (title, priority) {
    title = title.length == 0 ? "Untitled Event" : title;
    priority = priority.length == 0 ? "default" : priority;

    var html = $('<div data-class="label label-' + priority + '" class="external-event label label-' + priority + '">' + title + '</div>');
    jQuery('#event_box').append(html);
    initDrag(html);
  }

  $('#external-events div.external-event').each(function () {
    initDrag($(this))
  });

  $('#event_add').click(function () {
    var title = $('#event_title').val();
    var priority = $('#event_priority').val();
    addEvent(title, priority);
  });

  //modify chosen options
  var handleDropdown = function () {
    $('#event_priority_chzn .chzn-search').hide(); //hide search box
    $('#event_priority_chzn_o_1').html('<span class="label label-default">' + $('#event_priority_chzn_o_1').text() + '</span>');
    $('#event_priority_chzn_o_2').html('<span class="label label-success">' + $('#event_priority_chzn_o_2').text() + '</span>');
    $('#event_priority_chzn_o_3').html('<span class="label label-info">' + $('#event_priority_chzn_o_3').text() + '</span>');
    $('#event_priority_chzn_o_4').html('<span class="label label-warning">' + $('#event_priority_chzn_o_4').text() + '</span>');
    $('#event_priority_chzn_o_5').html('<span class="label label-important">' + $('#event_priority_chzn_o_5').text() + '</span>');
  }

  $('#event_priority_chzn').click(handleDropdown);

  //predefined events
  addEvent("My Event 1", "default");
  addEvent("My Event 2", "success");
  addEvent("My Event 3", "info");
  addEvent("My Event 4", "warning");
  addEvent("My Event 5", "important");
  addEvent("My Event 6", "success");
  addEvent("My Event 7", "info");
  addEvent("My Event 8", "warning");
  addEvent("My Event 9", "success");
  addEvent("My Event 10", "default");

  $('#calendar').fullCalendar({
    header: h,
    editable: true,
    droppable: true, // this allows things to be dropped onto the calendar !!!
    drop: function (date, allDay) { // this function is called when something is dropped

      // retrieve the dropped element's stored Event Object
      var originalEventObject = $(this).data('eventObject');
      // we need to copy it, so that multiple events don't have a reference to the same object
      var copiedEventObject = $.extend({}, originalEventObject);

      // assign it the date that was reported
      copiedEventObject.start = date;
      copiedEventObject.allDay = allDay;
      copiedEventObject.className = $(this).attr("data-class");

      // render the event on the calendar
      // the last `true` argument determines if the event "sticks" (http://arshaw.com/fullcalendar/docs/event_rendering/renderEvent/)
      $('#calendar').fullCalendar('renderEvent', copiedEventObject, true);

      // is the "remove after drop" checkbox checked?
      if ($('#drop-remove').is(':checked')) {
        // if so, remove the element from the "Draggable Events" list
        $(this).remove();
      }
    },
    events: [
      {
        title: 'All Day Event',
        start: new Date(y, m, 1),
        className: 'label label-default',
      },
      {
        title: 'Long Event',
        start: new Date(y, m, d - 5),
        end: new Date(y, m, d - 2),
        className: 'label label-success',
      },
      {
        id: 999,
        title: 'Repeating Event',
        start: new Date(y, m, d - 3, 16, 0),
        allDay: false,
        className: 'label label-default',
      },
      {
        id: 999,
        title: 'Repeating Event',
        start: new Date(y, m, d + 4, 16, 0),
        allDay: false,
        className: 'label label-important',
      },
      {
        title: 'Meeting',
        start: new Date(y, m, d, 10, 30),
        allDay: false,
        className: 'label label-info',
      },
      {
        title: 'Lunch',
        start: new Date(y, m, d, 12, 0),
        end: new Date(y, m, d, 14, 0),
        allDay: false,
        className: 'label label-warning',
      },
      {
        title: 'Birthday Party',
        start: new Date(y, m, d + 1, 19, 0),
        end: new Date(y, m, d + 1, 22, 30),
        allDay: false,
        className: 'label label-success',
      },
      {
        title: 'Click for Google',
        start: new Date(y, m, 28),
        end: new Date(y, m, 29),
        url: 'http://google.com/',
        className: 'label label-warning',
      }
    ]
  });
  //Replace buttons style
  $('.fc-button').addClass('btn');
}
