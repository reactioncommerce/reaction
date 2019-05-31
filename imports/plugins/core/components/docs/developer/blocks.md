# Blocks

## Usage

```js
registerBlock({
  region: "main",
  name: "cardOne",
  component: () => (
    <Card>
      <CardContent>
        <span>Card 1</span>
      </CardContent>
    </Card>
  )
});

registerBlock({
  region: "main",
  name: "cardTwo",
  component: () => (
    <Card>
      <CardContent>
        <span>Card 2</span>
      </CardContent>
    </Card>
  )
});

loadRegisteredBlocks();
```
