const form = document.getElementById('form');
const status = document.getElementById('status');

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const name = form.elements.name.value;
  const email = form.elements.email.value;
  const message = form.elements.message.value;

  fetch('/submit-form', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ name, email, message })
  })
    .then(response => {
      if (response.ok) {
        status.textContent = 'Form submitted successfully';
        form.reset();
      } else {
        status.textContent = 'An error occurred. Please try again later.';
      }
    })
    .catch(error => {
      console.error(error);
      status.textContent = 'An error occurred. Please try again later.';
    });
});
