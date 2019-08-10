function getIndicesColumns(dataList) {
    index = Object.keys(dataList).map((row_index) => Number(row_index)) // ['0', '1'] => [0, 1]
    columns = Object.keys(dataList[0])

    return {index, columns}
}


module.exports = getIndicesColumns