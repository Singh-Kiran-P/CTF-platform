import express from "express";
const app = express();

app.get('/', (req,res) => {
  res.send('hello from expsdfredss kirassssz');
});

const port = process.env.PORT || 4000;

app.listen(port,() => console.log(`App listening on port ${port}`));
