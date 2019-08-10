// Concept 1
class A {}

a = new A()

// `a.prototype` won't work
Object.defineProperty(a.constructor.prototype, 'k', {
        set: function(v) {
            console.log('You entered')
            this.v = v
        },
        get: function() {
            console.log('You enjoyed')
            return this.v
        }
    }
)


a.k  = 67
console.log(a.k)

// Concept 2
class B {
    constructor() {
        this.data = [
            {'fullName': 'R K', "age": 27},
            {'fullName': 'H K', "age": 25},
            {'fullName': 'P K', "age": 28},
            {'fullName': 'V K', "age": 20}  
        ]
        this.cols = ['fullName', "age"]

        let okay = true // Change here

        if(okay) {
            this.setAttribsOkay() 
            // this["fullName"] = this.data // Will call set or using -> this.fullName also
            // this["age"] = this.data // Will call set or using -> this.age also
        } else {
            this.setAttribsBad() 
        }
    }


    setNewAttrib(colName) {
        console.log('Setting for column name: ', colName)
        this["__" + colName] = this.data.map((row) => row[colName])
    }

    setAttribsOkay() {
        this.cols.map(function(colName) {
            Object.defineProperty(B.prototype, colName, {
                // set: function(data) {
                //     console.log('Okay fine')
                //     this["__" + colName] = data.map((row) => row[colName])
                // },
                get: function() {
                    // will only be called when b.fullName is executed 

                    if(this["__" + colName] === undefined) {
                        console.log('Could not find any set value for ', colName)
                        this.setNewAttrib(colName)
                    }
                    console.log('That look so great')
                    return this["__" + colName] // [ 'R K', 'H K', 'P K', 'V K' ]
                }
            }) 
        })
    }

    setAttribsBad() {
        this.cols.map((colName) => {
            if(['index', 'columns', 'data'].indexOf(colName) === -1) {
                // > a= {}
                // {}
                // > a[1] = 0
                // 0
                // > a
                // { '1': 0 }
                // > 
                this[colName] = this.data.map((row) => {
                    return row[colName]
                })
                console.log('fine+_+', colName)
            } else {
                messages.warning('column_name should not be used as CSV column name as it is being used for specific purpose (changed it to something else)')
            }
        })
    }
}

let b = new B()
console.log(b.data)

console.log(b.fullName)
console.log(b.age)