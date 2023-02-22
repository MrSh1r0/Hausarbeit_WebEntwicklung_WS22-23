const eventForm = document.getElementById('eventForm');
// const eventSearch = document.getElementById('eventSearch');

const guestForm = document.getElementById('guestForm');
const tableForm = document.getElementById('tableForm');
// const tbody = document.querySelector('tbody');

// const status = document.getElementById('status');

const contentJSON = 'application/json';

eventForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const eventName = eventForm.elements.eventName.value;
  const eventDateTime = eventForm.elements.eventDateTime.value;

  try {
    const response = await fetch('/event', {
      method: 'POST',
      headers: {
        'Content-Type': contentJSON
      },
      body: JSON.stringify({ eventName, eventDateTime })
    });

    if (response.ok) {
      // status.textContent = 'Form submitted successfully';
      eventForm.reset();
    } else {
      // status.textContent = 'An error occurred. Please try again later.';
    }
  } catch (error) {
    console.error(error);
    // status.textContent = 'An error occurred. Please try again later.';
  }
});

guestForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const guestName = guestForm.elements.guestName.value;
  const isChild = guestForm.elements.isChild.value;
  const invitaionStatus = guestForm.elements.invitaionStatus.value;

  try {
    const response = await fetch('/events/:id/guests', {
      method: 'POST',
      headers: {
        'Content-Type': contentJSON
      },
      body: JSON.stringify({ guestName, isChild, invitaionStatus })
    });

    if (response.ok) {
      // status.textContent = 'Form submitted successfully';
      guestForm.reset();
    } else {
      // status.textContent = 'An error occurred. Please try again later.';
    }
  } catch (error) {
    console.error(error);
    // status.textContent = 'An error occurred. Please try again later.';
  }
});

tableForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const tableNumber = tableForm.elements.tableNumber.value;
  const seatsPerTable = tableForm.elements.seatsPerTable.value;
  const isTwoSided = tableForm.elements.isTwoSided.value;

  try {
    const response = await fetch('/event/:id/seat', {
      method: 'POST',
      headers: {
        'Content-Type': contentJSON
      },
      body: JSON.stringify({ tableNumber, seatsPerTable, isTwoSided })
    });

    if (response.ok) {
      // status.textContent = 'Form submitted successfully';
      tableForm.reset();
    } else {
      // status.textContent = 'An error occurred. Please try again later.';
    }
  } catch (error) {
    console.error(error);
    // status.textContent = 'An error occurred. Please try again later.';
  }
});

// getGuestList();

/* function getGuestList() {
  fetch('/event/:id/guests')
    .then(response => response.json())
    .then(guestForms => {
      tbody.innerHTML = '';

      guestForms.forEach(guestForm => {
        const tr = document.createElement('tr');

        const nameTd = document.createElement('td');
        nameTd.innerText = guestForm.name;
        tr.appendChild(nameTd);

        const isChildTd = document.createElement('td');
        isChildTd.innerText = guestForm.isChild;
        tr.appendChild(isChildTd);

        const invitationStatusdTd = document.createElement('td');
        invitationStatusdTd.innerText = guestForm.isChild;
        tr.appendChild(invitationStatusdTd);

        const editGuestTd = document.createElement('td');
        const editGuestButton = document.createElement('button');
        editGuestButton.innerText = 'Edit';
        editGuestButton.addEventListener('click', () => {
          const newGuestName = prompt('Enter new name', guestForm.guestName);
          const newIsChild = prompt('Enter Is Child', guestForm.isChild);
          const newInvitationStatus = prompt('Enter Invitation Status', guestForm.invitationStatus);

          fetch(`/event/${eventForm.id}/guest/${guestForm.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              name: newGuestName,
              isChild: newIsChild,
              invitationStatus: newInvitationStatus
            })
          })
            .then(() => getGuestList())
            .catch(error => console.error(error));
        });
        editGuestTd.appendChild(editGuestButton);
        tr.appendChild(editGuestTd);

        const deleteGuestTd = document.createElement('td');
        const deleteGuestButton = document.createElement('button');
        deleteGuestButton.innerText = 'Delete';
        deleteGuestButton.addEventListener('click', () => {
          if (confirm('Are you sure you want to delete this guest?')) {
            fetch(`/event/${eventForm.id}/guest/${guestForm.id}`, {
              method: 'DELETE',
            })
              .then(() => getGuestList())
              .catch(error => console.error(error));
          }
        });
        deleteGuestTd.appendChild(deleteGuestButton);
        tr.appendChild(deleteGuestTd);

        tbody.appendChild(tr);
      });
    })
    .catch(error => console.error(error));
} */
