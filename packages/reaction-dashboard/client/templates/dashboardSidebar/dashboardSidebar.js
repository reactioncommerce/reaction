Template.dashboardSidebar.categories = function () {
  return UserConfig.find({$or: [
    {metafields: {type: 'core'}},
    {metafields: {type: ''}}
  ]}).map(function (parentCategory) {
      return _.extend(parentCategory,
        {children: UserConfig.find({"metafields.type": parentCategory.name}).fetch()});
    });
}


Template.dashboardSidebar.events({
  // 'click .dropdown-toggle': function (event) {
  //     console.log("selected"+this._id);
  // },

  'click #sidebar-collapse': function () {
    $('#sidebar').toggleClass('sidebar-collapsed');
    if ($('#sidebar').hasClass('sidebar-collapsed')) {
      $('#sidebar-collapse > i').attr('class', 'fa fa-angle-double-right fa-lg');
      $.cookie('sidebar-collapsed', 'true');
    } else {
      $('#sidebar-collapse > i').attr('class', 'fa fa-angle-double-left fa-lg');
      $.cookie('sidebar-collapsed', 'false');
    }
    $(".nice-scroll").getNiceScroll().resize();
    scrollableSidebar();
  }
});

Template.dashboardSidebar.rendered = function () {
  //---------------- Sidebar -------------------------------//
  if ($.cookie('sidebar-collapsed') == 'false') {
    $('#sidebar').toggleClass('sidebar-collapsed');
    $('#sidebar-collapse > i').attr('class', 'fa fa-angle-double-left fa-lg');
  }

  //Scrollable fixed sidebar
  scrollableSidebar = function () {
    if ($('#sidebar.sidebar-fixed').size() == 0) {
      $('#sidebar .nav').css('height', 'auto');
      return;
    }
    if ($('#sidebar.sidebar-fixed.sidebar-collapsed').size() > 0) {
      $('#sidebar .nav').css('height', 'auto');
      return;
    }
    var winHeight = $(window).height() - 90;
    $('#sidebar.sidebar-fixed .nav').css('height', winHeight + 'px').niceScroll({railalign: 'left', railoffset: {left: 3}, cursoropacitymax: 0.7});
    setTimeout(function () {
        $("#sidebar.sidebar-fixed .nav").getNiceScroll().doScrollPos(0, $('#sidebar .nav').scrollTop() + 40, 900);
      },
      9
    );
  };
  scrollableSidebar();
  //Submenu dropdown
  // TODO: Move into template events
  $('#sidebar a.dropdown-toggle').click(function () {
    var submenu = $(this).next('.submenu');
    var arrow = $(this).children('.arrow');
    if (arrow.hasClass('icon-angle-right')) {
      arrow.addClass('anim-turn90');
    }
    else {
      arrow.addClass('anim-turn-90');
    }
    submenu.slideToggle(400, function () {
      if ($(this).is(":hidden")) {
        arrow.attr('class', 'arrow icon-angle-right');
        $("#sidebar.sidebar-fixed .nav").getNiceScroll().resize();
      } else {
        arrow.attr('class', 'arrow icon-angle-down');
        scrollableSidebar();
      }
      arrow.removeClass('anim-turn90').removeClass('anim-turn-90');
    });
  });

  //Collapse button
  $('#sidebar.sidebar-collapsed #sidebar-collapse > i').attr('class', 'fa fa-angle-double-right');
  // Code moved to template event

  $('#sidebar').on('show.bs.collapse', function () {
    if ($(this).hasClass('sidebar-collapsed')) {
      $(this).removeClass('sidebar-collapsed');
    }
  });
  //Search Form
  $('#sidebar .search-form').click(function () {
    $('#sidebar .search-form input[type="text"]').focus();
  });
  $('#sidebar .nav > li.active > a > .arrow').removeClass('icon-angle-right').addClass('icon-angle-down');

};
