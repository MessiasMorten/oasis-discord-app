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

//Fetch user and member object of bot
bot.on('ready', () => {
    bot.user.setActivity('Rose @ Binance', ({type: "WATCHING"}));
    const server = String(process.env.OASIS_SERVER_ID);
    startMonitoring(server);
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
            console.log(change);

            //Bot activity change
            let bear = guildmember.guild.roles.cache.find(r => r.name === "botbear");
            let bull = guildmember.guild.roles.cache.find(r => r.name === "botbull");

            //Positive
            if (newchangeint >= 0) {
                /*
                botname = newcurrentprice + " +" + newchangestr + "%";
                guildmember.setNickname(botname); */
                bot.user.setActivity(newcurrentprice + " " + newchangestr + "%", { type: '' });
                try {
                    guildmember.roles.add(bull);
                    guildmember.roles.remove(bear);
                } catch {

                }

            
            //Negative    
            } else {
                /*
                botname = newcurrentprice + " " + newchangestr + "%";
                guildmember.setNickname(botname);
                */
                bot.user.setActivity(newcurrentprice + " " + newchangestr + "%", { type: '' });
                try {
                    guildmember.roles.add(bear);
                    guildmember.roles.remove(bull);
                } catch {
                    
                }

            }

        } catch {
            console.log(jsondata);
        }



    }, 2000);

}