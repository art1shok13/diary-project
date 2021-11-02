const express = require('express')
var api = express.Router()

const mysql = require("mysql2")
  
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  database: "diary_db"
})

connection.connect(function(err){
    if (err) {
      return console.error("Error: " + err.message)
    }
    else{
      console.log("SQL connection READY")
    }
 })

// /api/subjects
api.get('/subjects', (req, res)=>{
    connection.query(`SELECT * FROM subjects`, (err, result, fields)=>{
        res.send(result)
    })
})

api.get('/mark-types', (req, res)=>{
    connection.query(`SELECT * FROM types`, (err, result, fields)=>{
        res.send(result)
    })
}) 

// /api/marks
api.post('/marks', (req, res)=>{
    req.body.params = JSON.parse(req.body.params)
    connection.query(`SELECT * FROM marks`, async (err, result, fields)=>{
        let filtered=result
        await filtered.map((item)=>{
            item.date_from=new Date(item.date_from).getMonth()
            return item
        })
        await Object.entries(req.body.params).forEach(([param_id])=>{
            filtered = filtered.filter( (item) => {
                for(parameter of req.body.params[param_id]){
                    if(item[param_id]==parameter){
                        return true
                    }
                }
                return false  
            })
        })
        res.status(200).send(filtered)
    })
})

// /api/tasks
api.post('/tasks', (req, res)=>{
    req.body.params = JSON.parse(req.body.params)
    connection.query('SELECT * FROM `tasks` ORDER BY `tasks`.`date_to` DESC', async (err, result, fields)=>{
        let filtered=result
        await Object.entries(req.body.params).forEach(([param_id])=>{
            filtered = filtered.filter( (item) => {
                for(parameter of req.body.params[param_id]){
                    if(item[param_id]==parameter){
                        return true
                    }
                }
                return false  
            })
        })
        await filtered.map((item)=>{
            if(new Date().getTime()>=new Date(item.date_to).getTime()){ 
                item.fired=true
                return item
            }else{
                return item
            }
        })
        res.status(200).send(filtered)
    })
})

module.exports = {api}