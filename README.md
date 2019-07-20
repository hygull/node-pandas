# node-pandas

An npm package that incorporates minimal features of python pandas. 

### Installation

`npm install node-pandas`

### Getting started

```javascript
> const pd = require("node-pandas")
undefined
> 
> s = pd.Series([1, 9, 2, 6, 7, -8, 4, -3, 0, 5]) 
NodeSeries [
  1,
  9,
  2,
  6,
  7,
  -8,
  4,
  -3,
  0,
  5,
  _data: [ 1, 9, 2, 6, 7, -8, 4, -3, 0, 5 ] ]
> 
> s.show
┌─────────┬────────┐
│ (index) │ Values │
├─────────┼────────┤
│    0    │   1    │
│    1    │   9    │
│    2    │   2    │
│    3    │   6    │
│    4    │   7    │
│    5    │   -8   │
│    6    │   4    │
│    7    │   -3   │
│    8    │   0    │
│    9    │   5    │
└─────────┴────────┘
undefined
> 
> s[0]  // First element in Series
1
> s.length // Total number of elements 
10
> 
```

### References

- [x] [Node's util](https://millermedeiros.github.io/mdoc/examples/node_api/doc/util.html)

- [x] [JavaScript Arrays - w3schools](https://www.w3schools.com/js/js_arrays.asp)

- [x] [How to test your new NPM module without publishing it every 5 minutes](https://medium.com/@the1mills/how-to-test-your-npm-module-without-publishing-it-every-5-minutes-1c4cb4b369be)

