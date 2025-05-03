const AuthRouter = require('./AuthRouter');

const routes = (app) => {
    app.use('/auth', AuthRouter);
}

module.exports = routes;