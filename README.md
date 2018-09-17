# osm-revert-changesets

#### Usage

`npm install osm-revert-changesets`

```
const revertChangesets = require('osm-revert-changesets');

revertChangesets('62632427').then((list) => {
  console.log(list);
})
// logs
[ '62629726' ]
```