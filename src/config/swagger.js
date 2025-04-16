const swaggerUi = require('swagger-ui-express');
const swaggerDoc = require('../docs/swagger.json');

const setupSwagger = async (app) => app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));

module.exports = setupSwagger;
