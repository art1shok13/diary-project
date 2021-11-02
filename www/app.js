const express = require('express')
var app = express()

var bodyParser = require('body-parser')

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

const {api} = require('./api/api.router')

app.use('/api', api)

app.get('/', (req, res)=>{
    res.send('HELLO WORLD!')
})

const port = 5000
async function init(){
    try {
        app.listen(port, ()=>{
            console.log(`APP LISTENS PORT ${port}`)
        })
    } catch (e) {
        console.log('Error:', e.message)
        process.exit(1)
    }
}

init()