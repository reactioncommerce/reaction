# Registry Widgets
**Widgets**

Add widgets to your package to be included on the `console dashboard` by including a registry entry and a template that provides 'widget'.

```
<template name="reactionHelloworldWidget">
    <div class="dashboard-widget">
      <div class="dashboard-widget-center">
        <div>
          <h3 class="helloworld-text">Widget Panel</h3><small>your widget</small>
        </div>
      </div>
    </div>
</template>
```

_See example: packages/reaction-core/client/templates/dashboard/orders/widget/widget.html_

_Tip: the `dashboard-widget` and `dashboard-widget-center` classes will create touch/swipeable widget boxes._

Include in **server/register.coffee** registry:

```
    # order widgets
    {
      template: "reactionHelloworldWidget"
      provides: 'widget'
    }
```
