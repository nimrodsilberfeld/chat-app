const users = []

const addUser = ({ id, username, room }) => {
    //Clean the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    //validate the data 
    if (!username || !room) {
        return {
            error: 'Username and Room are required!'
        }
    }

    //Check for existing username
    const exisitingUser = users.find((user) => {
        return user.room === room && user.username === username
    })

    //validate user
    if (exisitingUser) {
        return {
            error: 'Username is in use!'
        }
    }

    //store user
    const user = { id, username, room }
    users.push(user)
    return { user }
}

const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id)
    if (index !== -1) {
        return users.splice(index, 1)[0]
    }
}


const getUser = (id) => {
    const user = users.find((user) => user.id === id)
    return user
}

const getUsersInRoom = (room) => {
    let usersInroom = []
    usersInroom = users.filter((user) => user.room === room)
    return usersInroom
}

// addUser({
//     id: 22,
//     username: 'Nimrod',
//     room: 'TestRoom'
// })
// addUser({
//     id: 23,
//     username: 'Tal',
//     room: 'TestRoom'
// })
// //console.log(getUser(22))
// console.log(getUsersInRoom('testroom'))

module.exports={
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}