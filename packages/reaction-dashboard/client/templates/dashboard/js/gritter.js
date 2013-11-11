//---------------------- Gritter Notification --------------//
$('#gritter-sticky').click(function () {
  var unique_id = $.gritter.add({
    // (string | mandatory) the heading of the notification
    title: 'This is a sticky notice!',
    // (string | mandatory) the text inside the notification
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus eget tincidunt velit. Cum sociis natoque penatibus et <a href="#" style="color:#ccc">magnis dis parturient</a> montes, nascetur ridiculus mus.',
    // (string | optional) the image to display on the left
    image: './img/demo/avatar/avatar1.jpg',
    // (bool | optional) if you want it to fade out on its own or just sit there
    sticky: true,
    // (int | optional) the time you want it to be alive for before fading out
    time: '',
    // (string | optional) the class name you want to apply to that specific message
    class_name: 'my-sticky-class'
  });
  return false;
});

$('#gritter-regular').click(function () {

  $.gritter.add({
    // (string | mandatory) the heading of the notification
    title: 'This is a regular notice!',
    // (string | mandatory) the text inside the notification
    text: 'This will fade out after a certain amount of time. Vivamus eget tincidunt velit. Cum sociis natoque penatibus et <a href="#" style="color:#ccc">magnis dis parturient</a> montes, nascetur ridiculus mus.',
    // (string | optional) the image to display on the left
    image: './img/demo/avatar/avatar1.jpg',
    // (bool | optional) if you want it to fade out on its own or just sit there
    sticky: false,
    // (int | optional) the time you want it to be alive for before fading out
    time: ''
  });

  return false;

});

$('#gritter-max').click(function () {

  $.gritter.add({
    // (string | mandatory) the heading of the notification
    title: 'This is a notice with a max of 3 on screen at one time!',
    // (string | mandatory) the text inside the notification
    text: 'This will fade out after a certain amount of time. Vivamus eget tincidunt velit. Cum sociis natoque penatibus et <a href="#" style="color:#ccc">magnis dis parturient</a> montes, nascetur ridiculus mus.',
    // (string | optional) the image to display on the left
    image: './img/demo/avatar/avatar1.jpg',
    // (bool | optional) if you want it to fade out on its own or just sit there
    sticky: false,
    // (function) before the gritter notice is opened
    before_open: function () {
      if ($('.gritter-item-wrapper').length == 3) {
        // Returning false prevents a new gritter from opening
        return false;
      }
    }
  });
  return false;
});

$('#gritter-without-image').click(function () {
  $.gritter.add({
    // (string | mandatory) the heading of the notification
    title: 'This is a notice without an image!',
    // (string | mandatory) the text inside the notification
    text: 'This will fade out after a certain amount of time. Vivamus eget tincidunt velit. Cum sociis natoque penatibus et <a href="#" style="color:#ccc">magnis dis parturient</a> montes, nascetur ridiculus mus.'
  });

  return false;
});

$('#gritter-light').click(function () {

  $.gritter.add({
    // (string | mandatory) the heading of the notification
    title: 'This is a light notification',
    // (string | mandatory) the text inside the notification
    text: 'Just add a "gritter-light" class_name to your $.gritter.add or globally to $.gritter.options.class_name',
    class_name: 'gritter-light'
  });

  return false;
});

$("#gritter-remove-all").click(function () {

  $.gritter.removeAll();
  return false;

});
