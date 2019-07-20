let pd = require('../src/index')

let s = pd.Series([1, 9, 2, 6, 7])

console.log(s)
console.log(s[0])
s.show



dataList = [
    [1, 5, 7],
    [2, 5, 6],
    [7, 8, 9],
    [4, 3, 1],
    [2, 5, 8]
]

let df = pd.DataFrame(dataList);
df.show
