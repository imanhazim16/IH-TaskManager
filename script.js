// list of users in the system
const users = 
[
    {name:"Iman Hazim",email:"iman@gmail.com",username:"imanadmin",password:"imanadmin",role:"Admin",image:"image/iman.png"},
    {name:"Amirul Aizad",email:"mirul@gmail.com",username:"amirulaizad",password:"amirulaizad",role:"Student",image:"image/mirul.png"},
    {name:"Rusyaidi Zaim",email:"syidi@gmail.com",username:"syidi",password:"syidi",role:"Student",image:"image/shidi.png"},
    {name:"Zaireeq Emani",email:"zaireeq@gmail.com",username:"zaireeq",password:"zaireeq",role:"Student",image:"image/zaireeq.png"},
    {name:"Diniy Iqbal",email:"iqbal@gmail.com",username:"iqbal",password:"iqbal",role:"Student",image:"image/iqbal.png"},
    {name:"Muhd Fadhil",email:"fadhil@gmail.com",username:"fadhil",password:"fadhil",role:"Student",image:"image/fadhil.png"},
    {name:"Muhd Afiq",email:"afiq@gmail.com",username:"afiq",password:"afiq",role:"Student",image:"image/afiq.png"}
];

// default tasks is used if user has no tasks yet
const defaultTasks =
[
    {id:'01',title:'Assignment IMS560',due_date:'2025-12-02',priority:'Normal',status:'Completed'},
    {id:'02',title:'Assignment IMS566',due_date:'2025-12-15',priority:'High',status:'In Progress'},
    {id:'03',title:'Assignment CTU554',due_date:'2025-12-18',priority:'High',status:'Completed'},
    {id:'04',title:'Assignment TMC451',due_date:'2025-12-20',priority:'Normal',status:'In Progress'},
    {id:'05',title:'Assignment IMS555',due_date:'2025-12-22',priority:'Normal',status:'Not Started'},
    {id:'06',title:'Assignment IMS564',due_date:'2025-12-25',priority:'High',status:'Not Started'},
    {id:'07',title:'Assignment ICM572',due_date:'2025-12-28',priority:'Normal',status:'In Progress'},
    {id:'08',title:'Assignment LCC501',due_date:'2025-12-30',priority:'High',status:'Not Started'}
];

// get current login user from localstorage
function getCurrentUser() 
{
    return localStorage.getItem('loggedInUser') || 'imanhazim';
}

// get tasks for the current user
function getUserTasks() 
{
    const user = getCurrentUser();
    let allTasks = JSON.parse(localStorage.getItem('tasks')) || {};

    // if user has no tasks yet, copy default tasks
    if(!allTasks[user])
    {
        allTasks[user] = JSON.parse(JSON.stringify(defaultTasks));
        localStorage.setItem('tasks', JSON.stringify(allTasks));
    }
    return allTasks[user];
}

// save tasks for current user to localStorage
function saveUserTasks(tasks) 
{
    const user = getCurrentUser();
    let allTasks = JSON.parse(localStorage.getItem('tasks')) || {};
    allTasks[user] = tasks;
    localStorage.setItem('tasks', JSON.stringify(allTasks));
}

// get current users tasks
let currentUserTasks = getUserTasks();

// show logged-in user's name in header
function renderUserName() 
{
    const user = users.find(u => u.username === getCurrentUser());
    const el = document.getElementById('userName');
    if(el && user) el.textContent = user.name;
}

// toast notification
const toastEl = document.getElementById('taskToast');
const bsToast = toastEl ? new bootstrap.Toast(toastEl) : null;


// show a small popup message
function showToast(message, type='success') 
{
    if(!toastEl) return;
    toastEl.className = `toast align-items-center text-bg-${type} border-0`;
    document.getElementById('toastMessage').textContent = message;
    bsToast.show();
}

