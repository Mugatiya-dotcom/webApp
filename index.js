document.addEventListener('DOMContentLoaded', function() {
  // Select all buttons with class 'fancy' inside .buttonz
  const buttons = document.querySelectorAll('.buttonz .fancy');
  // Find the 'Add' button by its text
  const addButton = Array.from(buttons).find(btn => btn.textContent.trim() === 'Add');

  // Helper: get data from localStorage
  function getStoredData() {
    return JSON.parse(localStorage.getItem('complainData') || '[]');
  }
  // Helper: save data to localStorage
  function saveStoredData(dataArr) {
    localStorage.setItem('complainData', JSON.stringify(dataArr));
  }
  // Helper: render table from data array
  function renderTable(dataArr) {
    const tableContainer = document.querySelector('.bottom');
    let table = tableContainer.querySelector('table');
    if (table) table.remove();
    if (!dataArr.length) return;
    table = document.createElement('table');
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    const headerRow = document.createElement('tr');
    const headers = [
      'Account No.',
      'Complainer Name',
      'Telephone No.',
      'Category',
      'Date of Acceptance',
      'Date of Inspection',
      'Date of Submit'
    ];
    headers.forEach(text => {
      const th = document.createElement('th');
      th.textContent = text;
      th.style.border = '1px solid black';
      th.style.background = '#e8e8e8';
      th.style.padding = '8px';
      headerRow.appendChild(th);
    });
    table.appendChild(headerRow);
    dataArr.forEach((rowData, rowIndex) => {
      const row = document.createElement('tr');
      rowData.forEach(value => {
        const td = document.createElement('td');
        td.textContent = value;
        td.style.border = '1px solid black';
        td.style.padding = '8px';
        row.appendChild(td);
      });
      // Make row selectable
      row.style.cursor = 'pointer';
      row.addEventListener('click', function() {
        Array.from(table.rows).forEach(r => r.classList.remove('selected-row'));
        row.classList.add('selected-row');
        // Store selected row index (excluding header)
        table.setAttribute('data-selected-index', rowIndex);
      });
      table.appendChild(row);
    });
    tableContainer.appendChild(table);
    // Add style for selected row
    if (!document.getElementById('selectRowStyle')) {
      const style = document.createElement('style');
      style.id = 'selectRowStyle';
      style.textContent = '.selected-row { background: #ffe082 !important; }';
      document.head.appendChild(style);
    }
    // Add Delete button if not present
    let delBtn = document.getElementById('deleteRowBtn');
    if (!delBtn) {
      delBtn = document.createElement('a');
      delBtn.id = 'deleteRowBtn';
      delBtn.className = 'fancy';
      delBtn.href = '#';
      delBtn.innerHTML = `
        <span class="top-key"></span>
        <span class="text">Delete Selected</span>
        <span class="bottom-key-1"></span>
        <span class="bottom-key-2"></span>
      `;
      delBtn.style.marginRight = '10px';
      tableContainer.insertBefore(delBtn, tableContainer.firstChild);
      delBtn.addEventListener('click', function(e) {
        e.preventDefault();
        const table = tableContainer.querySelector('table');
        const idx = parseInt(table.getAttribute('data-selected-index'));
        if (!isNaN(idx)) {
          const stored = getStoredData();
          stored.splice(idx, 1);
          saveStoredData(stored);
          renderTable(stored);
        }
      });
    }
  }

  // On page load, render table from localStorage
  renderTable(getStoredData());

  addButton.addEventListener('click', function(event) {
    event.preventDefault(); // Prevent form submission
    // Select all input fields inside the form
    const form = document.querySelector('.sent');
    const inputs = form.querySelectorAll('.input');
    // Collect values
    const data = Array.from(inputs).map(input => input.value.trim());
    // Check for empty fields
    let hasEmpty = false;
    inputs.forEach(input => {
      if (input.value.trim() === '') {
        input.style.borderColor = 'red';
        input.style.color = 'red';
        hasEmpty = true;
      } else {
        input.style.borderColor = 'black';
        input.style.color = 'black';
      }
    });
    if (hasEmpty) {
      // Remove alert, just highlight fields
      return;
    }
    // Save to localStorage
    const stored = getStoredData();
    stored.push(data);
    saveStoredData(stored);
    renderTable(stored);
    // Clear input fields after adding
    inputs.forEach(input => {
      input.value = '';
      input.style.borderColor = 'black';
      input.style.color = 'black';
    });
  });

  // Add export to Excel functionality
  // Create and add the export button if not already present
  let exportBtn = document.getElementById('exportExcelBtn');
  if (!exportBtn) {
    // Create a button styled like the fancy buttons
    exportBtn = document.createElement('a');
    exportBtn.id = 'exportExcelBtn';
    exportBtn.className = 'fancy';
    exportBtn.href = '#';
    exportBtn.innerHTML = `
      <span class="top-key"></span>
      <span class="text">to Excel</span>
      <span class="bottom-key-1"></span>
      <span class="bottom-key-2"></span>
    `;
    const tableContainer = document.querySelector('.bottom');
    tableContainer.insertBefore(exportBtn, tableContainer.firstChild);
    exportBtn.addEventListener('click', function(e) {
      e.preventDefault();
      const table = tableContainer.querySelector('table');
      if (!table) return;
      let csv = '';
      for (let row of table.rows) {
        let rowData = [];
        for (let cell of row.cells) {
          let text = cell.textContent.replace(/"/g, '""');
          rowData.push('"' + text + '"');
        }
        csv += rowData.join(',') + '\n';
      }
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'complain_data.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  }
});