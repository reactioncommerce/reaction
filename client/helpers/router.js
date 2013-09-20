Router.configure({
    layout: 'layout',
    notFoundTemplate: 'notFound',
    loadingTemplate: 'loading',
    renderTemplates: {
    /* render the templated named footer to the 'footer' yield */
    'footer': { to: 'footer' },

    /* render the template named sidebar to the 'sidebar' yield */
    'header': { to: 'header' }
    }
});

Router.map(function() {
    //Header
    this.route('index', {path: '/'});
    this.route('home', {path: '/'});
    this.route('howitworks');
    this.route('pricing');
    this.route('contactus');
    this.route('dashboard');
    //Footer
    this.route('about');
    this.route('faqs');
    this.route('termsofuse');
    this.route('privacypolicy');
});