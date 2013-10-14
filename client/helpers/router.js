//TODO: The commented out portions are how things SHOULD work, but seem to have some issues with iron-router right now
// yield templates are onlhy refreshing when a manual refresh occurs.

// Router.configure({
//   before: function(){
//     if(_.isNull(Meteor.user())){
//         console.log("display not logged in layout");
//         this.layoutTemplate = 'standardLayout';
//         this.yieldTemplates = {'introheader': { to: 'header'},'introfooter': { to: 'footer'}};
//     }
//   }
// });


if (_.isNull(Meteor.user())) {
    console.log("display not logged in layout");
    var options = {
        layoutTemplate: 'standardLayout',
        notFoundTemplate: 'notFound',
        loadingTemplate: 'loading',
        yieldTemplates: {
            'introheader': { to: 'header'},
            'introfooter': { to: 'footer'}
        }
    }
} else {
    console.log("display logged in layout");
    //Spark.finalize(mainPanel.firstChild, mainPanel.lastChild); $(mainPanel).empty();
    var options = {
        layoutTemplate: 'dashboardLayout',
        notFoundTemplate: 'notFound',
        loadingTemplate: 'loading',
        yieldTemplates: {
            'dashboardHeader': { to: 'header'},
            //'dashboardFooter': { to: 'footer'}
        }

    }
}

Router.configure(options);


Router.map(function() {
    // this.route('index',{path:'/'});

    this.route('index', {
        path: '/',
        before: function() {
            if(!Meteor.loggingIn() && Meteor.user()) {
                this.render('dashboardHeader', { to: 'header' });
                this.redirect('dashboard');
            }
        },
        after: function() {
            console.log("on after run");
        }

    });

    this.route('dashboard', {
        action: function () {
            this.render();
            this.render({
                'dashboardHeader': { to: 'header' },
                //'dashboardFooter': { to: 'footer' }
            });
        }
    });

    this.route('howitworks');
    this.route('pricing');
    this.route('contactus');
    //Footer
    this.route('about');
    this.route('faqs');
    this.route('termsofuse');
    this.route('privacypolicy');




});
