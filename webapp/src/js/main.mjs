const form = document.getElementById('input-form');
const table = document.getElementById('data-table');

async function submitData (event) {
  event.preventDefault();
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const response = await fetch('/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}`
  });
  if (response.ok) {
    console.log('Data saved');
    fetchData();
    form.reset();
  } else {
    console.error(`Error saving data: ${response.status} ${response.statusText}`);
  }
}

async function fetchData () {
  const response = await fetch('/data');
  if (response.ok) {
    const data = await response.json();
    table.innerHTML = `
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
        </tr>
      </thead>
      <tbody>
        ${data.map(item => `
          <tr>
            <td>${item.name}</td>
            <td>${item.email}</td>
          </tr>
        `).join('')}
      </tbody>
    `;
  } else {
    console.error(`Error fetching data: ${response.status} ${response.statusText}`);
  }
}

form.addEventListener('submit', submitData);

fetchData();
