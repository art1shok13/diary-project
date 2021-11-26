const { Telegraf, session, Scenes: { WizardScene, Stage }, Markup } = require('telegraf')
const {subjects, subjects_markup, amarktypes_markup, bot_token, schedule, week, dateParser, amarmark_markup} = require('./config')

const bot_url = `https://api.telegram.org/bot${bot_token}/`;

const needle = require('needle');
const fs = require('fs')

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
    console.log(ctx.update.callback_query.message)
    ctx.session.aMarkScene = {subject: Number(ctx.update.callback_query.data)}

    await ctx.editMessageText(`Subjects selected (${subjects[Number(ctx.update.callback_query.data)].subject_name})`)
    await ctx.reply('Mark:', Markup.inlineKeyboard(amarmark_markup))

    return ctx.wizard.next()
})

const aMarkMark = Telegraf.on('callback_query', async ctx => {

    ctx.session.aMarkScene.mark = Number(ctx.update.callback_query.data)

    await ctx.editMessageText(`Mark selected (${Number(ctx.update.callback_query.data)})`)
    await ctx.reply('Choose type of work:', Markup.inlineKeyboard(amarktypes_markup))

    return ctx.wizard.next()
})

const aMarkType = Telegraf.on('callback_query', async ctx => {

    ctx.session.aMarkScene.type = Number(ctx.update.callback_query.data)

    await ctx.editMessageText(`Type selected (${amarktypes_markup[Number(ctx.update.callback_query.data)][0].text})`)
    await ctx.reply('Name the work:')

    return ctx.wizard.next()
})

const aMarkName = Telegraf.on('text', async ctx => {

    ctx.session.aMarkScene.name = String(ctx.update.message.text)

    const markup=schedule[ctx.session.aMarkScene.subject].map(
        ()=>{
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

        await ctx.editMessageText(`Date selected (${dateParser(ctx.update.callback_query.data)})`)
        aMarkSql(ctx, ctx.session.aMarkScene)
    }else{
        await ctx.editMessageText(`Write the date like this ${dateParser(new Date())}:`)
        return ctx.wizard.next()
    }

})

const aMarkSpecial = Telegraf.on('text', async ctx => {
    if(new Date(ctx.update.message.text) == 'Invalid Date'){
        ctx.reply(new Date(ctx.update.message.text) + ' Write one more time')
    }else{
        ctx.session.aMarkScene.date = dateParser(ctx.update.message.text)
        aMarkSql(ctx, ctx.session.aMarkScene)
    }   
})

const aMarkSql = async ( ctx, data ) => {
    console.log(data)
    const {subject, mark, date, name, type} = data
    connection.query(`INSERT INTO marks (subject_id, mark, date_from, type, name) VALUES (${subject}, ${mark}, '${dateParser(date)}', ${type}, '${name}');`, async (err, result, fields) => {
        console.log(result)
        await ctx.reply('Mark added')
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

    await ctx.editMessageText(`Subjects selected (${subjects[Number(ctx.update.callback_query.data)].subject_name})`)
    await ctx.reply('Write the task:')

    return ctx.wizard.next()
})

const aTaskTask = Telegraf.on('text', async ctx => {
    ctx.session.aTaskScene.task = String(ctx.update.message.text)
    ctx.reply('Add photo(s)?',Markup.keyboard([[{text:'No photo'}]]).oneTime())
    return ctx.wizard.next()
})

const aTaskImg = Telegraf.on('message', async ctx => {
    const markupf = ()=>{
        const markup=schedule[ctx.session.aTaskScene.subject].map(
            ()=>{
                let row=[]
                for(i=0;i!=4;i++){
                    const date = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + (1-new Date().getDay() +i*7))
                    row.push({text:`${week[date.getDay()]}| ${date.getMonth()+1}-${date.getDate()}`, callback_data:date})
                }
                return row
            }
        )
        markup.push([{text:'Special Date', callback_data:'$'}])
        return markup
    }

    if(ctx.update.message.text == undefined){
        const id = ctx.message.photo[ctx.message.photo.length-1].file_id
        const photo = `${bot_url}getFile?file_id=${id}`
        needle.get(photo, async (err, res, body) => {
            needle.get(`https://api.telegram.org/file/bot${bot_token}/${body.result.file_path}`)
                .pipe(fs.createWriteStream(`../images/${id}.png`))
                .on('done', async (err)=>{
                    ctx.session.aTaskScene.image = String(id)
                    await ctx.reply('Photos added', Markup.removeKeyboard())
                    await ctx.reply('Date:', Markup.inlineKeyboard(markupf()))
                })
        })
    }else{
        ctx.session.aTaskScene.image = 'NULL'
        await ctx.reply('No photos added', Markup.removeKeyboard())
        await ctx.reply('Date:', Markup.inlineKeyboard(markupf()))
    }

    return ctx.wizard.next()
})
const aTaskDate = Telegraf.on('callback_query', async ctx => {
    if(ctx.update.callback_query.data!='$'){
        ctx.session.aTaskScene.date = dateParser(ctx.update.callback_query.data)

        await ctx.editMessageText(`Date selected (${dateParser(ctx.update.callback_query.data)})`)
        aTaskSql(ctx, ctx.session.aTaskScene)
    }else{
        await ctx.editMessageText(`Write the date like this ${dateParser(new Date())}:`)
        return ctx.wizard.next()
    }
})

const aTaskSpecial= Telegraf.on('text', async ctx => {
    if(new Date(ctx.update.message.text) == 'Invalid Date'){
        ctx.reply(new Date(ctx.update.message.text) + ' Write one more time')
    }else{
        ctx.session.aTaskScene.date = dateParser(ctx.update.message.text)
        aTaskSql(ctx, ctx.session.aTaskScene)
    }
})

const aTaskSql = async (ctx,data) => {
    const {subject, task, image, date} = data
    connection.query(`INSERT INTO tasks (subject_id, task, date_from, date_to, image) VALUES (${subject}, '${task}', '${dateParser(new Date())}', '${date}', '${image}');`, async (err, result, fields) => {
        console.log(result)
        await ctx.reply('Task added')
        return ctx.scene.leave()
    })
}

const aTaskScene = new WizardScene('aTaskScene', aTaskSubject, aTaskTask, aTaskImg, aTaskDate, aTaskSpecial)
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