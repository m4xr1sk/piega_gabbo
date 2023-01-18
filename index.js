const express = require('express')
var bodyParser = require('body-parser')
const fs = require('fs')
var moment = require('moment');
const axios = require('axios');

const app = express()
const port = 3000

app.use(express.static('public'));
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 

console.log("Started!")

function isToday(date) {
    const today = new Date();
    // 👇️ Today's date
    //console.log(today);
    if (today.toDateString() === date.toDateString()) {
      return true;
    }
    return false;
  }

function process_sample_log(SystemEventLog) {
    
    var data = JSON.parse("[" + SystemEventLog + "]")
    data = data.filter(o => o.timems === undefined)
    data.map(o => {
        delete o.step
        delete o.stock
        delete o.path
        var d = new Date(0)
        d.setUTCMilliseconds(o.time)
        o.datetime = d//.toLocaleString('it-IT');
    })

    // cerco l'ultimo caricamento
    var data_last_load = data.filter(o => {
        return (o.event == 'load' && o.prod !== undefined)
    }).slice(-1)[0]
    console.log("LOAD", data_last_load)

    // cerco l'ultimo START
    var last_start = data.filter(o => {
        return (o.event == "start")       
    }).slice(-1)[0]
    
    // cerco il primo STOP dopo START
    var data_last_stop = data.filter(o => {
        return (o.event == "stop" && o.time > last_start.time)
    }).slice(0, 1)
    // cerco il primo ERROR dopo START
    var data_last_error = data.filter(o => {
        return (o.event == "error" && o.time > last_start.time)
    }).slice(0, 1)
    
    console.log("------------------------------------------")
    
    console.log("START", last_start)
    console.log("STOP", data_last_stop)
    console.log("ERROR", data_last_error)
    
    console.log("------------------------------------------")

    var data_today_starts = data.filter(o => {
        return (isToday(o.datetime) && o.event == "start")
    })
    console.log("TODAY", data_today_starts)

    console.log("------------------------------------------")

    var o = {
        counter: data_today_starts.length, // conto tutti gli stop che ci sono stati!
        configFileName: data_last_load.prod,
        running: 0,
        runTime: 0,
    }

    if (data_last_error.length == 0 && data_last_stop.length == 0) {
        // dopo lo START non ci sono STOP e nemmeno ERROR
        var d = new Date()
        o.running = true
        o.runTime = (( d.getTime() - last_start.datetime ) / 31536000000).toFixed(0)
    } else {
        o.running = false
        if (data_last_error[0].time < data_last_stop[0].time) {
            o.runTime = (data_last_error[0].time - last_start.time)/1000
        } else {
            o.runTime = (data_last_stop[0].time - last_start.time)/1000
        }
    }
    
    console.log(o)
    //console.log(data.filter(o => {
    //    return o.time >= data_last_start.time
    //}).slice(-100))
    return o

    
    //var num = 0
    //data_load.map(() => num++)
    //data.sort((a, b) => {
    //    return (a.mode < a.mode)
    //})
    // data_load.map(o => {
    //     //o.time2 = (o.time/1000).toFixed(0)
    //     var d = new Date(0)
    //     d.setUTCMilliseconds(o.time)
    //     o.datetime = d
    // })
    //console.log("num", num)



}

const demo_SystemEventLog = fs.readFileSync('./test/SystemEventLog.txt')
process_sample_log(demo_SystemEventLog)

//var oo = moment(1673544031107)
//console.log(oo)

var status = {
    timer: 0,
    counter: 123,
    running: true,
    runTime: 10,
    configFileName: "xxx",
    programName: "",
    programTime: 0,
}

setInterval(() => {
    status.timer++
}, 100)

setInterval(() => {
    axios.get('http://192.168.144.100/~Logs/SystemEventLog.txt').then(resp => {
        console.log(resp.data);
    });
}, 2000)

app.get('/hello', function (req, res) {
    res.send('Hello!');
})
app.get('/status', function (req, res) {
    res.json(status);
})
app.post('/program', function (req, res) { 
    console.log(req.body)
    status.programName = req.body.name
    status.programTime = Date.now()
    res.json({
        result: "ok",
    });
})
app.get('/data', function (req, res) {
    var data = {
        timer: status.timer,
        programName: status.programName,
        programTime: status.programTime,
    }
    res.json(data);
})
app.listen(port, () => {
    console.log(`app listening on port ${port}`)
})
