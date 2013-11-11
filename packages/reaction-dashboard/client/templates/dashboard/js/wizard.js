//----------------------------- Form Wizard -------------------------//
if (jQuery().bootstrapWizard) {
  $('#form-wizard-1').bootstrapWizard({
    'nextSelector': '.button-next',
    'previousSelector': '.button-previous',
    onTabClick: function (tab, navigation, index) {
      alert('on tab click disabled');
      return false;
    },
    onNext: function (tab, navigation, index) {
      var total = navigation.find('li').length;
      var current = index + 1;
      // set wizard title
      $('.step-title', $('#form-wizard-1')).text('Step ' + (index + 1) + ' of ' + total);
      // set done steps
      jQuery('li', $('#form-wizard-1')).removeClass("done");
      var li_list = navigation.find('li');
      for (var i = 0; i < index; i++) {
        jQuery(li_list[i]).addClass("done");
      }

      if (current == 1) {
        $('#form-wizard-1').find('.button-previous').hide();
      } else {
        $('#form-wizard-1').find('.button-previous').show();
      }

      if (current >= total) {
        $('#form-wizard-1').find('.button-next').hide();
        $('#form-wizard-1').find('.button-submit').show();
      } else {
        $('#form-wizard-1').find('.button-next').show();
        $('#form-wizard-1').find('.button-submit').hide();
      }
      var $percent = (current / total) * 100;
      $('#form-wizard-1').find('.progress-bar').css('width', $percent + '%');

      $('html, body').animate({scrollTop: $("#form-wizard-1").offset().top}, 900);
    },
    onPrevious: function (tab, navigation, index) {
      var total = navigation.find('li').length;
      var current = index + 1;
      // set wizard title
      $('.step-title', $('#form-wizard-1')).text('Step ' + (index + 1) + ' of ' + total);
      // set done steps
      jQuery('li', $('#form-wizard-1')).removeClass("done");
      var li_list = navigation.find('li');
      for (var i = 0; i < index; i++) {
        jQuery(li_list[i]).addClass("done");
      }

      if (current == 1) {
        $('#form-wizard-1').find('.button-previous').hide();
      } else {
        $('#form-wizard-1').find('.button-previous').show();
      }

      if (current >= total) {
        $('#form-wizard-1').find('.button-next').hide();
        $('#form-wizard-1').find('.button-submit').show();
      } else {
        $('#form-wizard-1').find('.button-next').show();
        $('#form-wizard-1').find('.button-submit').hide();
      }
      var $percent = (current / total) * 100;
      $('#form-wizard-1').find('.progress-bar').css('width', $percent + '%');

      $('html, body').animate({scrollTop: $("#form-wizard-1").offset().top}, 900);
    },
    onTabShow: function (tab, navigation, index) {
      var total = navigation.find('li').length;
      var current = index + 1;
      var $percent = (current / total) * 100;
      $('#form-wizard-1').find('.progress-bar').css({
        width: $percent + '%'
      });
    }
  });

  $('#form-wizard-1').find('.button-previous').hide();
  $('#form-wizard-1 .button-submit').click(function () {
    alert('Finished!');
  }).hide();

  $('#form-wizard-2').bootstrapWizard({
    'nextSelector': '.button-next',
    'previousSelector': '.button-previous',
    onTabClick: function (tab, navigation, index) {
      alert('on tab click disabled');
      return false;
    },
    onNext: function (tab, navigation, index) {
      var total = navigation.find('li').length;
      var current = index + 1;
      // set wizard title
      $('.step-title', $('#form-wizard-2')).text('Step ' + (index + 1) + ' of ' + total);
      // set done steps
      jQuery('li', $('#form-wizard-2')).removeClass("done");
      var li_list = navigation.find('li');
      for (var i = 0; i < index; i++) {
        jQuery(li_list[i]).addClass("done");
      }

      if (current == 1) {
        $('#form-wizard-2').find('.button-previous').hide();
      } else {
        $('#form-wizard-2').find('.button-previous').show();
      }

      if (current >= total) {
        $('#form-wizard-2').find('.button-next').hide();
        $('#form-wizard-2').find('.button-submit').show();
      } else {
        $('#form-wizard-2').find('.button-next').show();
        $('#form-wizard-2').find('.button-submit').hide();
      }
      var $percent = (current / total) * 100;
      $('#form-wizard-2').find('.progress-bar').css('width', $percent + '%');

      $('html, body').animate({scrollTop: $("#form-wizard-2").offset().top}, 900);
    },
    onPrevious: function (tab, navigation, index) {
      var total = navigation.find('li').length;
      var current = index + 1;
      // set wizard title
      $('.step-title', $('#form-wizard-2')).text('Step ' + (index + 1) + ' of ' + total);
      // set done steps
      jQuery('li', $('#form-wizard-2')).removeClass("done");
      var li_list = navigation.find('li');
      for (var i = 0; i < index; i++) {
        jQuery(li_list[i]).addClass("done");
      }

      if (current == 1) {
        $('#form-wizard-2').find('.button-previous').hide();
      } else {
        $('#form-wizard-2').find('.button-previous').show();
      }

      if (current >= total) {
        $('#form-wizard-2').find('.button-next').hide();
        $('#form-wizard-2').find('.button-submit').show();
      } else {
        $('#form-wizard-2').find('.button-next').show();
        $('#form-wizard-2').find('.button-submit').hide();
      }
      var $percent = (current / total) * 100;
      $('#form-wizard-2').find('.progress-bar').css('width', $percent + '%');

      $('html, body').animate({scrollTop: $("#form-wizard-2").offset().top}, 900);
    },
    onTabShow: function (tab, navigation, index) {
      var total = navigation.find('li').length;
      var current = index + 1;
      var $percent = (current / total) * 100;
      $('#form-wizard-2').find('.progress-bar').css({
        width: $percent + '%'
      });
    }
  });

  $('#form-wizard-2').find('.button-previous').hide();
  $('#form-wizard-2 .button-submit').click(function () {
    alert('Finished!');
  }).hide();
}
