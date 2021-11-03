const { Telegraf, session, Scenes: { WizardScene, Stage }, Markup } = require('telegraf')
const {subjects, subjects_markup, amarktypes_markup, bot_token, schedule, week, dateParser} = require('./config')

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
//===========================================================================================================================
const aMarkSubject = Telegraf.on('callback_query', async ctx => {

    ctx.session.aMarkScene = {subject: Number(ctx.update.callback_query.data)}

    await ctx.reply('Mark:')

    return ctx.wizard.next()
})

const aMarkMark = Telegraf.on('text', async ctx => {

    ctx.session.aMarkScene.mark = Number(ctx.update.message.text)

    await ctx.reply('Choose type of work:', Markup.inlineKeyboard(amarktypes_markup))

    return ctx.wizard.next()
})

const aMarkType = Telegraf.on('callback_query', async ctx => {

    ctx.session.aMarkScene.type = Number(ctx.update.callback_query.data)

    await ctx.reply('Name the work:')

    return ctx.wizard.next()
})

const aMarkName = Telegraf.on('text', async ctx => {

    ctx.session.aMarkScene.name = String(ctx.update.message.text)

    const markup=schedule[ctx.session.aMarkScene.subject].map(
        (item)=>{
            let row=[]
            for(i=0;i!=4;i++){
                const date = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() - (1-new Date().getDay() +i*7))
                row.push({text:`${week[date.getDay()]}| ${date.getMonth()+1}-${date.getDate()}`, callback_data:date})
            }
            return row
        }
    )
    markup.push([{text:'Special Date', callback_data:'$'}])

    await ctx.reply('Date:', Markup.inlineKeyboard(markup))
    return ctx.wizard.next()
})

const aMarkDate = Telegraf.on('callback_query', async ctx => {
    if(ctx.update.callback_query.data!='$'){
        ctx.session.aMarkScene.date = dateParser(ctx.update.callback_query.data)
        aMarkSql(ctx, ctx.session.aMarkScene)
    }else{
        await ctx.reply(`Write the date like this ${dateParser(new Date())}:`)
        return ctx.wizard.next()
    }

})

const aMarkSpecial = Telegraf.on('text', async ctx => {
    ctx.session.aMarkScene.date = dateParser(ctx.update.message.text)
    aMarkSql(ctx, ctx.session.aMarkScene)
})

const aMarkSql = async ( ctx, data ) => {
    console.log(data)
    const {subject, mark, date, name, type} = data
    connection.query(`INSERT INTO marks (subject_id, mark, date_from, type, name) VALUES (${subject}, ${mark}, '${dateParser(date)}', ${type}, '${name}');`, async (err, result, fields) => {
        console.log(result)
        await ctx.reply('Task added')
        return ctx.scene.leave()
    })
}

const aMarkScene = new WizardScene('aMarkScene', aMarkSubject, aMarkMark, aMarkType, aMarkName, aMarkDate, aMarkSpecial)
aMarkScene.enter(ctx => {
    ctx.reply('Choose subject:', Markup.inlineKeyboard(subjects_markup))
})
//===========================================================================================================================
//===========================================================================================================================
const aTaskSubject = Telegraf.on('callback_query', async ctx => {
    ctx.session.aTaskScene={subject: Number(ctx.update.callback_query.data)}
    await ctx.reply('Write the task:')
    return ctx.wizard.next()
})

const aTaskTask = Telegraf.on('text', async ctx => {
    ctx.session.aTaskScene.task = String(ctx.update.message.text)

    const markup=schedule[ctx.session.aTaskScene.subject].map(
        (item)=>{
            let row=[]
            for(i=0;i!=4;i++){
                const date = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + (1-new Date().getDay() +i*7))
                row.push({text:`${week[date.getDay()]}| ${date.getMonth()+1}-${date.getDate()}`, callback_data:date})
            }
            return row
        }
    )
    markup.push([{text:'Special Date', callback_data:'$'}])

    await ctx.reply('Date:', Markup.inlineKeyboard(markup))
    return ctx.wizard.next()
})

const aTaskDate = Telegraf.on('callback_query', async ctx => {
    if(ctx.update.callback_query.data!='$'){
        ctx.session.aTaskScene.date = dateParser(ctx.update.callback_query.data)
        aTaskSql(ctx, ctx.session.aTaskScene)
    }else{
        await ctx.reply(`Write the date like this ${dateParser(new Date())}:`)
        return ctx.wizard.next()
    }
})

const aTaskSpecial= Telegraf.on('', async ctx => {
    ctx.session.aTaskScene.date = dateParser(ctx.update.message.text)
    aTaskSql(ctx, ctx.session.aTaskScene)
    return ctx.wizard.next()
})

const aTaskSql = async (ctx,data) => {
    const {subject, task, date} = data
    connection.query(`INSERT INTO tasks (subject_id, task, date_from, date_to) VALUES (${subject}, '${task}', '${dateParser(new Date())}', '${date}');`, async (err, result, fields) => {
        console.log(result)
        await ctx.reply('Task added')
        return ctx.scene.leave()
    })
}

const aTaskScene = new WizardScene('aTaskScene', aTaskSubject, aTaskTask, aTaskDate, aTaskSpecial)
aTaskScene.enter(ctx => {
    ctx.reply('Choose subject:', Markup.inlineKeyboard(subjects_markup))
})



const stage = new Stage([ aMarkScene, aTaskScene])

const bot = new Telegraf(bot_token)
bot.use(session(), stage.middleware())

bot.command('add_mark', ctx => {
    ctx.scene.enter('aMarkScene')
})

bot.command('add_task', ctx => {
    ctx.scene.enter('aTaskScene')
})

bot.launch()
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))