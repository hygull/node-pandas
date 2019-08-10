const {
    dataType, 
    getTransformedDataList,
    getIndicesColumns,
    excludingColumns
} = require('../utils/utils')

const messages  = require('../messages/messages')

const CsvBase = require("../bases/CsvBase")

class NodeDataFrame extends Array { // Object => df[0] => undefined 
    constructor(dataList, columns) {
        // Call the constructor of super class before using this keyword
        super(...dataList)

        let index;

        if(columns) {
            ({index, dataList} = getTransformedDataList(dataList, columns))
            this.columns = columns
            this.index = index
        } else {
            let {index, columns} = getIndicesColumns(dataList)
            this.columns = columns
            this.index = index
        }
        this.data = dataList
        this.rows = this.index.length
        this.cols = this.columns.length
        this.setDataForColumns() // df["fullName"] => ["Brinston Jones", Hemkesh Agrawani", "Kendrick Lamar", "Dooj Sahu", Rishikesh Agrawani"]
        this.out = true // Output on console
    }

    set data(data) {
        // Set data of this
        this._data = data
    }

    get data() {
        // Get data of this
        return this._data 
    }

    get show() {
        console.table(this.data)
    }

    setNewAttrib(colName) {
        console.log('Setting data for columns: ', colName)
        this["___" + colName + '___'] = this.data.map((row) => row[colName])
    }

    setDataForColumns() {
        this.columns.map(function(colName) {
            Object.defineProperty(NodeDataFrame.prototype, colName, {
                // set: function(data) {
                //     console.log('Okay fine')
                //     this["__" + colName] = data.map((row) => row[colName])
                // },
                get: function() {
                    // will only be called when b.fullName is executed 

                    if(this["___" + colName + '___'] === undefined) {
                        this.setNewAttrib(colName)
                    }

                    return this["___" + colName + '___'] // [ 'R K', 'H K', 'P K', 'V K' ]
                }
            }) 
        })
    }
}

// https://javascript.info/mixins (class, Object)
Object.assign(NodeDataFrame.prototype, CsvBase)

function DataFrame(dataList, columns=null) {
    let dataframe = new NodeDataFrame(dataList, columns)
    return dataframe
}

// Exporting DataFrame so that it could be used by modules (i.e. they could import and use)
module.exports = DataFrame; 
