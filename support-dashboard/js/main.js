import { Ticket } from './ticket.js';
import { validateTicket, filterTickets, getSummary } from './helpers.js';

// ---------- Data (no backend, so tickets live in an array) ----------
let tickets = [
  new Ticket(1, 'Hamna Raza', 'Hostel Wi-Fi drops every evening around 8 pm.', 'High', 'Open'),
  new Ticket(2, 'Daniyal Shah', 'Lab 3 PC will not boot after the power cut.', 'High', 'In Progress'),
  new Ticket(3, 'Mehwish Iqbal', 'Library card shows the wrong expiry date.', 'Low', 'Closed'),
  new Ticket(4, 'Zain Abbas', 'Fee challan for this semester has the wrong amount.', 'Medium', 'In Progress'),
  new Ticket(5, 'Rida Farooq', 'Need a copy of my transcript before Friday.', 'Medium', 'Open'),
  new Ticket(6, 'Ali Hassan', 'Projector in room B-12 flickers during lectures.', 'Low', 'Open')
];
let nextId = 7;
let editingId = null; // null = adding a new ticket, otherwise the id being edited
let filters = { keyword: '', status: 'All', priority: 'All' };

const statusOrder = ['Open', 'In Progress', 'Closed'];
// Message shown when a column has no tickets
const emptyNotes = {
  'Open': 'Nothing waiting here.',
  'In Progress': 'Nothing in progress.',
  'Closed': 'Nothing closed yet.'
};
const priorityColors = { Low: 'badge-low', Medium: 'badge-medium', High: 'badge-high' };

// Show ids like TKT-001
const ticketCode = id => `TKT-${String(id).padStart(3, '0')}`;

// ---------- Page elements ----------
const form = document.getElementById('ticketForm');
const formTitle = document.getElementById('formTitle');
const customerInput = document.getElementById('customer');
const issueInput = document.getElementById('issue');
const submitBtn = document.getElementById('submitBtn');
const resetBtn = document.getElementById('resetBtn');
const messageBox = document.getElementById('formMessage');

const drawer = document.getElementById('drawer');
const overlay = document.getElementById('overlay');
const newBtn = document.getElementById('newBtn');
const closeBtn = document.getElementById('closeBtn');
const toast = document.getElementById('toast');

const searchInput = document.getElementById('searchInput');
const statusChips = document.getElementById('statusChips');
const priorityChips = document.getElementById('priorityChips');
const ticketCount = document.getElementById('ticketCount');

const totalCount = document.getElementById('totalCount');
const openCount = document.getElementById('openCount');
const progressCount = document.getElementById('progressCount');
const closedCount = document.getElementById('closedCount');

// One entry per status column
const columnBoxes = {
  'Open': document.getElementById('openColumn'),
  'In Progress': document.getElementById('progressColumn'),
  'Closed': document.getElementById('closedColumn')
};
const columnBodies = {
  'Open': document.getElementById('openBody'),
  'In Progress': document.getElementById('progressBody'),
  'Closed': document.getElementById('closedBody')
};
const columnCounts = {
  'Open': document.getElementById('openColumnCount'),
  'In Progress': document.getElementById('progressColumnCount'),
  'Closed': document.getElementById('closedColumnCount')
};

// ---------- Small helpers ----------
const makeElement = (tag, className, text = '') => {
  const element = document.createElement(tag);
  element.className = className;
  element.textContent = text;
  return element;
};

const makeButton = (text, className, onClick) => {
  const button = makeElement('button', className, text);
  button.type = 'button';
  button.addEventListener('click', onClick);
  return button;
};

// Small message at the bottom of the screen (disappears after 2.5 seconds)
let toastTimer;
const showToast = text => {
  toast.textContent = text;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2500);
};

// Show a list of error messages inside the drawer (empty list clears the box)
const showMessage = messages => {
  messageBox.textContent = '';
  if (messages.length === 0) return;

  const box = makeElement('div', 'alert alert-danger mb-0');
  for (const message of messages) {
    box.appendChild(makeElement('div', '', message));
  }
  messageBox.appendChild(box);
};

// ---------- Form and drawer ----------
const getFormData = () => ({
  customer: customerInput.value,
  issue: issueInput.value,
  priority: form.elements.priority.value,
  status: form.elements.status.value
});

// Reset Form: clear the fields and restore defaults without reloading the page
const resetForm = () => {
  form.reset();
  form.elements.priority.value = 'Medium';
  form.elements.status.value = 'Open';
  editingId = null;
  formTitle.textContent = 'New Ticket';
  submitBtn.textContent = 'Add Ticket';
  showMessage([]);
};

const openDrawer = () => {
  drawer.classList.add('open');
  overlay.classList.add('show');
  customerInput.focus();
};

const closeDrawer = () => {
  drawer.classList.remove('open');
  overlay.classList.remove('show');
  resetForm();
};

