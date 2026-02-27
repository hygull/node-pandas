const dataType = require('./dataType') // require('dataType') => Error: Cannot find module 'dataType'
const getTransformedDataList = require('./getTransformedDataList')
const getIndicesColumns = require('./getIndicesColumns')
const excludingColumns = require("./excludingColumns")
const typeDetection = require('./typeDetection')
const validation = require('./validation')
// const readCsv = require('./readCsv')

module.exports = {
    dataType,
    getTransformedDataList,
    getIndicesColumns,
    excludingColumns,
    typeDetection,
    validation
    // readCsv
}
