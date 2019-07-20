const {
    dataType, 
    getTransformedDataList,
    getIndicesColumns,
} = require('../utils/utils')


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

function DataFrame(dataList, columns=null) {
    let dataframe = new NodeDataFrame(dataList, columns)
    return dataframe
}

module.exports = DataFrame;
