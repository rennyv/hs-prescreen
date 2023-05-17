const express = require('express');
const bodyParser = require('body-parser');

const {Client, GatewayIntentBits, Events} = require("discord.js");
const config = require("./config.json");
const client = new Client({intents: [ 
                            GatewayIntentBits.Guilds,
                            GatewayIntentBits.GuildMessages,
                            GatewayIntentBits.GuildMessageReactions
                          ]});
console.log("Logging in Wol");
client.login(config.BOT_TOKEN);

const app = express();
const port = 3000;

const validMessages = {}
const approvedEmoji = '✅';
const rejectEmoji = '❌';

app.use(bodyParser.urlencoded({extended: false }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Hello from prescreener');
});

// We'll call it 'reaction' for short, but it is actually a 'MessageReaction' object
client.on(Events.MessageReactionAdd, (reaction, user) => {
  // need to create a list of valid messages
  let message = reaction.message, emoji = reaction.emoji;
  if(message.id in validMessages){
    switch(emoji.name) {
      case approvedEmoji:
            approveMessage(validMessages[message.id])
            delete validMessages[message.id]
            break;
      case rejectEmoji:
        rejectMessage(validMessages[message.id], "")
        delete validMessages[message.id]
        break;
      default:
        console.log(emoji)
    }
  }
});

client.on(Events.MessageCreate, (message) => {
        if(message.reference){
          message.fetchReference().then((m)=> {
            if(m.id in validMessages){
              rejectMessage(validMessages[m.id], message.content)
              delete validMessages[m.id]
              m.react(rejectEmoji);
              }
          });
        }



});

function rejectMessage(message, reason){
  console.log(`Rejected: ${reason}`, message)
}

function approveMessage(message){
  console.log(`Approved: ${reason}`, message)
}

app.post('/webhooks/messageHandler', (req, res) => {
  const body = req.body;
  let channel = client.channels.cache.get('1107786246564102304');
  if(body.constructor === Array){
    for(let e of body){
      switch(e.type) {
        case 'com.hootsuite.ping.event.v1':
          channel.send("Ping? Pong!");
          break;
        case 'com.hootsuite.messages.event.v1':
          let {state, organization, message} = e.data;
          channel.send(`message event! ${organization.id}-${state}-${message.id}`).then((result) => {
            validMessages[result.id] = e.data;
          });
          break;
        default:
          console.log(`Unknown type: ${e.type}`)
      }

    }
  }
  res.send()
})

app.listen(port, () => console.log(`Prescreen app listening on port ${port}`))

