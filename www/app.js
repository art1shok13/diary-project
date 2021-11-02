const express = require('express')

const app = express()

app.get('/', (req, res)=>{
    res.send('HELLO WORLD!')
})

app.post('/api/marks', (req, res)=>{
    res.send('HELLO WORLD!')
})

const port = 3000
async function init(){
    try {
        app.listen(port, ()=>{
            console.log(`APP LISTENS PORT ${port}`)
        })
    } catch (e) {
        console.log('Error', e.message)
        process.exit(1)
    }
}

init()