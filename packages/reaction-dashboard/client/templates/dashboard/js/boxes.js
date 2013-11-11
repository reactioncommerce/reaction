themeBoxes = function () {
  //-------------------------- Boxes -----------------------------//
  $('.box .box-tool > a').click(function (e) {
    if ($(this).data('action') == undefined) {
      return;
    }
    var action = $(this).data('action');
    var btn = $(this);
    switch (action) {
      case 'collapse':
        $(btn).children('i').addClass('anim-turn180');
        $(this).parents('.box').children('.box-content').slideToggle(500, function () {
          if ($(this).is(":hidden")) {
            $(btn).children('i').attr('class', 'icon-chevron-down');
          } else {
            $(btn).children('i').attr('class', 'icon-chevron-up');
          }
        });
        break;
      case 'close':
        $(this).parents('.box').fadeOut(500, function () {
          $(this).parent().remove();
        })
        break;
      case 'config':
        $('#' + $(this).data('modal')).modal('show');
        break;
    }
    e.preventDefault();
  })
}
