const fs = require('fs')
const path = require('path')
const messages = require('../messages/messages')

// https://javascript.info/mixins
const CsvBase = {
    toCsv(outCsvPath = null) {
        let pathDetails

        if (outCsvPath) {
            pathDetails = path.parse(outCsvPath).dir
        } else {
            pathDetails = null
        }
        /*
            { 
                root: '/',
                dir: '/Users/hygull/Desktop/try',
                base: 'node-pandas.csv',
                ext: '.csv',
                name: 'node-pandas' 
            }
        */

        if (pathDetails && fs.existsSync(pathDetails)) {
            let csvText = ''

            csvText += this.columns.join(',') + '\n'

            for (let r = 0; r < this.rows; ++r) {
                for (let c = 0; c < this.cols; ++c) {
                    csvText += this.data[r][this.columns[c]] + ','
                }
                csvText = csvText.trim().slice(0, -1) + '\n' // Remove , from end of last line
            }

            csvText = csvText.trim()

            fs.writeFile(outCsvPath, csvText, (error) => {
                if (error) {
                    messages.error(`${error}`)
                } else {
                    if (this.out) {
                        console.log(`CSV file is successfully created at ${outCsvPath}`)
                    }
                }
            }) // Write CSV contents to file (Asynchronously)
        } else {
            messages.error(`Provided CSV path \`${outCsvPath}\` is invalid`)
        }
    }
}

module.exports = CsvBase