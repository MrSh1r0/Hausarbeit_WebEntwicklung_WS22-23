const eventsList = document.querySelector('#events');
const createEventButton = document.querySelector('#create-event-button');
const createEventModal = document.querySelector('#create-event-modal');
const closeCreateEventModalButton = createEventModal.querySelector('.close');
const createEventFormSubmitButton = document.querySelector('#create-event-form-submit');
const createEventErrorMessage = document.querySelector('#create-event-error-message');
const eventDetail = document.querySelector('#event-detail');
const eventDetailName = document.querySelector('#event-detail-name');
const eventDetailDate = document.querySelector('#event-detail-date');
const addGuestButton = document.querySelector('#add-guest-button');
const addGuestModal = document.querySelector('#add-guest-modal');
const closeAddGuestModalButton = addGuestModal.querySelector('.close');
const addGuestFormSubmitButton = document.querySelector('#add-guest-form-submit');
const addGuestErrorMessage = document.querySelector('#add-guest-error-message');
const numTablesInput = document.querySelector('#num-tables-input');
const seatsPerTableInput = document.querySelector('#seats-per-table-input');
const isTwoSidedInput = document.querySelector('#is-two-sided-input');
const createSeatingPlanButton = document.querySelector('#create-seating-plan-button');
const seatingPlanTable = document.querySelector('#seating-plan-table');
let currentEventId;

function renderEvent (event) {
  const li = document.createElement('li');
  const eventLink = document.createElement('a');
  eventLink.href = '#';
  eventLink.textContent = event.name;
  eventLink.addEventListener('click', () => {
    showEventDetail(event);
  });
  li.appendChild(eventLink);
  eventsList.appendChild(li);
}

function renderGuestList (guests) {
  const table = document.querySelector('#guest-list-table');
  table.innerHTML = `
  <tr>
    <th>Name</th>
    <th>Is Child</th>
    <th>Invitation Status</th>
    <th>Action</th>
  </tr>
`;
  for (const guest of guests) {
    const tr = document.createElement('tr');
    const nameTd = document.createElement('td');
    const isChildTd = document.createElement('td');
    const invitationStatusTd = document.createElement('td');
    const actionTd = document.createElement('td');
    const editButton = document.createElement('button');
    const deleteButton = document.createElement('button');

    nameTd.textContent = guest.name;
    isChildTd.textContent = guest.isChild ? 'Yes' : 'No';
    invitationStatusTd.textContent = guest.invitationStatus;
    editButton.textContent = 'Edit';
    editButton.addEventListener('click', () => {
      editGuest(guest);
    });
    deleteButton.textContent = 'Delete';
    deleteButton.addEventListener('click', () => {
      deleteGuest(guest);
    });

    actionTd.appendChild(editButton);
    actionTd.appendChild(deleteButton);

    tr.appendChild(nameTd);
    tr.appendChild(isChildTd);
    tr.appendChild(invitationStatusTd);
    tr.appendChild(actionTd);
    table.appendChild(tr);
  }
}

function renderSeatingPlan (seatingPlan) {
  seatingPlanTable.innerHTML = '';
  for (let i = 0; i < seatingPlan.length; i++) {
    const row = document.createElement('tr');
    for (let j = 0; j < seatingPlan[i].length; j++) {
      const cell = document.createElement('td');
      if (seatingPlan[i][j]) {
        cell.textContent = seatingPlan[i][j].name;
      }
      row.appendChild(cell);
    }
    seatingPlanTable.appendChild(row);
  }
}

function showEventDetail (event) {
  currentEventId = event.id;
  eventDetailName.textContent = event.name;
  eventDetailDate.textContent = event.date;
  renderGuestList(event.guests);
  eventDetail.style.display = 'block';
}

function hideEventDetail () {
  currentEventId = undefined;
  eventDetailName.textContent = '';
  eventDetailDate.textContent = '';
  eventDetail.style.display = '';
}
function createEvent () {
  const name = document.querySelector('#create-event-form [name="name"]').value;
  const date = document.querySelector('#create-event-form [name="date"]').value;

  if (!name) {
    createEventErrorMessage.textContent = 'Please enter event name';
    return;
  }

  if (!date) {
    createEventErrorMessage.textContent = 'Please enter event date';
    return;
  }

  fetch('/events', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name,
      date
    })
  })
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error('Failed to create event');
      }
    })
    .then(event => {
      events.push(event);
      renderEvent(event);
      hideAddEventModal();
    })
    .catch(error => {
      console.error(error);
      createEventErrorMessage.textContent = 'Failed to create event';
    });
}

