# node-pandas

An npm package that incorporates minimal features of python pandas. 

## Installation

#### `npm install node-pandas`

## Getting started

> ## `Series`

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

> ## `DataFrame`


```javascript
> const pd = require("node-pandas")
undefined
> 
> columns = ['full_name', 'user_id', 'technology']
[ 'full_name', 'user_id', 'technology' ]
> 
> df = pd.DataFrame([
...     ['Guido Van Rossum', 6, 'Python'],
...     ['Ryan Dahl', 5, 'Node.js'],
...     ['Anders Hezlsberg', 7, 'TypeScript'],
...     ['Wes McKinney', 3, 'Pandas'],
...     ['Ken Thompson', 1, 'B language']
... ], columns)
NodeDataFrame {
  columns: [ 'full_name', 'user_id', 'technology' ],
  index: [ 0, 1, 2, 3, 4 ],
  _data:
   [ { full_name: 'Guido Van Rossum',
       user_id: 6,
       technology: 'Python' },
     { full_name: 'Ryan Dahl', user_id: 5, technology: 'Node.js' },
     { full_name: 'Anders Hezlsberg',
       user_id: 7,
       technology: 'TypeScript' },
     { full_name: 'Wes McKinney', user_id: 3, technology: 'Pandas' },
     { full_name: 'Ken Thompson',
       user_id: 1,
       technology: 'B language' } ] }
> 
> df.show
┌─────────┬────────────────────┬─────────┬──────────────┐
│ (index) │     full_name      │ user_id │  technology  │
├─────────┼────────────────────┼─────────┼──────────────┤
│    0    │ 'Guido Van Rossum' │    6    │   'Python'   │
│    1    │    'Ryan Dahl'     │    5    │  'Node.js'   │
│    2    │ 'Anders Hezlsberg' │    7    │ 'TypeScript' │
│    3    │   'Wes McKinney'   │    3    │   'Pandas'   │
│    4    │   'Ken Thompson'   │    1    │ 'B language' │
└─────────┴────────────────────┴─────────┴──────────────┘
undefined
> 
> df.index
[ 0, 1, 2, 3, 4 ]
> 
> df.coulmns
undefined
> 
> df.columns
[ 'full_name', 'user_id', 'technology' ]
> 
```
### References

- [x] [Node's util](https://millermedeiros.github.io/mdoc/examples/node_api/doc/util.html)

- [x] [JavaScript Arrays - w3schools](https://www.w3schools.com/js/js_arrays.asp)

- [x] [How to test your new NPM module without publishing it every 5 minutes](https://medium.com/@the1mills/how-to-test-your-npm-module-without-publishing-it-every-5-minutes-1c4cb4b369be)

