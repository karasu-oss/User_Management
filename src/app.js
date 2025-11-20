import express from 'express';
import { config } from 'dotenv';
import { connectDB } from './db/index.js';
import usersRouter from './routes/users.route.js';
import cookieParser from 'cookie-parser';
config();

const PORT = +process.env.PORT;
const app = express();

app.use(express.json());
app.use(cookieParser());
await connectDB();

app.use('/users', usersRouter);

app.use((err, req, res, next) => {
    if (err) {
      return res
        .status(500)
        .json({ message: 'Internal server error', error: err });
    } else {
      next();
    }
  });

app.listen(PORT, console.log(`Server running on port ${PORT}`));
