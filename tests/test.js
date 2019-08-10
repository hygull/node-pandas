let pd = require('../src/index')

// -- Series --
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

// -- DataFrame --
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

let path = "/Users/hygull/Projects/NodeJS/node-pandas/docs/csvs/devs.csv"
/*
➜  node-pandas git:(toCsv) ✗ cat ~/Desktop/try/node-pandas.csv 
fullName,Profession,Language,DevId
Ken Thompson,C developer,C,1122
Ron Wilson,Ruby developer,Ruby,4433
Jeff Thomas,Java developer,Java,8899
Rishikesh Agrawani,Python developer,Python,6677
Kylie Dwine,C++,C++ Developer,11
Briella Brown,JavaScirpt developer,JavaScript,8844
*/

df3 = pd.readCsv(path)
df3.show
/*
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
*/
console.log(df3[0]['fullName'])

// Save to CSV file
df3.toCsv('/Users/hygull/Desktop/try/node-pandas.csv')

console.log(df3['fullName'])
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

console.log(df3.DevId)
/* 
    NodeSeries [ 1122, 4433, 8899, 6677, 11, 8844 ]
*/

let languages = df3.Language
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


let professions = df3.Profession
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




