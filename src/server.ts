require("dotenv").config();
import app from './app';
import connectDB from './config/db.config';
const PORT = process.env.PORT || 3000;
import logger from './utils/logger';

// Connect to the database and then start the server
connectDB().then(() => {
  app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
  });
});
