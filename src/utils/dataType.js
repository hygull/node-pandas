function dataType(data) {
    let dType = Object.prototype.toString.call(data).slice(8, -1)
    return dType
}

module.exports = dataType
