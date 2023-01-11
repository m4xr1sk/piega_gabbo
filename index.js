const express = require('express')
var bodyParser = require('body-parser')

const app = express()
const port = 3000

app.use(express.static('public'));
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 

console.log("prova")

var status = {
    timer: 0,
    counter: 123,
    running: true,
    runTime: 10,
    programName: "",
    programTime: 0,
    configFileName: "xxx",
}

setInterval(() => {
    status.timer++
}, 100)

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
    console.log(`Example app listening on port ${port}`)
})
