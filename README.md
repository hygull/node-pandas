# node-pandas

An npm package that incorporates minimal features of python pandas. 

<hr>

## Installation

#### `npm install node-pandas`

<hr>

## Table of contents

> ### `Series`

1.  [Example 1 - Creating Series using 1D array/list](#s-ex1)

> ### `DataFrame`

1.  [Example 1 - Creating DataFrame using 2D array/list](#df-ex1)

2.  [Example 2 - Creating DataFrame using a CSV file](#df-ex2)

<hr>

## Getting started

> ## `Series`

<h3 id='s-ex1'><code>Example 1 - Creating Series using 1D array/list</code></h3>

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

<hr>

> ## `DataFrame` 

<h3 id='df-ex1'><code>Example 1 - Creating DataFrame using 2D array/list</code></h3>

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
> df.columns
[ 'full_name', 'user_id', 'technology' ]
> 
```

<h3 id='df-ex2'><code>Example 2 - Creating DataFrame using a CSV file</code></h3>

> **Note**: If CSV will have multiple lines b/w 2 consecutive rows, no problem, it takes care and considers single one.
>
> **`devs.csv`** &nbsp; `cat /Users/hygull/Projects/NodeJS/node-pandas/docs/csvs/devs.csv`

```csv
fullName,Profession,Language,DevId
Ken Thompson,C developer,C,1122
Ron Wilson,Ruby developer,Ruby,4433
Jeff Thomas,Java developer,Java,8899


Rishikesh Agrawani,Python developer,Python,6677
Kylie Dwine,C++,C++ Developer,0011

Briella Brown,JavaScirpt developer,JavaScript,8844
```

Now have a look the below statements executed on Node REPL.

```javascript
> const pd = require("node-pandas")
undefined
> 
> df = pd.readCsv("/Users/hygull/Projects/NodeJS/node-pandas/docs/csvs/devs.csv")
NodeDataFrame {
  columns: [ 'fullName', 'Profession', 'Language', 'DevId' ],
  index: [ '0', '1', '2', '3', '4', '5' ],
  _data:
   [ { fullName: 'Ken Thompson',
       Profession: 'C developer',
       Language: 'C',
       DevId: 1122 },
     { fullName: 'Ron Wilson',
       Profession: 'Ruby developer',
       Language: 'Ruby',
       DevId: 4433 },
     { fullName: 'Jeff Thomas',
       Profession: 'Java developer',
       Language: 'Java',
       DevId: 8899 },
     { fullName: 'Rishikesh Agrawani',
       Profession: 'Python developer',
       Language: 'Python',
       DevId: 6677 },
     { fullName: 'Kylie Dwine',
       Profession: 'C++',
       Language: 'C++ Developer',
       DevId: 11 },
     { fullName: 'Briella Brown',
       Profession: 'JavaScirpt developer',
       Language: 'JavaScript',
       DevId: 8844 } ] }
> 
> df.index
[ '0', '1', '2', '3', '4', '5' ]
> 
> df.columns
[ 'fullName', 'Profession', 'Language', 'DevId' ]
> 
> df.show
┌─────────┬──────────────────────┬────────────────────────┬─────────────────┬───────┐
│ (index) │       fullName       │       Profession       │    Language     │ DevId │
├─────────┼──────────────────────┼────────────────────────┼─────────────────┼───────┤
│    0    │    'Ken Thompson'    │     'C developer'      │       'C'       │ 1122  │
│    1    │     'Ron Wilson'     │    'Ruby developer'    │     'Ruby'      │ 4433  │
│    2    │    'Jeff Thomas'     │    'Java developer'    │     'Java'      │ 8899  │
│    3    │ 'Rishikesh Agrawani' │   'Python developer'   │    'Python'     │ 6677  │
│    4    │    'Kylie Dwine'     │         'C++'          │ 'C++ Developer' │  11   │
│    5    │   'Briella Brown'    │ 'JavaScirpt developer' │  'JavaScript'   │ 8844  │
└─────────┴──────────────────────┴────────────────────────┴─────────────────┴───────┘
undefined
> 
```

<hr>

### References

- [x] [Node's util](https://millermedeiros.github.io/mdoc/examples/node_api/doc/util.html)

- [x] [JavaScript Arrays - w3schools](https://www.w3schools.com/js/js_arrays.asp)

- [x] [How to test your new NPM module without publishing it every 5 minutes](https://medium.com/@the1mills/how-to-test-your-npm-module-without-publishing-it-every-5-minutes-1c4cb4b369be)

- [x] [Node's path](https://nodejs.org/dist/latest-v6.x/docs/api/path.html)

- [x] [Node's fs - file system](https://nodejs.org/dist/latest-v6.x/docs/api/fs.html)

- [x] [9 Ways to Remove Elements From A JavaScript Array - Plus How to Safely Clear JavaScript Arrays](https://love2dev.com/blog/javascript-remove-from-array/)
