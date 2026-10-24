// A class that describes one support ticket.
export class Ticket {
  constructor(id, customer, issue, priority, status) {
    this.id = id;
    this.customer = customer;
    this.issue = issue;
    this.priority = priority;
    this.status = status;
  }

  // Update the ticket using destructuring
  update({ customer, issue, priority, status }) {
    this.customer = customer;
    this.issue = issue;
    this.priority = priority;
    this.status = status;
  }

  // True if the issue text contains the keyword (ignores upper/lower case)
  matchesKeyword(keyword) {
    return this.issue.toLowerCase().includes(keyword.toLowerCase());
  }
}
