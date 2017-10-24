Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur non libero tristique, interdum quam in, fermentum massa. Aenean vestibulum velit eu massa faucibus accumsan. Aenean tempus quam ornare ligula gravida adipiscing. Suspendisse vestibulum diam quis quam lacinia convallis. Nunc rhoncus a elit ut dictum. Maecenas porta mi et risus convallis commodo. In hac habitasse platea dictumst. Morbi placerat sem nec eleifend hendrerit. Donec hendrerit pulvinar tristique. Pellentesque at nunc blandit, fringilla elit nec, dignissim arcu. Quisque sit amet enim urna. Nunc adipiscing lacinia justo. Pellentesque euismod nisi id elit auctor porttitor. Phasellus rutrum viverra felis, ac cursus ante vulputate ut. Donec laoreet felis ac risus vulputate sodales.

Mauris sit amet risus non ligula lacinia iaculis. Sed ornare tellus velit, vel elementum quam porttitor tempus. Duis vestibulum augue eu diam malesuada auctor. Maecenas dignissim odio ut elit fermentum, id mollis leo mattis. Phasellus posuere augue sed interdum vestibulum. Etiam ac pharetra est. Integer tortor ligula, pharetra ac nisi nec, faucibus laoreet dolor. Nunc vehicula, enim et cursus tincidunt, nulla purus mollis urna, vel ultricies nisl mi a risus. Vestibulum sed urna sodales, pretium nisi sed, pretium sapien. Vivamus et massa tincidunt, semper nibh nec, eleifend urna. Integer auctor, eros at pharetra blandit, erat nibh mattis turpis, rhoncus elementum nisi mi vitae purus.

Quisque elementum sapien id neque volutpat cursus non mattis velit.


```
$mod       : function ( qu, value ) {
		var operands = sys.flatten( qu.operands );
		if ( operands.length !== 2 ) {
			throw new Error( "$mod requires two operands" );
		}
		var mod = operands[0];
		var rem = operands[1];
		return value % mod === rem;
	},

```


```
{@lang bash}
#!/bin/bash
echo Please, enter your firstname and lastname
read FN LN
echo "Hi! $LN, $FN !"
```

```bash
#!/bin/bash
echo Please, enter your firstname and lastname
read FN LN
echo "Hi! $LN, $FN !"
```