function deleteEvent () {
  fetch(`/events/${currentEventId}`, {
    method: 'DELETE'
  })
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error('Failed to delete event');
      }
    })
    .then(() => {
      events = events.filter(event => event.id !== currentEventId);
      hideEventDetail();
    })
    .catch(error => {
      console.error(error);
      alert('Failed to delete event');
    });
}

function addGuest () {
  const name = document.querySelector('#add-guest-form [name="name"]').value;
  const isChild = document.querySelector('#add-guest-form [name="is-child"]').checked;

  if (!name) {
    addGuestErrorMessage.textContent = 'Please enter guest name';
    return;
  }

  fetch(`/events/${currentEventId}/guests`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name,
      isChild,
      invitationStatus: 'unknown'
    })
  })
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error('Failed to add guest');
      }
    })
    .then(guest => {
      const event = events.find(event => event.id === currentEventId);
      event.guests.push(guest);
      renderGuestList(event.guests);
      hideAddGuestModal();
    })
    .catch(error => {
      console.error(error);
      addGuestErrorMessage.textContent = 'Failed to add guest';
    });
}

function editGuest (guest) {
  const newName = prompt('Enter new name', guest.name);
  if (newName) {
    fetch(`/events/${currentEventId}/guests/${guest.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: newName
      })
    })
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('Failed to edit guest');
        }
      })
      .then(updatedGuest => {
        const event = events.find(event => event.id === currentEventId);
        const index = event.guests.findIndex(g => g.id === guest.id);
        event.guests[index] = updatedGuest;
        renderGuestList(event.guests);
      })
      .catch(error => {
        console.error(error);
        alert('Failed to edit guest');
      });
  }
}

function deleteGuest (guest) {
  if (confirm(`Are you sure you want to delete guest "${guest.name}"?`)) {
    fetch(`/events/${currentEventId}/guests/${guest.id}`, {
      method: 'DELETE'
    })
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('Failed to delete guest');
        }
      })
      .then(() => {
        const event = events.find(event => event.id === currentEventId);
        event.guests = event.guests.filter(g => g.id !== guest.id);
        renderGuestList(event.guests);
      })
      .catch(error => {
        console.error(error);
        alert('Failed to delete guest');
      });
  }
}

function updateInvitationStatus (guest, invitationStatus) {
  fetch(`/events/${currentEventId}/guests/${guest.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      invitationStatus
    })
  })
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error('Failed to update invitation status');
      }
    })
    .then(updatedGuest => {
      const event = events.find(event => event.id === currentEventId);
      const index = event.guests.findIndex(g => g.id === guest.id);
      event.guests[index] = updatedGuest;
      renderGuestList(event.guests);
    })
    .catch(error => {
      console.error(error);
      alert('Failed to update invitation status');
    });
}

function createTable () {
  const tableCount = document.querySelector('#create-table-form [name="table-count"]').value;
  const seatCount = document.querySelector('#create-table-form [name="seat-count"]').value;
  const isOneSided = document.querySelector('#create-table-form [name="is-one-sided"]').checked;

  if (!tableCount) {
    createTableErrorMessage.textContent = 'Please enter table count';
    return;
  }

  if (!seatCount) {
    createTableErrorMessage.textContent = 'Please enter seat count';
    return;
  }

  fetch(`/events/${currentEventId}/tables`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      tableCount,
      seatCount,
      isOneSided
    })
  })
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error('Failed to create table');
      }
    })
    .then(table => {
      const event = events.find(event => event.id === currentEventId);
      event.tables.push(table);
      renderTableList(event.tables);
      hideCreateTableModal();
    })
    .catch(error => {
      console.error(error);
      createTableErrorMessage.textContent = 'Failed to create table';
    });
}

function editTable (table) {
  const tableCount = prompt('Enter table count', table.tableCount);
  const seatCount = prompt('Enter seat count', table.seatCount);

  if (tableCount && seatCount) {
    fetch(`/events/${currentEventId}/tables/${table.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        tableCount,
        seatCount
      })
    })
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('Failed to edit table');
        }
      });
  }
}
