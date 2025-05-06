const AuthRouter = require('./AuthRouter');
const UserRouter = require('./UserRouter');
const EventRouter = require('./EventRouter');


const routes = (app) => {
    app.use('/auth', AuthRouter);
    app.use('/users', UserRouter);
    app.use('/events', EventRouter);
}

module.exports = routes;