const express = require('express')
const http = require('http')
const path = require('path')
const socketio = require('socket.io')
const app = express()
const server = http.createServer(app)
const io = socketio(server)
const port = process.env.PORT || 3000
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')

const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))


io.on('connection', (socket) => {
    console.log("New WebSocket connection")

    socket.on('join', ({ username, room }, callback) => {

        const { error, user } = addUser({ id: socket.id, username, room })
        if (error) {
            return callback(error)
        }

        socket.join(user.room)

        socket.emit('message', generateMessage("Welcome!"))
        socket.broadcast.to(user.room).emit("message", generateMessage(`${user.username} has joined!`))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        callback()
    })

    socket.on("sendMessage", (message, callback) => { //retrive the user message
        const filter = new Filter()
        if (filter.isProfane(message)) {
            return callback('Profanity is not allowed!')
        }
        const user = getUser(socket.id)
        if (!user) {
            return {
                error: 'No user found'
            }
        }
        io.to(user.room).emit('message', generateMessage(message, user.username)) //sending the new message to all users in the room
        callback()
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        if (user) {
            io.to(user.room).emit('message', generateMessage(`${user.username} has left!`))
            io.to(user.room).emit('roomData',{
                room:user.room,
                users:getUsersInRoom(user.room)
            })
        }
    })

    socket.on('sendLocation', (locationData, callback) => {
        const user = getUser(socket.id)
        if (!user) {
            return {
                error: 'No user found'
            }
        }
        io.to(user.room).emit('getLocation', generateLocationMessage(locationData, user.username))
        callback()
    })
})


//// COUNTER EXAMPLE
//let count = 0
// io.on('connection', (socket) => {
//     console.log("New WebSocket connection")

//     socket.emit('countUpdate', count) //every new user will get the count 

//     socket.on('increment', () => {
//         count++
//         //socket.emit('countUpdate', count) //מעדכן רק את הלקוח הספציפי שביצעה שינוי
//         io.emit('countUpdate', count) //מעדכן את כל הלקוחות שמחוברים 
//     })
// })

server.listen(port, () => {
    console.log("server is running on port " + port)
})