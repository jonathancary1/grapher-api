import express from 'express';

const app = express();
const port = process.env.PORT;
const host = process.env.HOST;

app.listen(port, host, () => {
  console.log('Running...');
  console.log(`http://${host}:${port}/`);
});