// render tasks on the page that can filter by type
function renderTasks(filter='all') 
{
    const mainCard = document.getElementById('main-task-card');
    const mainTbody = document.querySelector('#tasks-table tbody');
    const header = document.getElementById('task-header');
    const incompleteSection = document.getElementById('incomplete-tables');
    const inProgressTbody = document.querySelector('#inProgressTable tbody');
    const notStartedTbody = document.querySelector('#notStartedTable tbody');
    const today = new Date().toISOString().split('T')[0];
    const createBox = document.querySelector('.create-task-box');

     // show or hide create task form
    if(createBox) createBox.style.display = (filter==='all') ? 'block' : 'none';

    // show incomplete tasks separately
    if(filter==='incomplete')
    {
        mainCard.style.display='none';
        incompleteSection.style.display='block';
        inProgressTbody.innerHTML='';
        notStartedTbody.innerHTML='';

        currentUserTasks.forEach(t=>
        {
            const tr=document.createElement('tr');
            tr.innerHTML = `<td>${t.id}</td><td>${t.title}</td><td>${t.priority}</td><td>${t.status}</td><td>${t.due_date||'-'}</td>
            <td><button class="btn btn-sm btn-outline-primary" onclick="editTask('${t.id}')">Edit</button>
            <button class="btn btn-sm btn-outline-danger" onclick="deleteTask('${t.id}')">Delete</button></td>`;
            if(t.status==='In Progress') inProgressTbody.appendChild(tr);
            else if(t.status==='Not Started') notStartedTbody.appendChild(tr);
        });
        return;
    } else 
    {
        mainCard.style.display='block';
        incompleteSection.style.display='none';
    }

    // filter tasks for main table
    let data=[...currentUserTasks];
    if(filter==='duetoday') data = data.filter(t=>t.due_date===today);
    else if(filter==='completed') data = data.filter(t=>t.status==='Completed');

    mainTbody.innerHTML='';
    data.forEach(t=>
    {
        const tr=document.createElement('tr');
        tr.innerHTML=`<td>${t.id}</td><td>${t.title}</td><td>${t.priority}</td><td>${t.status}</td><td>${t.due_date||'-'}</td>
        <td><button class="btn btn-sm btn-outline-primary" onclick="editTask('${t.id}')">Edit</button>
        <button class="btn btn-sm btn-outline-danger" onclick="deleteTask('${t.id}')">Delete</button></td>`;
        mainTbody.appendChild(tr);
    });

    // update table header
    if(header)
    {
        if(filter==='all') header.textContent='All Tasks';
        else if(filter==='duetoday') header.textContent='Due Today Tasks';
        else if(filter==='completed') header.textContent='Completed Tasks';
    }
}

// tasks form
const taskForm = document.getElementById('task-form');
if(taskForm)
{
    taskForm.addEventListener('submit', function(e)
    {
        e.preventDefault(); // prevent page reload
        const title = document.getElementById('task-title').value.trim();
        const due = document.getElementById('task-due').value;
        const priority = document.getElementById('task-priority').value;
        const status = document.getElementById('task-status').value;

        if(title==='') return alert('Title required'); // validation

         // add new task
        const id=(currentUserTasks.length+1).toString().padStart(2,'0');
        currentUserTasks.push({id,title,due_date:due,priority,status});
        saveUserTasks(currentUserTasks);
        renderTasks();
        showToast('Task successfully created!');
        this.reset();
    });
}

// edit and delete tasks
function deleteTask(id)
{
    if(confirm('Delete this task?'))
    {
        const index=currentUserTasks.findIndex(t=>t.id===id);
        if(index>-1) currentUserTasks.splice(index,1);
        saveUserTasks(currentUserTasks);
        renderTasks();
        showToast('Task successfully deleted!', 'danger');
    }
}

function editTask(id)
{
    const t=currentUserTasks.find(t=>t.id===id);
    if(!t) return;

    
    // fill form with existing values
    document.getElementById('task-title').value=t.title;
    document.getElementById('task-due').value=t.due_date;
    document.getElementById('task-priority').value=t.priority;
    document.getElementById('task-status').value=t.status;

    // override form submit to update task
    taskForm.querySelector('button').textContent='Update Task';
    taskForm.onsubmit=function(e)
    {
        e.preventDefault();
        t.title=document.getElementById('task-title').value;
        t.due_date=document.getElementById('task-due').value;
        t.priority=document.getElementById('task-priority').value;
        t.status=document.getElementById('task-status').value;
        saveUserTasks(currentUserTasks);
        renderTasks();
        showToast('Task successfully updated!', 'info');
        this.reset();
        taskForm.querySelector('button').textContent='Add Task';
        this.onsubmit=arguments.callee;
    }
}

// helper function
function filterTasks(type){ renderTasks(type); }  // called from sidebar
function toggleDropdown(e){ e.preventDefault(); e.currentTarget.parentElement.classList.toggle('show'); }
function logout(){ localStorage.removeItem('loggedInUser'); window.location.href='index.html'; }

// render user page
function renderUsers(){
    const tbody = document.querySelector('#users-table tbody');
    if(!tbody) return;
    tbody.innerHTML = '';
    users.forEach(u=>
    {
    const tr = document.createElement('tr');
    tr.innerHTML = `
    <td><img src="${u.image}" class="user-img"></td>
    <td>${u.name}</td>
    <td>${u.email}</td>
    <td>${u.username}</td>
    <td>${u.password}</td>
    <td>${u.role}</td>
`;
tbody.appendChild(tr);

    });
}

// setup page load
document.addEventListener('DOMContentLoaded', ()=>{
    renderUserName();
    renderTasks();
    renderUsers();
});
