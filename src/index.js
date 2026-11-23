/*
    An npm package to work on python pndas like Series, DataFrame
*/

const SeriesClass = require('./series/series')

// Public Series: callable with or without `new` (pd.Series([...]) worked in
// v1.x and is the documented form). The Proxy keeps the class itself, so
// `instanceof pd.Series`, static members and subclassing are unaffected.
const Series = new Proxy(SeriesClass, {
    apply(Target, thisArg, args) {
        return new Target(...args)
    }
})
const DataFrame = require('./dataframe/dataframe')
const dateRange = require("./features/dateRange")
const path = require('path')
const fs = require('fs')

// readCsv is to stop circular references
function readCsv(csvPath) {
    let dataList = []

    if(fs.existsSync(csvPath)) {
        // \n+ is to separate lines properly if there as 1+ new lines b/w 2 rows
        let lines = fs.readFileSync(csvPath).toString().trim().split(/\n+/)
        let columns = lines.shift().trim().split(/\s*\,\s*/g) // Remove 1st line
        
        for(let i=0; i < lines.length; i++) {
            let row = lines[i].trim().split(/\s*\,\s*/g)

            // Numeric strings become numbers, otherwise numbers would be '123', not 123
            dataList.push(columns.map((_, j) => (isNaN(row[j]) ? row[j] : Number(row[j]))))
        }

        let df = DataFrame(dataList, columns)

        return df
    } else {
        console.error(`[ERROR] Provided CSV path is \`${csvPath}\` which does not exist`)
    }
    return null
}

module.exports = {
    // Node pandas supported data types
    Series,
    DataFrame,

    // Features
    readCsv,
    dateRange
}
