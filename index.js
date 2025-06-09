document.addEventListener('DOMContentLoaded', function() {
  const buttons = document.querySelectorAll('.buttonz .fancy');
  const addButton = Array.from(buttons).find(btn => btn.textContent.trim() === 'Add');
  function getStoredData() {
    return JSON.parse(localStorage.getItem('complainData') || '[]');
  }
  function saveStoredData(dataArr) {
    localStorage.setItem('complainData', JSON.stringify(dataArr));
  }
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
      row.style.cursor = 'pointer';
      row.addEventListener('click', function() {
        Array.from(table.rows).forEach(r => r.classList.remove('selected-row'));
        row.classList.add('selected-row');
        table.setAttribute('data-selected-index', rowIndex);
      });
      table.appendChild(row);
    });
    tableContainer.appendChild(table);
    if (!document.getElementById('selectRowStyle')) {
      const style = document.createElement('style');
      style.id = 'selectRowStyle';
      style.textContent = '.selected-row { background:rgb(255, 130, 130) !important; }';
      document.head.appendChild(style);
    }
  }
  renderTable(getStoredData());
  addButton.addEventListener('click', function(event) {
    event.preventDefault();
    const form = document.querySelector('.sent');
    const inputs = form.querySelectorAll('.input');
    const data = Array.from(inputs).map(input => input.value.trim());
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
      return;
    }
    const stored = getStoredData();
    stored.push(data);
    saveStoredData(stored);
    renderTable(stored);
    inputs.forEach(input => {
      input.value = '';
      input.style.borderColor = 'black';
      input.style.color = 'black';
    });
  });
  const exportBtn = Array.from(buttons).find(btn => btn.textContent.trim().toLowerCase() === 'to excel');
  if (exportBtn) {
    exportBtn.addEventListener('click', function(e) {
      e.preventDefault();
      const table = document.querySelector('.bottom table');
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
  const searchBtn = Array.from(buttons).find(btn => btn.textContent.trim() === 'Search');
  const clearBtn = Array.from(buttons).find(btn => btn.textContent.trim() === 'Clear');
  let lastSearch = null;
  if (searchBtn) {
    searchBtn.addEventListener('click', function(event) {
      event.preventDefault();
      const form = document.querySelector('.sent');
      const inputs = form.querySelectorAll('.input');
      const searchValues = Array.from(inputs).map(input => input.value.trim().toLowerCase());
      const stored = getStoredData();
      if (searchValues.every(val => val === '')) {
        renderTable(stored);
        lastSearch = null;
        return;
      }
      const filtered = stored.filter(row =>
        row.some((cell, i) => searchValues[i] && cell.toLowerCase().includes(searchValues[i]))
      );
      if (filtered.length === 0) {
        const tableContainer = document.querySelector('.bottom');
        tableContainer.innerHTML = '<div style="padding:20px;color:red;font-weight:bold;">Searched result doesn\'t match</div>';
        lastSearch = [];
        return;
      }
      renderTable(filtered);
      lastSearch = filtered;
    });
  }
  if (clearBtn) {
    clearBtn.addEventListener('click', function(event) {
      event.preventDefault();
      const form = document.querySelector('.sent');
      const inputs = form.querySelectorAll('.input');
      inputs.forEach(input => {
        input.value = '';
        input.style.borderColor = 'black';
        input.style.color = 'black';
      });
      const tableContainer = document.querySelector('.bottom');
      tableContainer.innerHTML = '';
      renderTable(getStoredData());
      lastSearch = null;
    });
  }
  const deleteBtn = Array.from(buttons).find(btn => btn.textContent.trim().toLowerCase() === 'delete');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', function(e) {
      e.preventDefault();
      const table = document.querySelector('.bottom table');
      if (!table) return;
      const idx = parseInt(table.getAttribute('data-selected-index'));
      if (!isNaN(idx)) {
        const stored = getStoredData();
        stored.splice(idx, 1);
        saveStoredData(stored);
        renderTable(stored);
      }
    });
  }
});