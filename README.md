# node-pandas

An [npm package](https://www.npmjs.com/package/node-pandas) that incorporates minimal features of python [pandas](https://pandas.pydata.org/). Check it on npm at [https://www.npmjs.com/package/node-pandas](https://www.npmjs.com/package/node-pandas).

![npm](https://img.shields.io/npm/v/node-pandas.svg?label=node-pandas) ![NPM](https://img.shields.io/npm/l/node-pandas.svg)

> You can also have a look at this colorful documentation at [https://hygull.github.io/node-pandas/](https://hygull.github.io/node-pandas/).
>
> **Note:** Currently, this package is in development. More methods/functions/attributes will be added with time. 
>
> ## What node-pandas v2.0.0 Can Do
>
> node-pandas brings pandas-like data manipulation to Node.js. Here's what you can do:
>
> **Create and manipulate data structures:**
> - Create Series from 1D arrays and DataFrames from 2D arrays or CSV files
> - Access data using array-like syntax (indexing, looping, slicing)
> - View data in beautiful tabular format on console
>
> **Work with columns and rows:**
> - Select specific columns with `select()`
> - Filter rows with conditions using `filter()`
> - Access columns by name or index
>
> **Analyze and aggregate data:**
> - Group data by columns with `groupBy()` and aggregate using `mean()`, `sum()`, `count()`, `min()`, `max()`
> - Perform statistical analysis on Series and DataFrames
>
> **Import and export:**
> - Read CSV files with `readCsv()`
> - Save DataFrames to CSV with `toCsv()`
>
> **Quick Examples:**
>
> ```javascript
> const pd = require("node-pandas")
>
> // Create a Series
> const ages = pd.Series([32, 30, 28])
> console.log(ages[0]) // 32
>
> // Create a DataFrame
> const df = pd.DataFrame([
>     ['Rishikesh Agrawani', 32, 'Engineering'],
>     ['Hemkesh Agrawani', 30, 'Marketing'],
>     ['Malinikesh Agrawani', 28, 'Sales']
> ], ['name', 'age', 'department'])
>
> // Select columns
> const names = df.select(['name'])
>
> // Filter rows
> const over30 = df.filter(row => row.age > 30)
>
> // Group and aggregate
> const avgByDept = df.groupBy('department').mean('age')
>
> // Save to CSV
> df.toCsv('./output.csv')
> ```

## Installation

| Installation type | command |
| :--- | :--- |
| Local | `npm install node-pandas --save` |
| Local as dev dependency | `npm install node-pandas --save-dev` |
| Global | `npm install node-pandas` |


## Table of contents

> ### `Series`

1.  [Example 1 - Creating Series using 1D array/list](#s-ex1)

2.  [Series Methods](#series-methods)
    - [Sorting Methods](#sorting-methods) - sort_values(), sort_index()
    - [Missing Data Handling](#missing-data-handling) - fillna(), dropna(), isna(), notna()
    - [Value Operations](#value-operations) - unique(), value_counts(), duplicated(), drop_duplicates()

> ### `DataFrame`

1.  [Example 1 - Creating DataFrame using 2D array/list](#df-ex1)

2.  [Example 2 - Creating DataFrame using a CSV file](#df-ex2)

3.  [Example 3 - Saving DataFrame in a CSV file](#df-ex3)

4.  [Example 4 - Accessing columns (Retrieving columns using column name)](#df-ex4) - `df.fullName -> ["R A", "B R", "P K"]`

5.  [Example 5 - Selecting specific columns using select()](#df-ex5)

6.  [Example 6 - Filtering DataFrame rows using filter()](#df-ex6)

7.  [Example 7 - Grouping and aggregating data using groupBy()](#df-ex7)

8.  [Example 8 - Merging DataFrames using merge()](#df-ex8)

9.  [Example 9 - Concatenating DataFrames using concat()](#df-ex9)

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
]
> 
> s.show
┌─────────┬────────┐
│ (index) │ Values │
├─────────┼────────┤
│ 0       │ 1      │
│ 1       │ 9      │
│ 2       │ 2      │
│ 3       │ 6      │
│ 4       │ 7      │
│ 5       │ -8     │
│ 6       │ 4      │
│ 7       │ -3     │
│ 8       │ 0      │
│ 9       │ 5      │
└─────────┴────────┘
undefined
> 
> s[0]  // First element in Series
1
> s.length // Total number of elements 
10
> 
```

## Series Methods

### Sorting Methods

#### sort_values()

Sorts Series values in ascending or descending order.

```javascript
const pd = require("node-pandas")

const s = pd.Series([5, 2, 8, 1, 9], { name: 'numbers' })
console.log(s)
// NodeSeries [ 5, 2, 8, 1, 9 ]

// Sort in ascending order (default)
const sorted_asc = s.sort_values()
console.log(sorted_asc)
// NodeSeries [ 1, 2, 5, 8, 9 ]

// Sort in descending order
const sorted_desc = s.sort_values(false)
console.log(sorted_desc)
// NodeSeries [ 9, 8, 5, 2, 1 ]
```

#### sort_index()

Sorts Series by index labels in ascending or descending order.

```javascript
const pd = require("node-pandas")

const s = pd.Series([10, 20, 30], { index: ['c', 'a', 'b'], name: 'values' })
console.log(s)
// NodeSeries [ 10, 20, 30 ]
// index: ['c', 'a', 'b']

// Sort by index in ascending order
const sorted_asc = s.sort_index()
console.log(sorted_asc)
// NodeSeries [ 20, 30, 10 ]
// index: ['a', 'b', 'c']

// Sort by index in descending order
const sorted_desc = s.sort_index(false)
console.log(sorted_desc)
// NodeSeries [ 10, 30, 20 ]
// index: ['c', 'b', 'a']
```

### Missing Data Handling

#### fillna()

Fills missing values (null, undefined, NaN) with a specified value.

```javascript
const pd = require("node-pandas")

const s = pd.Series([1, null, 3, NaN, 5, undefined])
console.log(s)
// NodeSeries [ 1, null, 3, NaN, 5, undefined ]

// Fill missing values with 0
const filled = s.fillna(0)
console.log(filled)
// NodeSeries [ 1, 0, 3, 0, 5, 0 ]
```

#### dropna()

Removes all missing values (null, undefined, NaN) from the Series.

```javascript
const pd = require("node-pandas")

const s = pd.Series([1, null, 3, NaN, 5, undefined])
console.log(s)
// NodeSeries [ 1, null, 3, NaN, 5, undefined ]

// Drop missing values
const cleaned = s.dropna()
console.log(cleaned)
// NodeSeries [ 1, 3, 5 ]
```

#### isna()

Returns a boolean Series indicating which values are missing (null, undefined, NaN).

```javascript
const pd = require("node-pandas")

const s = pd.Series([1, null, 3, NaN, 5])
console.log(s)
// NodeSeries [ 1, null, 3, NaN, 5 ]

// Check for missing values
const missing = s.isna()
console.log(missing)
// NodeSeries [ false, true, false, true, false ]
```

#### notna()

Returns a boolean Series indicating which values are not missing.

```javascript
const pd = require("node-pandas")

const s = pd.Series([1, null, 3, NaN, 5])
console.log(s)
// NodeSeries [ 1, null, 3, NaN, 5 ]

// Check for non-missing values
const notMissing = s.notna()
console.log(notMissing)
// NodeSeries [ true, false, true, false, true ]
```

### Value Operations

#### unique()

Returns a new Series with unique values, preserving order of first appearance.

```javascript
const pd = require("node-pandas")

const s = pd.Series([1, 2, 2, 3, 1, 4, 3, 5])
console.log(s)
// NodeSeries [ 1, 2, 2, 3, 1, 4, 3, 5 ]

// Get unique values
const uniqueValues = s.unique()
console.log(uniqueValues)
// NodeSeries [ 1, 2, 3, 4, 5 ]
```

#### value_counts()

Returns a Series containing counts of unique values, sorted by frequency in descending order.

```javascript
const pd = require("node-pandas")

const s = pd.Series(['apple', 'banana', 'apple', 'orange', 'banana', 'apple'])
console.log(s)
// NodeSeries [ 'apple', 'banana', 'apple', 'orange', 'banana', 'apple' ]

// Count occurrences of each value
const counts = s.value_counts()
counts.show
/*
┌─────────┬──────────┬────────┐
│ (index) │ value    │ count  │
├─────────┼──────────┼────────┤
│ 0       │ 'apple'  │ 3      │
│ 1       │ 'banana' │ 2      │
│ 2       │ 'orange' │ 1      │
└─────────┴──────────┴────────┘
*/
```

#### duplicated()

Returns a boolean Series indicating duplicate values. The `keep` parameter controls which duplicates are marked:
- `'first'` (default): Mark duplicates as true except for the first occurrence
- `'last'`: Mark duplicates as true except for the last occurrence
- `false`: Mark all duplicates as true

```javascript
const pd = require("node-pandas")

const s = pd.Series([1, 2, 2, 3, 1, 4])
console.log(s)
// NodeSeries [ 1, 2, 2, 3, 1, 4 ]

// Mark duplicates (keep first occurrence)
const isDup = s.duplicated('first')
console.log(isDup)
// NodeSeries [ false, false, true, false, true, false ]

// Mark duplicates (keep last occurrence)
const isDupLast = s.duplicated('last')
console.log(isDupLast)
// NodeSeries [ true, false, true, false, false, false ]

// Mark all duplicates
const isDupAll = s.duplicated(false)
console.log(isDupAll)
// NodeSeries [ true, true, true, false, true, false ]
```

#### drop_duplicates()

Returns a new Series with duplicate values removed. The `keep` parameter controls which duplicates to keep:
- `'first'` (default): Keep the first occurrence
- `'last'`: Keep the last occurrence
- `false`: Remove all duplicates

```javascript
const pd = require("node-pandas")

const s = pd.Series([1, 2, 2, 3, 1, 4])
console.log(s)
// NodeSeries [ 1, 2, 2, 3, 1, 4 ]

// Keep first occurrence of duplicates
const uniqueFirst = s.drop_duplicates('first')
console.log(uniqueFirst)
// NodeSeries [ 1, 2, 3, 4 ]

// Keep last occurrence of duplicates
const uniqueLast = s.drop_duplicates('last')
console.log(uniqueLast)
// NodeSeries [ 2, 3, 1, 4 ]

// Remove all duplicates
const noDuplicates = s.drop_duplicates(false)
console.log(noDuplicates)
// NodeSeries [ 3, 4 ]
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
NodeDataFrame [
  [ 'Guido Van Rossum', 6, 'Python' ],
  [ 'Ryan Dahl', 5, 'Node.js' ],
  [ 'Anders Hezlsberg', 7, 'TypeScript' ],
  [ 'Wes McKinney', 3, 'Pandas' ],
  [ 'Ken Thompson', 1, 'B language' ],
  columns: [ 'full_name', 'user_id', 'technology' ],
  index: [ 0, 1, 2, 3, 4 ],
  rows: 5,
  cols: 3,
  out: true
]
> 
> df.show
┌─────────┬────────────────────┬─────────┬──────────────┐
│ (index) │ full_name          │ user_id │ technology   │
├─────────┼────────────────────┼─────────┼──────────────┤
│ 0       │ 'Guido Van Rossum' │ 6       │ 'Python'     │
│ 1       │ 'Ryan Dahl'        │ 5       │ 'Node.js'    │
│ 2       │ 'Anders Hezlsberg' │ 7       │ 'TypeScript' │
│ 3       │ 'Wes McKinney'     │ 3       │ 'Pandas'     │
│ 4       │ 'Ken Thompson'     │ 1       │ 'B language' │
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

> **Note**: If CSV will have multiple newlines b/w 2 consecutive rows, no problem, it takes care of it and considers as single newline.
>
> **`df = pd.readCsv(csvPath)`** where `CsvPath` is absolute/relative path of the CSV file.
>
> **Examples:**
>
> `df = pd.readCsv("../node-pandas/docs/csvs/devs.csv")`
>
> `df = pd.readCsv("/Users/hygull/Projects/NodeJS/node-pandas/docs/csvs/devs.csv")`

[devs.csv](https://github.com/hygull/node-pandas/blob/master/docs/csvs/devs.csv) &raquo; `cat /Users/hygull/Projects/NodeJS/node-pandas/docs/csvs/devs.csv`

```csv
fullName,Profession,Language,DevId
Ken Thompson,C developer,C,1122
Ron Wilson,Ruby developer,Ruby,4433
Jeff Thomas,Java developer,Java,8899


Rishikesh Agrawani,Python developer,Python,6677
Kylie Dwine,C++,C++ Developer,0011

Briella Brown,JavaScript developer,JavaScript,8844
```

Now have a look the below statements executed on Node REPL.

```javascript
> const pd = require("node-pandas")
undefined
> 
> df = pd.readCsv("/Users/hygull/Projects/NodeJS/node-pandas/docs/csvs/devs.csv")
NodeDataFrame [
  {
    fullName: 'Ken Thompson',
    Profession: 'C developer',
    Language: 'C',
    DevId: 1122
  },
  {
    fullName: 'Ron Wilson',
    Profession: 'Ruby developer',
    Language: 'Ruby',
    DevId: 4433
  },
  {
    fullName: 'Jeff Thomas',
    Profession: 'Java developer',
    Language: 'Java',
    DevId: 8899
  },
  {
    fullName: 'Rishikesh Agrawani',
    Profession: 'Python developer',
    Language: 'Python',
    DevId: 6677
  },
  {
    fullName: 'Kylie Dwine',
    Profession: 'C++',
    Language: 'C++ Developer',
    DevId: 11
  },
  {
    fullName: 'Briella Brown',
    Profession: 'JavaScirpt developer',
    Language: 'JavaScript',
    DevId: 8844
  },
  columns: [ 'fullName', 'Profession', 'Language', 'DevId' ],
  index: [ 0, 1, 2, 3, 4, 5 ],
  rows: 6,
  cols: 4,
  out: true
]
> 
> df.index
[ 0, 1, 2, 3, 4, 5 ]
> 
> df.columns
[ 'fullName', 'Profession', 'Language', 'DevId' ]
> 
> df.show
┌─────────┬──────────────────────┬────────────────────────┬─────────────────┬───────┐
│ (index) │ fullName             │ Profession             │ Language        │ DevId │
├─────────┼──────────────────────┼────────────────────────┼─────────────────┼───────┤
│ 0       │ 'Ken Thompson'       │ 'C developer'          │ 'C'             │ 1122  │
│ 1       │ 'Ron Wilson'         │ 'Ruby developer'       │ 'Ruby'          │ 4433  │
│ 2       │ 'Jeff Thomas'        │ 'Java developer'       │ 'Java'          │ 8899  │
│ 3       │ 'Rishikesh Agrawani' │ 'Python developer'     │ 'Python'        │ 6677  │
│ 4       │ 'Kylie Dwine'        │ 'C++'                  │ 'C++ Developer' │ 11    │
│ 5       │ 'Briella Brown'      │ 'JavaScript developer' │ 'JavaScript'    │ 8844  │
└─────────┴──────────────────────┴────────────────────────┴─────────────────┴───────┘
undefined
> 
```

```javascript
> df[0]['fullName']
'Ken Thompson'
> 
> df[3]['Profession']
'Python developer'
> 
> df[5]['Language']
'JavaScript'
> 
```

<h3 id='df-ex3'><code>Example 3 - Saving DataFrame in a CSV file</code></h3>

> **Note:** Here we will save DataFrame in `/Users/hygull/Desktop/newDevs.csv` (in this case) which can be different in your case.

```javascript
> const pd = require("node-pandas")
undefined
> 
> df = pd.readCsv("./docs/csvs/devs.csv")
NodeDataFrame [
  {
    fullName: 'Ken Thompson',
    Profession: 'C developer',
    Language: 'C',
    DevId: 1122
  },
  {
    fullName: 'Ron Wilson',
    Profession: 'Ruby developer',
    Language: 'Ruby',
    DevId: 4433
  },
  {
    fullName: 'Jeff Thomas',
    Profession: 'Java developer',
    Language: 'Java',
    DevId: 8899
  },
  {
    fullName: 'Rishikesh Agrawani',
    Profession: 'Python developer',
    Language: 'Python',
    DevId: 6677
  },
  {
    fullName: 'Kylie Dwine',
    Profession: 'C++',
    Language: 'C++ Developer',
    DevId: 11
  },
  {
    fullName: 'Briella Brown',
    Profession: 'JavaScirpt developer',
    Language: 'JavaScript',
    DevId: 8844
  },
  columns: [ 'fullName', 'Profession', 'Language', 'DevId' ],
  index: [ 0, 1, 2, 3, 4, 5 ],
  rows: 6,
  cols: 4,
  out: true
]
> 
> df.cols
4
> df.rows
6
> df.columns
[ 'fullName', 'Profession', 'Language', 'DevId' ]
> df.index
[ 0, 1, 2, 3, 4, 5 ]
> 
> df.toCsv("/Users/hygull/Desktop/newDevs.csv")
undefined
> CSV file is successfully created at /Users/hygull/Desktop/newDevs.csv

> 
```

Let's see content of `/Users/hygull/Desktop/newDevs.csv`

> **cat /Users/hygull/Desktop/newDevs.csv**

```csv 
fullName,Profession,Language,DevId
Ken Thompson,C developer,C,1122
Ron Wilson,Ruby developer,Ruby,4433
Jeff Thomas,Java developer,Java,8899
Rishikesh Agrawani,Python developer,Python,6677
Kylie Dwine,C++,C++ Developer,11
Briella Brown,JavaScript developer,JavaScript,8844
```

<hr>

<h3 id='df-ex4'><code>Example 4 - Accessing columns (Retrieving columns using column name)</code></h3>

> **CSV file** (devs.csv): [./docs/csvs/devs.csv](./docs/csvs/devs.csv)

```javascript
const pd = require("node-pandas")
df = pd.readCsv("./docs/csvs/devs.csv") // Node DataFrame object

df.show // View DataFrame in tabular form
/*
┌─────────┬──────────────────────┬────────────────────────┬─────────────────┬───────┐
│ (index) │ fullName             │ Profession             │ Language        │ DevId │
├─────────┼──────────────────────┼────────────────────────┼─────────────────┼───────┤
│ 0       │ 'Ken Thompson'       │ 'C developer'          │ 'C'             │ 1122  │
│ 1       │ 'Ron Wilson'         │ 'Ruby developer'       │ 'Ruby'          │ 4433  │
│ 2       │ 'Jeff Thomas'        │ 'Java developer'       │ 'Java'          │ 8899  │
│ 3       │ 'Rishikesh Agrawani' │ 'Python developer'     │ 'Python'        │ 6677  │
│ 4       │ 'Kylie Dwine'        │ 'C++'                  │ 'C++ Developer' │ 11    │
│ 5       │ 'Briella Brown'      │ 'JavaScirpt developer' │ 'JavaScript'    │ 8844  │
└─────────┴──────────────────────┴────────────────────────┴─────────────────┴───────┘
*/

console.log(df['fullName'])
/*
    NodeSeries [
      'Ken Thompson',
      'Ron Wilson',
      'Jeff Thomas',
      'Rishikesh Agrawani',
      'Kylie Dwine',
      'Briella Brown'
    ]
*/

console.log(df.DevId)
/* 
    NodeSeries [ 1122, 4433, 8899, 6677, 11, 8844 ]
*/

let languages = df.Language
console.log(languages) 
/*
    NodeSeries [
      'C',
      'Ruby',
      'Java',
      'Python',
      'C++ Developer',
      'JavaScript'
    ]
*/

console.log(languages[0], '&', languages[1]) // C & Ruby


let professions = df.Profession
console.log(professions) 
/*
    NodeSeries [
      'C developer',
      'Ruby developer',
      'Java developer',
      'Python developer',
      'C++',
      'JavaScirpt developer'
    ]
*/

// Iterate like arrays
for(let profession of professions) {
    console.log(profession)
}
/*
    C developer
    Ruby developer
    Java developer
    Python developer
    C++
    JavaScirpt developer
*/
```

<hr>

<h3 id='df-ex5'><code>Example 5 - Selecting specific columns using select()</code></h3>

> **Note:** The `select()` method returns a new DataFrame containing only the specified columns.

```javascript
const pd = require("node-pandas")

// Create a DataFrame with employee data
const df = pd.DataFrame([
    ['Rishikesh Agrawani', 32, 'Engineering'],
    ['Hemkesh Agrawani', 30, 'Marketing'],
    ['Malinikesh Agrawani', 28, 'Sales']
], ['name', 'age', 'department'])

df.show
/*
┌─────────┬──────────────────────┬─────┬──────────────┐
│ (index) │ name                 │ age │ department   │
├─────────┼──────────────────────┼─────┼──────────────┤
│ 0       │ 'Rishikesh Agrawani' │ 32  │ 'Engineering'│
│ 1       │ 'Hemkesh Agrawani'   │ 30  │ 'Marketing'  │
│ 2       │ 'Malinikesh Agrawani'│ 28  │ 'Sales'      │
└─────────┴──────────────────────┴─────┴──────────────┘
*/

// Select a single column
const nameOnly = df.select(['name'])
nameOnly.show
/*
┌─────────┬──────────────────────┐
│ (index) │ name                 │
├─────────┼──────────────────────┤
│ 0       │ 'Rishikesh Agrawani' │
│ 1       │ 'Hemkesh Agrawani'   │
│ 2       │ 'Malinikesh Agrawani'│
└─────────┴──────────────────────┘
*/

// Select multiple columns
const nameAndAge = df.select(['name', 'age'])
nameAndAge.show
/*
┌─────────┬──────────────────────┬─────┐
│ (index) │ name                 │ age │
├─────────┼──────────────────────┼─────┤
│ 0       │ 'Rishikesh Agrawani' │ 32  │
│ 1       │ 'Hemkesh Agrawani'   │ 30  │
│ 2       │ 'Malinikesh Agrawani'│ 28  │
└─────────┴──────────────────────┴─────┘
*/

// Original DataFrame remains unchanged
console.log(df.columns) // ['name', 'age', 'department']
```

<hr>

<h3 id='df-ex6'><code>Example 6 - Filtering DataFrame rows using filter()</code></h3>

> **Note:** The `filter()` method returns a new DataFrame containing only rows that match the condition. Multiple filters can be chained together.

```javascript
const pd = require("node-pandas")

// Create a DataFrame with employee data
const df = pd.DataFrame([
    ['Rishikesh Agrawani', 32, 'Engineering'],
    ['Hemkesh Agrawani', 30, 'Marketing'],
    ['Malinikesh Agrawani', 28, 'Sales']
], ['name', 'age', 'department'])

df.show
/*
┌─────────┬──────────────────────┬─────┬──────────────┐
│ (index) │ name                 │ age │ department   │
├─────────┼──────────────────────┼─────┼──────────────┤
│ 0       │ 'Rishikesh Agrawani' │ 32  │ 'Engineering'│
│ 1       │ 'Hemkesh Agrawani'   │ 30  │ 'Marketing'  │
│ 2       │ 'Malinikesh Agrawani'│ 28  │ 'Sales'      │
└─────────┴──────────────────────┴─────┴──────────────┘
*/

// Filter rows where age is greater than 28
const over28 = df.filter(row => row.age > 28)
over28.show
/*
┌─────────┬──────────────────────┬─────┬──────────────┐
│ (index) │ name                 │ age │ department   │
├─────────┼──────────────────────┼─────┼──────────────┤
│ 0       │ 'Rishikesh Agrawani' │ 32  │ 'Engineering'│
│ 1       │ 'Hemkesh Agrawani'   │ 30  │ 'Marketing'  │
└─────────┴──────────────────────┴─────┴──────────────┘
*/

// Filter rows where department is 'Engineering'
const engineering = df.filter(row => row.department === 'Engineering')
engineering.show
/*
┌─────────┬──────────────────────┬─────┬──────────────┐
│ (index) │ name                 │ age │ department   │
├─────────┼──────────────────────┼─────┼──────────────┤
│ 0       │ 'Rishikesh Agrawani' │ 32  │ 'Engineering'│
└─────────┴──────────────────────┴─────┴──────────────┘
*/

// Chain multiple filters together
const result = df
    .filter(row => row.age > 28)
    .filter(row => row.department !== 'Sales')
result.show
/*
┌─────────┬──────────────────────┬─────┬──────────────┐
│ (index) │ name                 │ age │ department   │
├─────────┼──────────────────────┼─────┼──────────────┤
│ 0       │ 'Rishikesh Agrawani' │ 32  │ 'Engineering'│
│ 1       │ 'Hemkesh Agrawani'   │ 30  │ 'Marketing'  │
└─────────┴──────────────────────┴─────┴──────────────┘
*/
```

<hr>

<h3 id='df-ex7'><code>Example 7 - Grouping and aggregating data using groupBy()</code></h3>

> **Note:** The `groupBy()` method groups rows by one or more columns and allows aggregation using methods like `mean()`, `sum()`, `count()`, `min()`, and `max()`.

```javascript
const pd = require("node-pandas")

// Create a DataFrame with employee data including departments
const df = pd.DataFrame([
    ['Rishikesh Agrawani', 32, 'Engineering', 95000],
    ['Hemkesh Agrawani', 30, 'Marketing', 75000],
    ['Malinikesh Agrawani', 28, 'Sales', 65000],
    ['Alice Johnson', 29, 'Engineering', 92000],
    ['Bob Smith', 31, 'Marketing', 78000],
    ['Carol White', 27, 'Sales', 62000]
], ['name', 'age', 'department', 'salary'])

df.show
/*
┌─────────┬──────────────────────┬─────┬──────────────┬────────┐
│ (index) │ name                 │ age │ department   │ salary │
├─────────┼──────────────────────┼─────┼──────────────┼────────┤
│ 0       │ 'Rishikesh Agrawani' │ 32  │ 'Engineering'│ 95000  │
│ 1       │ 'Hemkesh Agrawani'   │ 30  │ 'Marketing'  │ 75000  │
│ 2       │ 'Malinikesh Agrawani'│ 28  │ 'Sales'      │ 65000  │
│ 3       │ 'Alice Johnson'      │ 29  │ 'Engineering'│ 92000  │
│ 4       │ 'Bob Smith'          │ 31  │ 'Marketing'  │ 78000  │
│ 5       │ 'Carol White'        │ 27  │ 'Sales'      │ 62000  │
└─────────┴──────────────────────┴─────┴──────────────┴────────┘
*/

// Single-column grouping: Group by department and calculate mean salary
const avgSalaryByDept = df.groupBy('department').mean('salary')
avgSalaryByDept.show
/*
┌─────────┬──────────────┬──────────────┐
│ (index) │ department   │ salary_mean  │
├─────────┼──────────────┼──────────────┤
│ 0       │ 'Engineering'│ 93500        │
│ 1       │ 'Marketing'  │ 76500        │
│ 2       │ 'Sales'      │ 63500        │
└─────────┴──────────────┴──────────────┘
*/

// Group by department and calculate sum of salaries
const totalSalaryByDept = df.groupBy('department').sum('salary')
totalSalaryByDept.show
/*
┌─────────┬──────────────┬──────────────┐
│ (index) │ department   │ salary_sum   │
├─────────┼──────────────┼──────────────┤
│ 0       │ 'Engineering'│ 187000       │
│ 1       │ 'Marketing'  │ 153000       │
│ 2       │ 'Sales'      │ 127000       │
└─────────┴──────────────┴──────────────┘
*/

// Group by department and count employees
const countByDept = df.groupBy('department').count()
countByDept.show
/*
┌─────────┬──────────────┬───────┐
│ (index) │ department   │ count │
├─────────┼──────────────┼───────┤
│ 0       │ 'Engineering'│ 2     │
│ 1       │ 'Marketing'  │ 2     │
│ 2       │ 'Sales'      │ 2     │
└─────────┴──────────────┴───────┘
*/

// Group by department and find minimum age
const minAgeByDept = df.groupBy('department').min('age')
minAgeByDept.show
/*
┌─────────┬──────────────┬──────────┐
│ (index) │ department   │ age_min  │
├─────────┼──────────────┼──────────┤
│ 0       │ 'Engineering'│ 29       │
│ 1       │ 'Marketing'  │ 30       │
│ 2       │ 'Sales'      │ 27       │
└─────────┴──────────────┴──────────┘
*/

// Group by department and find maximum age
const maxAgeByDept = df.groupBy('department').max('age')
maxAgeByDept.show
/*
┌─────────┬──────────────┬──────────┐
│ (index) │ department   │ age_max  │
├─────────┼──────────────┼──────────┤
│ 0       │ 'Engineering'│ 32       │
│ 1       │ 'Marketing'  │ 31       │
│ 2       │ 'Sales'      │ 28       │
└─────────┴──────────────┴──────────┘
*/

// Multi-column grouping: Group by department and age range
const groupedByDeptAndAge = df.groupBy(['department', 'age']).count()
groupedByDeptAndAge.show
/*
┌─────────┬──────────────┬─────┬───────┐
│ (index) │ department   │ age │ count │
├─────────┼──────────────┼─────┼───────┤
│ 0       │ 'Engineering'│ 29  │ 1     │
│ 1       │ 'Engineering'│ 32  │ 1     │
│ 2       │ 'Marketing'  │ 30  │ 1     │
│ 3       │ 'Marketing'  │ 31  │ 1     │
│ 4       │ 'Sales'      │ 27  │ 1     │
│ 5       │ 'Sales'      │ 28  │ 1     │
└─────────┴──────────────┴─────┴───────┘
*/
```

<hr>

<h3 id='df-ex8'><code>Example 8 - Merging DataFrames using merge()</code></h3>

> **Note:** The `merge()` method combines two DataFrames based on a join key, supporting inner, left, right, and outer joins.

```javascript
const pd = require("node-pandas")

// Create two DataFrames to merge
const df1 = pd.DataFrame([
    [1, 'Rishikesh Agrawani'],
    [2, 'Hemkesh Agrawani'],
    [3, 'Malinikesh Agrawani']
], ['id', 'name'])

const df2 = pd.DataFrame([
    [1, 25],
    [2, 30],
    [3, 35]
], ['id', 'age'])

// Inner join on id column
const merged = df1.merge(df2, 'id', 'inner')
merged.show
/*
┌─────────┬────┬──────────────────────┬─────┐
│ (index) │ id │ name                 │ age │
├─────────┼────┼──────────────────────┼─────┤
│ 0       │ 1  │ 'Rishikesh Agrawani' │ 25  │
│ 1       │ 2  │ 'Hemkesh Agrawani'   │ 30  │
│ 2       │ 3  │ 'Malinikesh Agrawani'│ 35  │
└─────────┴────┴──────────────────────┴─────┘
*/

// Left join - keeps all rows from left DataFrame
const leftMerged = df1.merge(df2, 'id', 'left')
leftMerged.show
/*
┌─────────┬────┬──────────────────────┬─────┐
│ (index) │ id │ name                 │ age │
├─────────┼────┼──────────────────────┼─────┤
│ 0       │ 1  │ 'Rishikesh Agrawani' │ 25  │
│ 1       │ 2  │ 'Hemkesh Agrawani'   │ 30  │
│ 2       │ 3  │ 'Malinikesh Agrawani'│ 35  │
└─────────┴────┴──────────────────────┴─────┘
*/
```

<hr>

<h3 id='df-ex9'><code>Example 9 - Concatenating DataFrames using concat()</code></h3>

> **Note:** The `concat()` method stacks DataFrames vertically (axis=0) or horizontally (axis=1).

```javascript
const pd = require("node-pandas")

// Create DataFrames to concatenate
const df1 = pd.DataFrame([
    [1, 'Rishikesh Agrawani'],
    [2, 'Hemkesh Agrawani']
], ['id', 'name'])

const df2 = pd.DataFrame([
    [3, 'Malinikesh Agrawani']
], ['id', 'name'])

// Vertical concatenation (stack rows)
const verticalConcat = pd.DataFrame.concat([df1, df2], 0)
verticalConcat.show
/*
┌─────────┬────┬──────────────────────┐
│ (index) │ id │ name                 │
├─────────┼────┼──────────────────────┤
│ 0       │ 1  │ 'Rishikesh Agrawani' │
│ 1       │ 2  │ 'Hemkesh Agrawani'   │
│ 2       │ 3  │ 'Malinikesh Agrawani'│
└─────────┴────┴──────────────────────┘
*/

// Horizontal concatenation (stack columns)
const df3 = pd.DataFrame([
    [25, 'Engineering'],
    [30, 'Marketing']
], ['age', 'department'])

const horizontalConcat = pd.DataFrame.concat([df1, df3], 1)
horizontalConcat.show
/*
┌─────────┬────┬──────────────────────┬─────┬──────────────┐
│ (index) │ id │ name                 │ age │ department   │
├─────────┼────┼──────────────────────┼─────┼──────────────┤
│ 0       │ 1  │ 'Rishikesh Agrawani' │ 25  │ 'Engineering'│
│ 1       │ 2  │ 'Hemkesh Agrawani'   │ 30  │ 'Marketing'  │
└─────────┴────┴──────────────────────┴─────┴──────────────┘
*/
```

<hr>

### References

+ [Node's util](https://millermedeiros.github.io/mdoc/examples/node_api/doc/util.html)

+ [JavaScript Arrays - w3schools](https://www.w3schools.com/js/js_arrays.asp)

+ [How to test your new NPM module without publishing it every 5 minutes](https://medium.com/@the1mills/how-to-test-your-npm-module-without-publishing-it-every-5-minutes-1c4cb4b369be)

+ [Node's path](https://nodejs.org/dist/latest-v6.x/docs/api/path.html)

+ [Node's fs - file system](https://nodejs.org/dist/latest-v6.x/docs/api/fs.html)

+ [9 Ways to Remove Elements From A JavaScript Array - Plus How to Safely Clear JavaScript Arrays](https://love2dev.com/blog/javascript-remove-from-array/)

+ [JS - isNaN()](https://www.w3schools.com/jsref/jsref_isnan.asp)

+ [Check synchronously if file/directory exists in Node.js](https://stackoverflow.com/questions/4482686/check-synchronously-if-file-directory-exists-in-node-js/4482701)

+ [Node's require() returns an empty object (circular refs -> {})](https://stackoverflow.com/questions/23875233/require-returns-an-empty-object/23875299)

+ [Javascript - Mixins (Adding methods to classes)](https://javascript.info/mixins)

+ [JavaScript Object accessors(setters & getters)](https://www.w3schools.com/js/js_object_accessors.asp)

+ [JavaScript setter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get)

+ [JavaScript getter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/set)

+ [JavaScript (enumerable, writable, configurable)](https://hashnode.com/post/what-are-enumerable-properties-in-javascript-ciljnbtqa000exx53n5nbkykx)

