import 'core-js/stable';
import 'regenerator-runtime/runtime';
import express from 'express';
import mongoose from 'mongoose';
import server from './graphql';

mongoose.connect('mongodb://mongo', {
  useFindAndModify: false,
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const app = express();
const port = process.env.PORT;
const host = process.env.HOST;

server.applyMiddleware({ app });

app.listen(port, host, () => {
  console.log('Running...');
  console.log(`http://${host}:${port}/`);
});
