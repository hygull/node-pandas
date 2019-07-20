class NodeSeries extends Array {
    constructor(data) {
        super(...data) // ReferenceError: Must call super constructor in derived class before accessing 'this' or returning from derived constructor
        this._data = data 
    }  

    get show() {
        console.table(this._data)
    }     
}

function Series(data) {
    let series = new NodeSeries(data)
    return series
}

module.exports = Series