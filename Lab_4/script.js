
const books  = [
    {title: "The Great Gatsby", author: "F. Scott Fitzgerald", price: 10.99, stockQuantity: 5, category: "Fiction"},
    {title: "To Kill a Mockingbird", author: "Harper Lee", price: 12.99, stockQuantity: 3, category: "Fiction"},
    {title: "1984", author: "George Orwell", price: 9.99, stockQuantity: 10, category: "Dystopian"},
    {title: "The Catcher in the Rye", author: "J.D. Salinger", price: 11.99, stockQuantity: 2, category: "Fiction"},
    {title: "Pride and Prejudice", author: "Jane Austen", price: 8.99, stockQuantity: 7, category: "Romance"}
]
const orders = [
    {bookTitle: "The Great Gatsby", quantity: 2},
    {bookTitle: "To Kill a Mockingbird", quantity: 1},
    {bookTitle: "1984", quantity: 3},
    {bookTitle: "The Catcher in the Rye", quantity: 1},
    {bookTitle: "Pride and Prejudice", quantity: 2}
]

function validateOrder(order) {

    const book = books.find(b => b.title === order.bookTitle);

    return book && order.quantity > 0 && order.quantity <= book.stockQuantity
        ? "Order can be fulfilled"
        : "Order cannot be fulfilled";
}
// Test with a valid order
let validOrder = {
    bookTitle: "Clean Code",
    quantity: 2
};

console.log(validateOrder(validOrder));
// Test with a book that does not exist
let invalidOrder = {
    bookTitle: "Harry Potter",
    quantity: 1
};

console.log(validateOrder(invalidOrder));


function processOrders(orders) {

    // Process orders using for of
    for (let order of orders) {

        const book = books.find(b => b.title === order.bookTitle);

        if (book && order.quantity > 0 && order.quantity <= book.stockQuantity) {
            book.stockQuantity -= order.quantity;
            order.status = "fulfilled";
        } else {
            order.status = "rejected";
        }
    }

    const summary = orders.map(order => {
        return {
            order: order,
            status: order.status
        };
    });

    const totalRevenue = orders.reduce((total, order) => {

        if (order.status === "fulfilled") {
            const book = books.find(b => b.title === order.bookTitle);
            return total + book.price * order.quantity;
        }

        return total;

    }, 0);

    return {
        summary: summary,
        totalRevenue: totalRevenue
    };
}


const result = processOrders(orders);

console.log(result.summary);
console.log("Total Revenue: $" + result.totalRevenue);


class Book {

    constructor(title, author, price, stockQuantity, category) {
        this.title = title;
        this.author = author;
        this.price = price;
        this.stockQuantity = stockQuantity;
        this.category = category;
    }

    isLowStock() {
        return this.stockQuantity < 5 ? "Low stock" : "Stock is sufficient";
    }
}

const newBook = new Book(
    "Python Basics",
    "John Doe",
    25,
    4,
    "Programming"
);

console.log(newBook.isLowStock());

function orderConfirmation(book, quantity) {

    const { title, price } = book;

    return `Order confirmed: ${quantity} x ${title} — $${(price * quantity).toFixed(2)} total.`;
}


console.log(orderConfirmation(newBook, 2));

function lowStockReport(books, threshold, category) {

    const result = books
        .filter(book => book.stockQuantity < threshold && book.category === category)
        .sort((a, b) => a.stockQuantity - b.stockQuantity);

    return result;
}

console.log("Programming books with low stock:");
console.log(lowStockReport(books, 5, "Programming"));

console.log("Fiction books with low stock:");
console.log(lowStockReport(books, 8, "Fiction"));