const ytdl = require('ytdl-core');
const request = require("request");
const async = require('async');
var overlap = [];
var playlist = [];
var initial;
var now_play = {};
sort_str = (arr,request) => {
  let out = [];
  out.push(arr[arr.indexOf(request)]);
  for(i in arr){
    if(arr[i] != arr[arr.indexOf(request)]){
      out.push(arr[i])
    }
  }
  return out;
}

const sleep = (ms) => {
    return new Promise(resolve=>{
        setTimeout(resolve,ms)
    })
}

var list = {};
playMusic = async (link,channel) => {
  if(link.constructor.name == "String"){
    channel.join()
      .then(connection => {
        const dispatcher = connection.play(ytdl(link, { filter: 'audioonly'}));
        now_play[channel.guild.id] = dispatcher;
        dispatcher.setVolume(0.1);
        dispatcher.on('finish', () => {
          //
        });
        console.log(dispatcher);
        //dispatcher.pause();
        //dispatcher.on("end", end => {});
      })
      .catch(console.log);
  }else if (link.constructor.name == "Array"){
    channel.join()
      .then(connection => {
        const dispatcher = connection.play(ytdl(playlist[0], { filter: 'audioonly'}));
        now_play[channel.guild.id] = dispatcher;
        dispatcher.setVolume(0.1);
        dispatcher.on('finish', () => {
          playlist.shift();
          playMusic(playlist[0],channel);
        });
        dispatcher.on('destroyed', () => {
          playlist.shift();
          playMusic(playlist[0],channel);
        });
        console.log(dispatcher);
        //dispatcher.pause();
        //dispatcher.on("end", end => {});
      })
      .catch(console.log);
  }
}

const { Client, Attachment, Message } = require('discord.js');
 
// Create an instance of a Discord client
const client = new Client();
 
 
client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});
 
client.on('message', msg => {
  /*
  if(!overlap.includes(msg.author.username)){
    console.log(msg.author.username+": "+msg.author.avatarURL())
    overlap.push(msg.author.username)
  }
  */
  if(!msg.author.bot){
  if (msg.content.startsWith("!?????? ")) {
    var a = msg.content.substr(4);
    if(a.startsWith("https://")){
      if(a.includes("&list=")){
        //??????&?????????
        var id = a.split("&list=")[1];
        if(a.includes("&")){
          id = id.split("&")[0];
        }
        var options  = { encoding: "utf-8", method: "GET", uri: "https://www.googleapis.com/youtube/v3/playlistItems?key=AIzaSyBJkJ520IYJbqgc7CZzm7K4QQM3Xeu3kME&part=snippet&maxResults=50&playlistId="+id};
        request(options, function(err, res, html) {
          html = JSON.parse(html).items;
          var b = [];
          for(i in html){
            b.push("https://www.youtube.com/watch?v="+html[i].snippet.resourceId.videoId);
          }
          playlist = sort_str(b, "https://www.youtube.com/watch?v="+a.split("v=")[1].split("&")[0]);
          msg.channel.send(playlist.length+"??? ??????");
          playMusic(b,msg.member.voice.channel);
        })
      }else{
        msg.channel.send("??????.");
        playMusic(a,msg.member.voice.channel);
      }
    }else{
      var options  = { encoding: "utf-8", method: "GET", uri: "https://www.googleapis.com/youtube/v3/search?key=AIzaSyBJkJ520IYJbqgc7CZzm7K4QQM3Xeu3kME&part=snippet&order=viewCount&q="+a};
      request(options, function(err, res, html) {
        html = JSON.parse(html).items;
        var count = 0;
        for(i in html){
          if(count >= 5){
            break;
          }
          list[html[i].snippet.title.replace(/amp;/g,"")] = "https://www.youtube.com/watch?v="+html[i]["id"]["videoId"];
          count++;
        }
        msg.channel.send(Object.keys(list).map((e,i)=>(i+1)+"."+e).join("\n"));
      })
    }
  }
  if(!isNaN(msg.content)){
    if(Number(msg.content)<=5&&Number(msg.content)>0){
      if(list!="{}"){
        playMusic(list[Object.keys(list)[Number(msg.content)-1]],msg.member.voice.channel);
        list = {};
      }
    }
  }
  if(msg.content == "!??????"){
    if(now_play[msg.guild.id]!=undefined){
      now_play[msg.guild.id].destroy();
    }
  }

  if (msg.content === '!leave') {
    // Only try to join the sender's voice channel if they are in one themselves
    if (msg.member.voice.channel) {
      msg.member.voice.channel.leave();
      msg.channel.send('???');
    } else {
      msg.channel.send('?????? ???');
    }
  }
  if(msg.content.startsWith("eval ")){
    //msg.channel.send(eval(msg.content.substr(5)));
    eval(msg.content.substr(5))
  }
}
});
 
client.login(process.env.TOKEN);
