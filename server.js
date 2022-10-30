const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const fs = require('fs');
 

const io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:3000/",
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true
  }
});
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/pages/index.html');
});

app.get('/ebra', (req, res) => {
  res.send('<h1>sdfdsfdsfsdfdsfdsf</h1>');
});

var k=0;
var arr=[]

io.on('connection', (socket) => {
  k++;
  console.log({"id":socket.id, "count":k, "is":true})
  //push conected user
  arr.push({"id":socket.id, "count":k, "is":true})

  //send those arry in clint side
  io.emit('all_user', arr)

  socket.on('message', (msg, user) => {
    if(user===''){
      // io.emit('message', "invalid User");
    }else{
      io.to(user).emit('message', msg);
    }
  });


//   app.use(express.static(__dirname + '/public/img'));
//   app.get('/img', function (req, res) {
//     // logic to find image based on id passed, we will assume it results in shark.jpg
//     const filepath = `${__dirname}/public/img/image.png`;
//     res.sendFile(filepath);
// });



  socket.on("upload", (user, id, file,file_name, callback) => {
    // console.log(file); // <Buffer 25 50 44 ...>  
        setTimeout(() => {
          console.log(user, id, file)
          var tree= fs.writeFileSync('image.png', file)
          var readStream = fs.createReadStream('image.png');
          const buffer = Buffer.from(file, 'base64');
          
          console.log("========================", file_name, buffer)
        
          try{
            io.to(id).emit('upload', file.toString('base64'),  id, file_name);
          }catch{
            io.to(id).emit('upload', "invalid",  id);
          }
        
        }, 300);
    // user, id
    // save the content to the disk, for example
 
  })

  //user specific user id for chat 
  socket.on('specific_user', (msg, user, id) => {
    if(user===''){
    }else{
      var count=arr.map((x)=>{
        if(x.id ===id){
          return x.count
        }
        console.log("============", count)
      io.to(user).emit('specific_user', msg, id, count);

      })
    }
  });


  // for public message
  socket.on('global',(msg)=>{
    io.emit('global', msg)
  })

  socket.on('join_room',(id)=>{
    socket.join(id)
  })

  
// i counting how many user
  socket.on('all_user',()=>{
  io.emit('all_user', {"id":socket.id, "count":k, "is":true})
  })

 
  //when user is disconnet then need to remove from arry
  socket.on('disconnect', () => {
  //  k--;
   const my=arr.findIndex((x)=>x.id ===socket.id)
   arr.splice(my, 1)
   setTimeout(() => {
    io.emit('all_user', arr)
   }, 200);
  });


});

 


server.listen(8000, () => {
  console.log('listening on *:8000');
});
