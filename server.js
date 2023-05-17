const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({extended: false }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Hello from prescreener');
});

app.post('/webhooks/messageHandler', (req, res) => {
  const body = req.body;

  if(body.constructor === Array){
    for(let e of body){
      if(e.type === `com.hootsuite.ping.event.v1`){
        console.log(`Pong`)
      } else {
        console.log(`Unknown type: ${e.type}`)
        console.log(e.data)
      }
    }
  }

  

  res.send()
})

app.listen(port, () => console.log(`Prescreen app listening on port ${port}`))

