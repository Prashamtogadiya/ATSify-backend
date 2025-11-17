require("dotenv").config();
import app from './app';
import connectDB from './config/db.config';
const PORT = process.env.PORT || 5000;
import logger from './utils/logger';
connectDB().then(() => {
  app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
  });
});
