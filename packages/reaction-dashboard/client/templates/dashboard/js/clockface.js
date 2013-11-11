//-------------------------- Clock Face ------------------------------//
if (jQuery().clockface) {
  $('#clockface_1').clockface();

  $('#clockface_2').clockface({
    format: 'HH:mm',
    trigger: 'manual'
  });

  $('#clockface_2_toggle-btn').click(function (e) {
    e.stopPropagation();
    $('#clockface_2').clockface('toggle');
  });

  $('#clockface_3').clockface({
    format: 'H:mm'
  }).clockface('show', '14:30');
}
