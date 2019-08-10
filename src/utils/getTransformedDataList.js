const dataType = require('../utils/dataType')

function getTransformedDataList(dataList, columns) {
    let index = []
    
    if(dataList.length) {
        let dType = dataType(dataList[0]);
        let newDataList = []
        
        if(dType == 'Array') {
            for(let i=0; i < dataList.length; i++) {
                let row = dataList[i]
                let obj = {}

                for(let j=0; j < row.length; j++) {
                    obj[columns[j]] = dataList[i][j]
                }

                newDataList.push(obj)
                index.push('' + i)
            }
        } else if(dType == 'Object') {
            // Nothing
        }

        dataList = newDataList
    }

    return {index, dataList}
}


module.exports = getTransformedDataList