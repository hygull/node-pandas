/*
    An npm package to work on python pndas like Series, DataFrame
*/

const Series = require('./series/series')
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
        let index = []
        let columns = lines.shift().trim().split(/\s*\,\s*/g) // Remove 1st line
        
        for(let i=0; i < lines.length; i++) {
            let row = lines[i].split(/\s*\,\s*/g) 
            let obj = {}

            for(let j=0; j < row.length; j++) {
                if(isNaN(row[j])) {
                    obj[columns[j]] = row[j]
                } else {
                    obj[columns[j]] = Number(row[j]) // Otherwise numbers will be like '123', not just 123
                }
            }

            dataList.push(obj)
        }

        let df = DataFrame(dataList)

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
