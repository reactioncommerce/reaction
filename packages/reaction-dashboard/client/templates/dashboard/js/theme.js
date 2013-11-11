Template.dashboard.rendered = function (){
$(function() {
    //Active functions for the theme
    themePlot();
    themeSparkline();
    themeTile();
    themeGoTop();
    themeBoxes();

    //Handle user layout settings using cookie
    function handleUserLayoutSetting() {
        if (typeof cookie_not_handle_user_settings != 'undefined' && cookie_not_handle_user_settings == true) {
            return;
        }
        //Collapsed sidebar
        if ($.cookie('sidebar-collapsed') == 'true') {
            console.log('theme sidebar');
            $('#sidebar').addClass('sidebar-collapsed');
        }

        //Fixed sidebar
        if ($.cookie('sidebar-fixed') == 'true') {
            $('#sidebar').addClass('sidebar-fixed');
        }

        //Fixed navbar
        if ($.cookie('navbar-fixed') == 'true') {
            $('#navbar').addClass('navbar-fixed');
        }

        var color_skin = $.cookie('skin-color');
        var color_sidebar = $.cookie('sidebar-color');
        var color_navbar = $.cookie('navbar-color');

        //Skin color
        if (color_skin !== undefined) {
            $('body').addClass('skin-' + color_skin);
        }

        //Sidebar color
        if (color_sidebar !== undefined) {
            $('#main-container').addClass('sidebar-' + color_sidebar);
        }

        //Navbar color
        if (color_navbar !== undefined) {
            $('#navbar').addClass('navbar-' + color_navbar);
        }
    }
    //If you want to handle skin color by server-side code, don't forget to comment next line
    //handleUserLayoutSetting();


    //Disable certain links
    $('a[href^=#]').click(function (e) {
        e.preventDefault()
    });

    //Add animation to notification and messages icon, if they have any new item
    var badge = $('.flaty-nav .dropdown-toggle > .icon-bell-alt + .badge')
    if ($(badge).length > 0 && parseInt($(badge).html()) > 0) {
        $('.flaty-nav .dropdown-toggle > .icon-bell-alt').addClass('anim-swing');
    }
    badge = $('.flaty-nav .dropdown-toggle > .icon-envelope + .badge')
    if ($(badge).length > 0 && parseInt($(badge).html()) > 0) {
        $('.flaty-nav .dropdown-toggle > .icon-envelope').addClass('anim-top-down');
    }

    //---------------- Nice Scroll --------------------//
    $('html').niceScroll({zindex: 999});
    $('.nice-scroll').niceScroll({railoffset: {left: -3}});
    //$('#sidebar.sidebar-fixed').css('height', $(window).height()).niceScroll({railoffset: {left: -3}});

    //---------------- Tooltip & Popover --------------------//
    $('.show-tooltip').tooltip({container: 'body', delay: {show:500}});
    $('.show-popover').popover();

    //---------------- Syntax Highlighter --------------------//
    window.prettyPrint && prettyPrint();

    //------------------ Theme Setting --------------------//
    //Toggle showing theme setting box
    $('#theme-setting > a').click(function(){
        $(this).next().animate({width:'toggle'}, 500, function(){
            if($(this).is(":hidden")) {
                $('#theme-setting > a > i').attr('class', 'icon-gears icon-2x');
            } else {
                $('#theme-setting > a > i').attr('class', 'icon-remove icon-2x');
            }
        });
        $(this).next().css('display', 'inline-block');
    });
    //Change skin and colors
    $('#theme-setting ul.colors a').click(function(){
        var parent_li = $(this).parent().get(0);
        var parent_ul = $(parent_li).parent().get(0);
        var target = $(parent_ul).data('target');
        var prefix = $(parent_ul).data('prefix');
        var color = $(this).attr('class');
        var regx = new RegExp('\\b' + prefix + '.*\\b', 'g');
        $(parent_ul).children('li').removeClass('active');
        $(parent_li).addClass('active');
        //Remove current skin class if it has
        if ($(target).attr('class') != undefined) {
            $(target).attr('class', $(target).attr('class').replace(regx, '').trim());
        }
        $(target).addClass(prefix + color)
        if (target == 'body') {
            var parent_ul_li = $(parent_ul).parent().get(0);
            var next_li = $(parent_ul_li).nextAll('li:lt(2)');
            $(next_li).find('li.active').removeClass('active');
            $(next_li).find('a.' + color).parent().addClass('active');
            //Remove static color class from Navbar & Sidebar
            $('#navbar').attr('class', $('#navbar').attr('class').replace(/\bnavbar-.*\b/g, '').trim());
            $('#main-container').attr('class', $('#main-container').attr('class').replace(/\bsidebar-.*\b/g, '').trim());
        }
        $.cookie(prefix + 'color', color);
    });
    //Handel selected color
    var theme_colors = ["blue", "red", "green", "orange", "yellow", "pink", "magenta", "gray", "black"];
    $.each(theme_colors, function(k, v) {
        if ($('body').hasClass('skin-' + v)) {
            $('#theme-setting ul.colors > li').removeClass('active');
            $('#theme-setting ul.colors > li:has(a.'+ v +')').addClass('active');
        }
    });

    $.each(theme_colors, function(k, v) {
        if ($('#navbar').hasClass('navbar-' + v)) {
            $('#theme-setting ul[data-prefix="navbar-"] > li').removeClass('active');
            $('#theme-setting ul[data-prefix="navbar-"] > li:has(a.'+ v +')').addClass('active');
        }

        if ($('#main-container').hasClass('sidebar-' + v)) {
            $('#theme-setting ul[data-prefix="sidebar-"] > li').removeClass('active');
            $('#theme-setting ul[data-prefix="sidebar-"] > li:has(a.'+ v +')').addClass('active');
        }
    });
    //Handle fixed navbar & sidebar
    if ($('#sidebar').hasClass('sidebar-fixed')) {
        $('#theme-setting > ul > li > a[data-target="sidebar"] > i').attr('class', 'icon-check green')
    }
    if ($('#navbar').hasClass('navbar-fixed')) {
        $('#theme-setting > ul > li > a[data-target="navbar"] > i').attr('class', 'icon-check green')
    }
    $('#theme-setting > ul > li > a').click(function(){
        var target = $(this).data('target');
        var check = $(this).children('i');
        if (check.hasClass('icon-check-empty')) {
            check.attr('class', 'icon-check green');
            $('#' + target).addClass(target + '-fixed');
            $.cookie(target + '-fixed', 'true');
        } else {
            check.attr('class', 'icon-check-empty');
            $('#' + target).removeClass(target + '-fixed');
            $.cookie(target + '-fixed', 'false');
        }
        if (target == "sidebar") {
            scrollableSidebar();
        }
    });


});
};