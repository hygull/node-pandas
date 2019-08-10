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

    setDataForColumns() {
        this.columns.map((column_name) => {
            if(excludingColumns.indexOf(column_name) === -1) {
                // > a= {}
                // {}
                // > a[1] = 0
                // 0
                // > a
                // { '1': 0 }
                // > 
                this[column_name] = this.data.map((row) => {
                    return row[column_name]
                })
            } else {
                messages.warning('column_name should not be used as CSV column name as it is being used for specific purpose (changed it to something else)')
            }
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
