const express = require('express')
var app = express()
const bodyParser = require('body-parser')

app.set('view engine', 'pug')
app.set('views', './views')
app.use(express.static('public'))

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

const {api} = require('./api/api.router')

app.use('/api', api)

app.get('/', (req, res)=>{
    res.render('index', {})
})

app.get('/tasks', (req, res)=>{
    res.render('tasks', {})
})

app.get('/marks', (req, res)=>{
    res.render('marks', {})
})

app.get('/image', (req, res)=>{
    res.render('image', {img_id:req.query.img_id})
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