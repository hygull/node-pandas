const {
    dataType, 
    getTransformedDataList,
    getIndicesColumns,
} = require('../utils/utils')

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
        this.out = true
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
}

// https://javascript.info/mixins (class, Object)
Object.assign(NodeDataFrame.prototype, CsvBase)

function DataFrame(dataList, columns=null) {
    let dataframe = new NodeDataFrame(dataList, columns)
    return dataframe
}

module.exports = DataFrame;
