# reaction-social - Reaction Core Package

Social Sharing package for Reaction Commerce

Got basic inspiration from joshowens:shareit package.

## Installation:
```
  meteor add lovetostrike:reaction-social
```  
## Customization:
  See server/register.coffee for all available options.
```html
  # footer.html
  <template name='footer'>
    {{#each reactionApps provides="social" name="reaction-social"}}
      {{> Template.dynamic template=template data=customSocialSettings }}
    {{/each}}
  </template>
```
```coffee
  # footer.coffee
  Template.footer.helpers
    customSocialSettings: ->
      placement: 'footer'
      faClass: 'square'
      faSize: 'fa-3x'
      appsOrder: ['facebook', 'twitter', 'googleplus', 'pinterest']
```  
