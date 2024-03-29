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

    connection.query('SELECT * FROM marks ORDER BY `marks`.`date_from` ASC', async (err, result, fields)=>{
        let filtered = result

        await Object.entries(req.body.params).forEach(([param_id])=>{
            filtered = filtered.filter( (item) => {
                for(parameter of req.body.params[param_id]){ 
                    if(param_id!='date_from'){
                        if(item[param_id]==parameter){
                            return true
                        }
                    }else{
                        if(new Date(item[param_id]).getMonth()==parameter){
                            return true
                        }
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

api.post('/check-task', (req,res) => {
    connection.query(`UPDATE tasks SET checked = ${Number(req.body.checked)} WHERE id = ${req.body.id};`, async (err, result, fields)=>{
        res.send(result)
    })
})

module.exports = {api}