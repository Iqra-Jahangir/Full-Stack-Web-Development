const validPriorities = ['Low', 'Medium', 'High'];
const validStatuses = ['Open', 'In Progress', 'Closed'];

// Check the form values. Returns an array of error messages (empty = valid).
export const validateTicket = ({ customer, issue, priority, status }) => {
  const errors = [];
  const name = customer.trim();
  const text = issue.trim();

  if (name === '') {
    errors.push('Customer name is required.');
  } else if (name.length < 3 || name.length > 50) {
    errors.push('Customer name must be between 3 and 50 characters.');
  }

  if (text === '') {
    errors.push('Issue description is required.');
  } else if (text.length < 10 || text.length > 300) {
    errors.push('Issue must be between 10 and 300 characters.');
  }

  if (!validPriorities.includes(priority)) {
    errors.push('Please choose a valid priority.');
  }

  if (!validStatuses.includes(status)) {
    errors.push('Please choose a valid status.');
  }

  return errors;
};

// Search by issue keyword, status and priority ("All" means no filter)
export const filterTickets = (tickets, { keyword, status, priority }) =>
  tickets.filter(ticket => {
    const keywordMatch = keyword === '' || ticket.matchesKeyword(keyword);
    const statusMatch = status === 'All' || ticket.status === status;
    const priorityMatch = priority === 'All' || ticket.priority === priority;
    return keywordMatch && statusMatch && priorityMatch;
  });

// Count the total, open, in-progress and closed tickets using a loop
export const getSummary = tickets => {
  const summary = { total: tickets.length, open: 0, inProgress: 0, closed: 0 };

  for (const ticket of tickets) {
    if (ticket.status === 'Open') {
      summary.open++;
    } else if (ticket.status === 'In Progress') {
      summary.inProgress++;
    } else if (ticket.status === 'Closed') {
      summary.closed++;
    }
  }

  return summary;
};
