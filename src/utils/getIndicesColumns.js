function getIndicesColumns(dataList) {
    index = Object.keys(dataList).map((row_index) => "" + row_index)
    columns = Object.keys(dataList[0])

    return {index, columns}
}


module.exports = getIndicesColumns