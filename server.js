const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const fs = require('fs');
const videoRoutes = require('./src/routes/video.routes');

require('dotenv').config();
const app = express();

const swaggerDocument = JSON.parse(fs.readFileSync('swagger.json', 'utf-8'));

// Middlewares
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// Rota documentação do swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use('/video', videoRoutes);

app.get('/', (req, res) => res.send('Bem-vindo à API de processamento de vídeos!'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}/api-docs/`));
