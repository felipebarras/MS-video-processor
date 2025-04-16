require('dotenv').config();
const app = require('./src/app');
const { connectToDatabase } = require('./src/config/database');

const PORT = process.env.PORT || 3000;

(async () => {
  try {
    await connectToDatabase();

    app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));
  } catch (err) {
    console.error(`❌ Erro ao iniciar o servidor: ${err}`);

    process.exit(1);
  }
})();
