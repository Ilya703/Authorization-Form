const form = document.querySelector('.form');
const tableContainer = document.querySelector('.table__container');
const formButton = document.querySelector('.form_button');
const okResult = document.querySelector('.ok_result');
const okButton = document.querySelector('.ok_result button');
const errorResult = document.querySelector('.error_result');
const errorButton = document.querySelector('.error_result button');

let token = '';
const project_id = 2;
const workspace_id = 2;
const intent = 'ws_user';
const fields = {};

let page = 0;
let isButtonHere = false;
let tableButton;

const getFields = async () => {
    let response = await fetch(`https://demoadmin.officescheme.ru/project/${workspace_id}/${project_id}/API?action=extend_runtime_lister&intent=${intent}`, {
        method: 'POST',
        headers: {
            'x-ws-common-auth': token
        }
    });

    let result = await response.json();
    result['runtime_fields'].map((runtimeField) => fields[runtimeField.label] = runtimeField.uid);
}

const getUsers = async () => {
    const formData = new FormData();
    formData.append('perpage', 10);
    formData.append('page', page);

    let response = await fetch(`https://demoadmin.officescheme.ru/project/${workspace_id}/${project_id}/API?action=user_list`, {
        method: 'POST',
        headers: {
            'x-ws-common-auth': token
        },
        body: formData
    });

    let result = await response.json();
    return result;
}

const showUsers = (users) => {
    const headers = ['display', ...Object.keys(fields)];
    const rows = ['display', ...Object.values(fields)];

    const table = document.createElement('table');
    table.style.border = '1;'

    const tableHead = document.createElement('thead');
    const trHead = document.createElement('tr');
    headers.forEach((item) => {
        const th = document.createElement('th');
        th.appendChild(document.createTextNode(item));
        trHead.appendChild(th);
    })
    
    tableHead.appendChild(trHead);
    table.appendChild(tableHead);

    const tableBody = document.createElement('tbody');
    
    users.forEach((user) => {
        const tr = document.createElement('tr');

        rows.forEach((row) => {
            let th = document.createElement('th');
            th.appendChild(document.createTextNode(user[row]));

            tr.appendChild(th);
        });

        tableBody.appendChild(tr);
    });

    table.appendChild(tableBody);
    tableContainer.appendChild(table);

    if (!isButtonHere) {
        tableButton = document.createElement('button');
        tableButton.classList.add('table_button');
        tableButton.appendChild(document.createTextNode('Next'));

        isButtonHere = true;
    }

    tableButton.addEventListener('click', async () => {
        page++;
        const currTable = document.querySelector('table');

        if (page >= 1) {
            const currTableButton = document.querySelector('.table_button');
            currTableButton.classList.add('hide');
        }

        if (page <= 1) {
            currTable.remove();
            const result = await getUsers();
            showUsers(result.items);
        }
    });

    tableContainer.appendChild(tableButton);
}

form.addEventListener('submit', async (event) => {
    event.preventDefault();
    
    let response = await fetch('https://demoadmin.officescheme.ru/App/Auth/API?action=auth', {
        method: 'POST',
        body: new FormData(form)
    });

    let result = await response.json();

    form.reset();
    formButton.disabled = true;

    if (result.status === 'ok') {
        okResult.classList.remove('hide');
        token = result.ws_auth.wst;
    } else {
        errorResult.classList.remove('hide');
        errorButton.addEventListener('click', () => location.reload ());
    }
});

okButton.addEventListener('click', async () => {
    await getFields();
    const result = await getUsers();

    form.classList.add('hide');
    okResult.classList.add('hide');

    showUsers(result.items);
});

