const AuthRouter = require('./AuthRouter');
const UserRouter = require('./UserRouter');


const routes = (app) => {
    app.use('/auth', AuthRouter);
    app.use('/users', UserRouter);
}

module.exports = routes;