let pd = require('../src/index')

let s = pd.Series([1, 9, 2, 6, 7])

console.log(s)
console.log(s[0])
s.show

dataList = [
    ['Guido Van Rossum', 6, 'Python'],
    ['Ryan Dahl', 5, 'Node.js'],
    ['Anders Hezlsberg', 7, 'TypeScript'],
    ['Wes McKinney', 3, 'Pandas'],
    ['Ken Thompson', 1, 'B language']
]

columns = ['full_name', 'user_id', 'technology']
let df = pd.DataFrame(dataList, columns);
df.show
console.log(df.columns)
console.log(df.index)