const AuthRouter = require('./AuthRouter');
const UserRouter = require('./UserRouter');
const EventRouter = require('./EventRouter');
const CategoryRouter = require('./CategoryRouter');


const routes = (app) => {
    app.use('/auth', AuthRouter);
    app.use('/users', UserRouter);
    app.use('/events', EventRouter);
    app.use('/categories', CategoryRouter);
}

module.exports = routes;