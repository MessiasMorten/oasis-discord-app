//Dependencies
const { Client } = require('discord.js');
const dotenv = require('dotenv');
const axios = require('axios'); 

// Load config
dotenv.config();

const bot = new Client();
let token = String(process.env.OASIS_BOT_TOKEN);
bot.login(token);

let botobj;
let guildmember;
let json;

//Fetch user and member object of bot
bot.on('ready', () => {
    bot.user.setActivity('Rose @ Binance', ({type: "WATCHING"}));
    const server = String(process.env.OASIS_SERVER_ID);
    startMonitoring(server);
});

bot.on('message', async (msg) => {
    const content = msg.content;
    if (content === "!areWeHappy") {
     msg.channel.send("We are always happy <:BlueOasis:891988028229300275>");
    } else if (content === "!debug") {
        if (json === "") {
            msg.channel.send("Nothing to report, chief");
        } else {
            msg.channel.send(json);
        }
    } else if (content === "!faq") {
        msg.channel.send("This feature has not been implemented. Stay tuned.");
    }
 
 });

function startMonitoring(server_id) {

    bot.users.fetch(String(process.env.OASIS_BOT_ID)).then((user) => {
        botobj = user;
    
        const guild = bot.guilds.cache.get(server_id);
        guildmember = guild.member(botobj);

    }).catch(console.error);

    let currentprice, change, jsondata, newcurrentprice, newchange, newchangestr, newchangeint;

    //Get pricing data
    setInterval(() => {
        try {
            
            require('axios')
            .get("https://api.binance.com/api/v3/ticker/24hr?symbol=ROSEUSDT")
            .then(response => jsondata = response.data) 

            json = jsondata;
            currentprice = jsondata['lastPrice'];
            change = jsondata['priceChangePercent'];
            //Trim price and change strings
            const price = currentprice.split(".");
            
            let p1 = price[0];
            let p2 = price[1];

            p2 = p2.substring(0,5);
            newcurrentprice = p1 + "." + p2;
            newchangestr = change.substring(0,5);
            newchangeint = parseFloat(change);

            //Bot activity change
            let bear = guildmember.guild.roles.cache.find(r => r.name === "botbear");
            let bull = guildmember.guild.roles.cache.find(r => r.name === "botbull");

            //Positive
            if (newchangeint >= 0) {

                bot.user.setActivity(newcurrentprice + " " + newchangestr + "%", { type: '' });
                try {
                    guildmember.roles.add(bull);
                    guildmember.roles.remove(bear);
                } catch {

                }

            
            //Negative    
            } else {

                bot.user.setActivity(newcurrentprice + " " + newchangestr + "%", { type: '' });
                try {
                    guildmember.roles.add(bear);
                    guildmember.roles.remove(bull);
                } catch {
                    
                }

            }

        } catch {
        }



    }, 2000);

}