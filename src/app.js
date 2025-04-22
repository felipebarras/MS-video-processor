const express = require('express');
const path = require('path');
const setupSwagger = require('./config/swagger');
const frameRoutes = require('./routes/frame.routes');
const healthCheckRoute = require('./routes/healthCheck.route');

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Swagger UI
setupSwagger(app);

// Rotas
app.use('/frames', frameRoutes);
app.use('/', healthCheckRoute);

module.exports = app;
