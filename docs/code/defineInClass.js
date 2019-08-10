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
        this.setAttribs() 
        this.fullName = this.data // Will call set
        this.age = this.data // Will call set
    }

    setAttribs() {
        this.cols.map(function(colName) {
            Object.defineProperty(B.prototype, colName, {
                set: function(data) {
                    console.log('Okay fine...')
                    this["__" + colName] = data.map((row) => row[colName])
                },
                get: function() {
                    // will only be called when b.fullName is executed 
                    console.log('That look so great...')
                    return this["__" + colName] // [ 'R K', 'H K', 'P K', 'V K' ]
                }
            }) 
        })
    }
}

let b = new B()
console.log(b.data)

console.log(b.fullName)
console.log(b.age)