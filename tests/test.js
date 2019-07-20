let pd = require('../src/index')

let s = pd.Series([1, 9, 2, 6, 7])

console.log(s)
console.log(s[0])
s.show

let dataList = [
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



dataList = [
    ['Kirit Chanap', 8, 'Student, College'],
    ['Hemkesh Agrawani', 6, 'Student, College'],
    ['Diksha Bhandari', 9, 'Student, Secondary School'],
    ['Vrishti Bhandari', 5, 'Student, Secondary School'],
    ['Manjoosha Chanap', 7, 'Student, College'],
    ['Malinikesh Agrawani', 3, 'Student, College'],
    ['Bhagyashree Chanap', 4, 'Teacher, 1st grade'],
    ['Rishikesh Agrawani', 1, 'Software Engineer, Python'],
    ['Ankita Agrawani', 2, 'Student, College']
]

let df2 = pd.DataFrame(dataList)
df2.show
console.log(df2.columns)
console.log(df2.index)