// ---------- Manage tickets ----------
form.addEventListener('submit', event => {
  event.preventDefault(); // stop the page from reloading

  const data = getFormData();
  const errors = validateTicket(data);
  if (errors.length > 0) {
    showMessage(errors);
    return;
  }

  const { customer, issue, priority, status } = data;

  if (editingId === null) {
    // Add: make a new Ticket and copy the array with spread syntax
    const ticket = new Ticket(nextId, customer.trim(), issue.trim(), priority, status);
    nextId++;
    tickets = [...tickets, ticket];
    showToast(`${ticketCode(ticket.id)} is on the board`);
  } else {
    // Edit: find the ticket and update it
    const ticket = tickets.find(t => t.id === editingId);
    ticket.update({ customer: customer.trim(), issue: issue.trim(), priority, status });
    showToast(`${ticketCode(ticket.id)} saved`);
  }

  closeDrawer();
  render();
});

const startEdit = id => {
  const ticket = tickets.find(t => t.id === id);

  customerInput.value = ticket.customer;
  issueInput.value = ticket.issue;
  form.elements.priority.value = ticket.priority;
  form.elements.status.value = ticket.status;

  editingId = id;
  formTitle.textContent = `Edit ${ticketCode(id)}`;
  submitBtn.textContent = 'Update Ticket';
  showMessage([]);
  openDrawer();
};

const deleteTicket = id => {
  const confirmed = confirm(`Delete ${ticketCode(id)}? This cannot be undone.`); // browser interaction
  if (!confirmed) return;

  tickets = tickets.filter(t => t.id !== id);
  if (editingId === id) closeDrawer();
  render();
  showToast(`${ticketCode(id)} removed`);
};

// Move a ticket to the next column (Open -> In Progress -> Closed)
const moveTicket = id => {
  const ticket = tickets.find(t => t.id === id);
  const nextStatus = statusOrder[statusOrder.indexOf(ticket.status) + 1];
  if (nextStatus === undefined) return;

  ticket.status = nextStatus;
  render();
  showToast(`${ticketCode(id)} moved to ${nextStatus}`);
};

// ---------- Display tickets ----------
const createTile = ticket => {
  const tile = makeElement('article', `tile tile-${ticket.priority.toLowerCase()}`);
  tile.appendChild(makeElement('div', 'tile-code', ticketCode(ticket.id)));
  tile.appendChild(makeElement('h3', 'tile-name', ticket.customer));
  tile.appendChild(makeElement('p', 'tile-issue', ticket.issue));

  const footer = makeElement('div', 'tile-footer');
  footer.appendChild(makeElement('span', `badge ${priorityColors[ticket.priority]}`, ticket.priority));

  const actions = makeElement('div', 'tile-actions');
  if (ticket.status !== 'Closed') {
    actions.appendChild(makeButton('Move \u203A', 'link-btn', () => moveTicket(ticket.id)));
  }
  actions.appendChild(makeButton('Edit', 'link-btn', () => startEdit(ticket.id)));
  actions.appendChild(makeButton('Delete', 'link-btn danger', () => deleteTicket(ticket.id)));
  footer.appendChild(actions);

  tile.appendChild(footer);
  return tile;
};

// Redraw the board, the counts and the summary
const render = () => {
  const visibleTickets = filterTickets(tickets, filters);

  // Clear every column, and hide the columns that the status filter removes
  for (const status of statusOrder) {
    columnBodies[status].textContent = '';
    const hidden = filters.status !== 'All' && filters.status !== status;
    columnBoxes[status].classList.toggle('d-none', hidden);
  }

  // Put each ticket in the column that matches its status
  for (const ticket of visibleTickets) {
    columnBodies[ticket.status].appendChild(createTile(ticket));
  }

  // Column counts, and a note for empty columns
  for (const status of statusOrder) {
    const count = visibleTickets.filter(t => t.status === status).length;
    columnCounts[status].textContent = count;
    if (count === 0) {
      columnBodies[status].appendChild(makeElement('p', 'empty-note', emptyNotes[status]));
    }
  }

  ticketCount.textContent = `Showing ${visibleTickets.length} of ${tickets.length} tickets`;

  const { total, open, inProgress, closed } = getSummary(tickets);
  totalCount.textContent = total;
  openCount.textContent = open;
  progressCount.textContent = inProgress;
  closedCount.textContent = closed;
};

// ---------- Search and filter events ----------
const setActiveChip = (group, activeChip) => {
  for (const chip of group.querySelectorAll('button')) {
    chip.classList.toggle('active', chip === activeChip);
  }
};

searchInput.addEventListener('input', () => {
  filters = { ...filters, keyword: searchInput.value.trim() };
  render();
});

statusChips.addEventListener('click', event => {
  const chip = event.target.closest('button');
  if (chip === null) return;
  setActiveChip(statusChips, chip);
  filters = { ...filters, status: chip.dataset.value };
  render();
});

priorityChips.addEventListener('click', event => {
  const chip = event.target.closest('button');
  if (chip === null) return;
  setActiveChip(priorityChips, chip);
  filters = { ...filters, priority: chip.dataset.value };
  render();
});

// ---------- Drawer buttons ----------
newBtn.addEventListener('click', () => {
  resetForm();
  openDrawer();
});
closeBtn.addEventListener('click', closeDrawer);
overlay.addEventListener('click', closeDrawer);
resetBtn.addEventListener('click', resetForm);
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') closeDrawer();
});

// ---------- Start ----------
render();
