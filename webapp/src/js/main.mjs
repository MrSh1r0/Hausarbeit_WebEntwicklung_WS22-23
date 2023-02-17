// Get the table element by id
const table = document.getElementById('data-table');

// Fetch data from /
fetch('/')
  .then(response => response.json()) // Parse response as JSON
  .then(data => {
    // Loop through each item in data.formData array
    for (const item of data.formData) {
      // Create a new table row element
      const row = document.createElement('tr');

      // Create two new table cell elements for name and email fields
      const nameCell = document.createElement('td');
      const emailCell = document.createElement('td');

      // Set their text content to item.name and item.email values
      nameCell.textContent = item.name;
      emailCell.textContent = item.email;

      // Append them to the row element
      row.appendChild(nameCell);
      row.appendChild(emailCell);

      // Append the row element to the table body element
      table.tBodies[0].appendChild(row);
    }
  })
  .catch(error => console.error(error)); // Handle errors
