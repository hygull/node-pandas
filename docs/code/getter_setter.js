class A {
    constructor() {
        this.language = ""
    }

    set lang(language) {
        console.log('Check True')
        this.language = language
    }

    get lang() {
        console.log('Fish False')
        return this.language
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

