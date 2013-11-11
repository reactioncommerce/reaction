//------------------------- Table --------------------------//
//Check all and uncheck all table rows
$('.table > thead > tr > th:first-child > input[type="checkbox"]').change(function () {
  var check = false;
  if ($(this).is(':checked')) {
    check = true;
  }
  $(this).parents('thead').next().find('tr > td:first-child > input[type="checkbox"]').prop('checked', check);
})

//------------------------ Data Table -----------------------//

if (jQuery().dataTable) {
  $('#table1').dataTable({
    "fnDrawCallback": function () {
      if (jQuery().getNiceScroll) {
        $("html").getNiceScroll().resize();
      }
    },
    "aLengthMenu": [
      [10, 15, 25, 50, 100, -1],
      [10, 15, 25, 50, 100, "All"]
    ],
    "iDisplayLength": 10,
    "oLanguage": {
      "sLengthMenu": "_MENU_ Records per page",
      "sInfo": "_START_ - _END_ of _TOTAL_",
      "sInfoEmpty": "0 - 0 of 0",
      "oPaginate": {
        "sPrevious": "Prev",
        "sNext": "Next"
      }
    },
    "aoColumnDefs": [
      {
        'bSortable': false,
        'aTargets': [0]
      }
    ]
  });
}

//----------------------- Chosen Select ---------------------//
if (jQuery().chosen) {
  $(".chosen").chosen();

  $(".chosen-with-diselect").chosen({
    allow_single_deselect: true
  });
}
