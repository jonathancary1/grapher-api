import express from 'express';

const app = express();
const port = process.env.PORT || 8080;
const host = process.env.HOST || 'localhost';

app.get('/', (req, res) => {
  res.send('/');
});

app.listen(port, host, () => {
  console.log('Running...');
  console.log(`http://${host}:${port}/`);
});
