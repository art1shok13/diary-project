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
    return `${new Date(date).getFullYear()}-${new Date(date).getMonth()+1}-${new Date(date).getDate()}`
}

const amarmark_markup = [
    [
        {text:'12', callback_data:'12'},
        {text:'11', callback_data:'11'},
        {text:'10', callback_data:'10'}
    ],
    [
        {text:'9', callback_data:'9'},
        {text:'8', callback_data:'8'},
        {text:'7', callback_data:'7'}
    ],
    [
        {text:'6', callback_data:'6'},
        {text:'5', callback_data:'5'},
        {text:'4', callback_data:'4'}
    ],
    [
        {text:'3', callback_data:'3'},
        {text:'2', callback_data:'2'},
        {text:'1', callback_data:'1'}
    ],
    [{text:'13', callback_data:'13'}]
]

module.exports = {bot_token, subjects, subjects_markup, amarktypes_markup, schedule, week, dateParser, amarmark_markup}