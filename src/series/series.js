class NodeSeries extends Array {
    constructor(data) {
        super(...data) // ReferenceError: Must call super constructor in derived class before accessing 'this' or returning from derived constructor
        
        /*
        > class B {}
        undefined
        > 
        > let c = new C()
        undefined
        > 
        > c.pk = 90
        90
        > 
        > Object.getOwnPropertyDescriptor(c, 'pk')
        { value: 90, writable: true, enumerable: true, configurable: true }
        > 
        */

        /*
        > Object.defineProperty(c, "o", {
        ... value: 44
        ... })
        B { pk: 90 }
        > 
        > Object.getOwnPropertyDescriptor(c, 'o')
        { value: 44, writable: false, enumerable: false, configurable: false }
        > 
        */

        if(!this._data) { // If no if -> TypeError: Cannot redefine property: _data
            Object.defineProperty(NodeSeries.prototype, '_data', {
                value: data,
                writable: false, 
                enumerable: false, 
                configurable: false
            })
        }
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
