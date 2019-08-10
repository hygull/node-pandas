class A {
    constructor() {
        this.language = ""
        this.cols = ['fullName', 'age']
        this.setAttributes()
    }

    set lang(language) {
        console.log('Check True')
        this.language = language
    }

    get lang() {
        console.log('Fish False')
        return this.language
    }

    setAttributes() {
        this.cols.map(function() {
            Object.defineProperty(this.constructor.prototype, )
        })
    }
}


function test() {
    let a = new A()

    a.lang = "Python"
    console.log(a.lang)

    Object.defineProperty(A.prototype, 'pk', {
        set: function(v) {
            console.log('Hey', v)
            this["v"] = v
        },

        get: function() {
            console.log('Cool boy')
            return this["v"]
        }
    })

    let b = new A()
    console.log('B: ', b)

    b.pk = "TIGER"
    console.log(b.pk)
}

test()

