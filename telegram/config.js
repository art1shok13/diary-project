const bot_token='1752244986:AAF_Url00FI9HywoZXYdJIj8YVTLirq6fkY'

const subjects = [
    {id:0, subject_name:'Алгебра'},
    {id:1, subject_name:'Геометрія'},
    {id:2, subject_name:'Фізика'},
]

const subjects_markup = [
    [{text:'Алгебра',callback_data:'0'}],
    [{text:'Геометрія', callback_data:'1'}],
    [{text:'Фізика', callback_data:'2'}],    
]

const amarktypes_markup = [
    [{text:'Робота на уроці', callback_data:'0'}],
    [{text:'Контрольна робота', callback_data:'1'}],
    [{text:'Домашня робота', callback_data:'2'}],
]


const week = [
    'Нд',
    'Пн',
    'Вт',
    'Ср',
    'Чт',
    'Пт',
    'Сб',
]
const schedule = [
    [1],
    [2, 3],
    [4]
]

const dateParser = (date)=>{
    return `${new Date(date).getDate()}-${new Date(date).getMonth()+1}-${new Date(date).getFullYear()}`
}

module.exports = {bot_token, subjects, subjects_markup, amarktypes_markup, schedule, week, dateParser}