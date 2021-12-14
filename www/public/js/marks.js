const months = ['Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень', ]

const dateParser = (date)=>{
    return `${new Date(date).getFullYear()}-${new Date(date).getMonth()+1}-${new Date(date).getDate()}`
}

Array(0,1,2,3,4,8,9,10,11).forEach( (month, i) => {
    const parameter = `
    <li>
        <label>
            ${months[i]}
            <input type="checkbox" data-month="${month}" class="monthP" onclick="updateTable()" checked>
        </label>
    </li>
    `
    document.querySelector('.monthsPlist').innerHTML += parameter
})
var types = []
fetch('/api/mark-types').then(response => response.json())
.then(data => {
    types = data
    data.forEach(type => {
        const parameter = `
        <li>
            <label>
                ${type.name}
                <input type="checkbox" data-type="${type.type}" class="typeP" onclick="updateTable()" checked>
            </label>
        </li>
        `
        document.querySelector('.typesPlist').innerHTML += parameter
    })
})

fetch('/api/subjects').then(response => response.json())
.then((data) => {
    data.forEach(subject => {
        const parameter = `
        <li>
            <label>
                ${subject.subject_name}
                <input type="checkbox" data-subject="${subject.subject_id}" class="subjectsP" onclick="updateTable()" checked>
            </label>
        </li>
        `
        document.querySelector('.subjectsPlist').innerHTML += parameter
    })
    document.querySelector('.subjectsPlist').childNodes[1].childNodes[1].childNodes[1].checked='true'
    updateTable()
})

function updateTable(){
    fetch('/api/subjects').then(response => response.json())
    .then( async subjects =>{

        let subjectP = []
        document.querySelectorAll('.subjectsP').forEach(({dataset: {subject}, checked})=>{
            if(checked){
                subjectP.push(Number(subject))
            }else{
                return
            }
        })

        subjectP = subjectP.length==0 ? subjects.map( ({id}) => id-1) : subjectP
        let monthP = []
        document.querySelectorAll('.monthP').forEach(({dataset: {month}, checked})=>{
            if(checked){
                monthP.push(Number(month))
            }else{
                return
            }
        })
        let typeP = []
        document.querySelectorAll('.typeP').forEach(({dataset: {type}, checked})=>{
            if(checked){
                typeP.push(Number(type))
            }else{
                return
            }
        })
    
        const params = 
            {
                subject_id: subjectP,
                date_from: monthP,
                type: typeP
            }
        console.log({params})
        fetch('/api/marks',{
            method: 'POST',
            body: JSON.stringify({params}),
            headers: {
                'Content-Type': 'application/json',
              }
        })
        .then(response => response.json())
        .then(async data => {
            await data.forEach(async ({id, subject_id, date_from, mark, type, name})=>{
                const task=
                `
                    <tr>
                        <td>${id}</td>
                        <td>${subjects[subject_id].subject_name}</td>
                        <td>${mark}</td>
                        <td>${dateParser(date_from)}</td>
                        <td>${types[type].name}</td>
                        <td>${name}</td>
                    </tr>
                `
                document.querySelector('table').childNodes[1].innerHTML+=task
            })
            console.log(data.reduce((a,b) => a+b.mark, 0))
            document.querySelector('main').innerHTML+=`<p>Avarage: ${(data.reduce((a, b) => a + b.mark, 0)/ data.length).toFixed(1)}</p>`
            console.log(data.map(m => m.mark))
            const ctx = document.getElementById('myChart').getContext('2d')
            let config = {
                type: 'line',
                data: {
                    labels: data.map(m => dateParser(m.date_from)),
                    datasets: [
                        {
                            label: 'Успішність',
                            data: data.map(m => m.mark),
                            fill: false,
                            borderColor: 'rgb(0,0,0)',
                            tension: 0.2
                        }
                    ]
                }
            }
            const myChart = new Chart(ctx, config);
        })
        document.querySelector('table').childNodes[1].innerHTML = ''
    })

}