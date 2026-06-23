require('dotenv').config();

const app = require('./app');
const { connectDB, getDbConfig } = require('./src/config/db');

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectDB();
  } catch (error) {
    const dbConfig = getDbConfig();
    console.error('Cannot connect to MySQL:', error.message);
    console.error(
      `Check backend/.env DB_USER and DB_PASSWORD for ${dbConfig.user}@${dbConfig.host}:${dbConfig.port}/${dbConfig.database}.`,
    );
  }

  app.listen(PORT, () => {
    console.log(`Backend running at http://localhost:${PORT}`);
  });
}

startServer();
