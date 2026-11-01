const app = require('./app');
const connectDB = require('./config/database');
const env = require('./config/env');

const PORT = env.PORT;

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer().catch((error) => {
  console.error(`Error: ${error.message}`);
  process.exit(1);
});
