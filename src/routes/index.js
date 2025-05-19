const AuthRouter = require('./AuthRouter');
const UserRouter = require('./UserRouter');
const EventRouter = require('./EventRouter');
const CategoryRouter = require('./CategoryRouter');
const TicketRouter = require('./TicketRouter');
const PaymentRouter = require('./PaymentRouter');


const routes = (app) => {
    app.use('/auth', AuthRouter);
    app.use('/users', UserRouter);
    app.use('/events', EventRouter);
    app.use('/categories', CategoryRouter);
    app.use('/tickets', TicketRouter);
    app.use('/payments', PaymentRouter);
}

module.exports = routes;