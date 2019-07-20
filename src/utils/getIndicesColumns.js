function getIndicesColumns(dataList) {
    index = Object.keys(dataList)
    columns = Object.keys(dataList[0])

    return {index, columns}
}