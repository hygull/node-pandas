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

// Exporting Series so that it could be used by modules (i.e. they could import and use)
module.exports = Series
