const Binance = require('binance-api-node').default
const client = Binance()
var HeikinAshi = require("heikinashi");
const createCSV = require('csv-writer').createObjectCsvWriter;

var fields = [
    { id: "openTime", title: "openTime" },
    { id: "open", title: "open" },
    { id: "high", title: "high" },
    { id: "low", title: "low" },
    { id: "close", title: "close" },
    { id: "volume", title: "volume" },
    { id: "trades", title: "trades" },
    // { id: "open_h", title: "open_h" },
    // { id: "close_h", title: "close_h" },
    // { id: "high_h", title: "high_h" },
    // { id: "low_h", title: "low_h" },
]

let outputCSVFile = ""

async function dataCollect() {
    tickers = await client.futuresPrices()
    tickerArr = Object.keys(tickers);
    for (let ticker = 0; ticker < tickerArr.length; ticker++) {
        // if (tickerArr[ticker].substr(tickerArr[ticker].length - 4) != "USDT") {
        //     continue;
        // }
        outputCSVFile = "./Data/Futures/timeframe_1hr/" + tickerArr[ticker] + ".csv"
        try {
            arr = await startEnd()
            tickerData = []
            startTime = arr[1]; endTime = "",incrementBy = [2]
            for (let x = 0; x < arr[0]; x++) {
                endTime = startTime+incrementBy
                data = await client.futuresCandles({ symbol: tickerArr[ticker], interval: "1h", startTime: startTime, endTime: endTime });
                for(let y = 0;y<data.length;y++)
                {
                    tickerData.push(data[y])
                }
                startTime = endTime;
            }
        }
        catch (err) {
            console.log(err)
        }
        // console.log(tickerData)
        await storeData(tickerData, outputCSVFile)
    }
}

async function startEnd() {
    startTime = "01-01-2020"
    endTime = "31-07-2022"
    interval = "1h"
    incrementBy = 1209600000;
    temp = startTime.split("-");
    var startDate = new Date(temp[2], temp[1] - 1, temp[0]);
    temp = endTime.split("-");
    _1dayDiff = 86400000
    temp22 = 100 / 24
    temp23 = (_1dayDiff * (temp22.toFixed()))
    var endDate = new Date(temp[2], temp[1] - 1, temp[0]);
    countTemp = (endDate.getTime() - (startDate.getTime() - temp23)) / incrementBy
    startTime = startDate.getTime() - temp23
    count1 = countTemp.toFixed();
    return [count1, startTime, incrementBy]
}

async function storeData(data, path) {
    let csv = createCSV({
        path: path,
        header: fields
    });
    csv.writeRecords(data).then(() => { });
}

dataCollect()

