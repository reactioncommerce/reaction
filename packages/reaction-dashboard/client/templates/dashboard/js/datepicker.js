//----------------------- Time Picker -------------------------//
if (jQuery().timepicker) {
  $('.timepicker-default').timepicker();
  $('.timepicker-24').timepicker({
    minuteStep: 1,
    showSeconds: true,
    showMeridian: false
  });
}

//------------------------ Date Picker ------------------------//
if (jQuery().datepicker) {
  $('.date-picker').datepicker();
}

//------------------------ Date Range Picker ------------------------//
if (jQuery().daterangepicker) {
  //Date Range Picker
  $('.date-range').daterangepicker();

  $('#form-date-range').daterangepicker({
      ranges: {
        'Today': ['today', 'today'],
        'Yesterday': ['yesterday', 'yesterday'],
        'Last 7 Days': [
          Date.today().add({
            days: -6
          }), 'today'
        ],
        'Last 30 Days': [
          Date.today().add({
            days: -29
          }), 'today'
        ],
        'This Month': [Date.today().moveToFirstDayOfMonth(), Date.today().moveToLastDayOfMonth()],
        'Last Month': [
          Date.today().moveToFirstDayOfMonth().add({
            months: -1
          }), Date.today().moveToFirstDayOfMonth().add({
            days: -1
          })
        ]
      },
      opens: 'right',
      format: 'MM/dd/yyyy',
      separator: ' to ',
      startDate: Date.today().add({
        days: -29
      }),
      endDate: Date.today(),
      minDate: '01/01/2012',
      maxDate: '12/31/2014',
      locale: {
        applyLabel: 'Submit',
        fromLabel: 'From',
        toLabel: 'To',
        customRangeLabel: 'Custom Range',
        daysOfWeek: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
        monthNames: [
          'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November',
          'December'
        ],
        firstDay: 1
      },
      showWeekNumbers: true,
      buttonClasses: ['btn-danger']
    },

    function (start, end) {
      $('#form-date-range span').html(start.toString('MMMM d, yyyy') + ' - ' + end.toString('MMMM d, yyyy'));
    });

  $('#form-date-range span').html(Date.today().add({
    days: -29
  }).toString('MMMM d, yyyy') + ' - ' + Date.today().toString('MMMM d, yyyy'));
}
