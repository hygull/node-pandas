const dataType = require('../utils/dataType')

class NodeDataFrame extends Object {
    constructor(dataList, columns) {
        // Call the constructor of super class before using this keyword
        super(...dataList)
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
