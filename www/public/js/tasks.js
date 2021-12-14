
const dateParser = (date)=>{
    return `${new Date(date).getFullYear()}-${new Date(date).getMonth()+1}-${new Date(date).getDate()}`
}

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

const checked = `
<li>
    <label>
        Not made:
        <input type="checkbox" class="madeP" onclick="updateTable()" checked>
    </label>
</li>
`
document.querySelector('.markPlist').innerHTML += checked

const marked = `
<li>
    <label>
        Marked:
        <input type="checkbox" class="markP" onclick="updateTable()">
    </label>
</li>
`
document.querySelector('.madePlist').innerHTML += marked


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
        const markP = document.querySelector('.markP').checked == true ? [...Array(13).keys()] : [null, ...Array(13).keys()]
        const checkedP = document.querySelector('.madeP').checked == true ? [0]:[0,1]
    
        const params = 
            {
                subject_id: subjectP,
                checked: checkedP,
                mark: markP
            }
        
        fetch('/api/tasks',{
            method: 'POST',
            body: JSON.stringify({params}),
            headers: {
                'Content-Type': 'application/json',
              }
        })
        .then(response => response.json())
        .then(async data => {
            await data.forEach(async ({id, task, subject_id, date_from, date_to, mark, checked, image})=>{
                const task1=
                `
                    <tr>
                        <td>${id}</td>
                        <td>${subjects[subject_id].subject_name}</td>
                        <td>${dateParser(date_from)}</td>
                        <td>${dateParser(date_to)}</td>
                        <td>${task}</td>
                        <td><a href=${image==null ? `#`:`/image?img_id=${image}`}>View Image</a></td>
                        <td>${mark==null ? '':mark}</td>
                        <td><input type="checkbox" onclick="checkTask(${id}, this)" ${checked==true ? 'checked':''}></td>
                    </tr>
                `
                document.querySelector('table').childNodes[1].innerHTML+=task1
            })
        })
        document.querySelector('table').childNodes[1].innerHTML = ''
    })

}

function checkTask(id, {checked}){
    fetch('/api/check-task', {
        method: 'POST',
        body: JSON.stringify({id, checked}),
        headers: {
            'Content-Type': 'application/json',
          }
    }).then(response => response.json())
    .then(data => {
        updateTable()
    })
}