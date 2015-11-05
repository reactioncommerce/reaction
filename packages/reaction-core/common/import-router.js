Router.map(function() {
  this.route('dashboard/import', {
    controller: ShopAdminController,
    path: '/dashboard/import',
    template: 'import'
  });
});
