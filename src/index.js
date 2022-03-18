const path = require("path")
const http = require("http");
const express = require("express")
const socketio = require("socket.io")
const Filer = require("bad-words")
const {generateMessage,generateLoactionMessage} = require('./utils/messages')
const {addUser,getUser,getUserInRoom,removeUser } = require("./utils/users")

const app = express();
const server = http.createServer(app);
const io = socketio(server)


const port = process.env.PORT || 3000
const publicDirectory = path.join(__dirname, "../public")


app.use(express.static(publicDirectory))



io.on("connection", (socket) => {
  

  //join room
  socket.on('join', (Option, callback) =>
  {
    const { error, user } = addUser({ ...Option, id: socket.id })
    if (error)
    {
      return callback(error)
    }

    socket.join(user.room)
    socket.emit("message", generateMessage("Admin","wellcome!"))

    socket.broadcast.to(user.room).emit("message", generateMessage("Admin", `${ user.username } has joining!`))
    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getUserInRoom(user.room)
    })
    callback()
  })

  socket.on('sendMessage', (message, callback) =>
  {
    const user = getUser(socket.id)
    const filter = new Filer()
    if (filter.isProfane(message))
    {
      return callback("Profanity is not allowed")
    }

    io.to(user.room).emit("message", generateMessage(user.username,message))
    callback()

  })

  socket.on("sendLocation", (coord,callback) =>
  { 
    const user = getUser(socket.id)
    io.to(user.room).emit("localtionMessage",generateLoactionMessage(user.username, `https://www.google.com/maps/@${ coord.latitude },${ coord.longitude }`))
    callback()
  })

  socket.on("disconnect", () =>
  {
    const user = removeUser(socket.id)
 
    if (user)
    {
      console.log(user)
      io.to(user.room).emit("message", generateMessage("Admin", `${ user.username } left a room!`))
      io.to(user.room).emit('roomData', {
        room: user.room,
        users: getUserInRoom(user.room)
      })
    }

  })

})

server.listen(port, () => {
  console.log("Server is up on on port: " + port);
})