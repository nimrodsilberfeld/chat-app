const socket = io()
const messageInput = document.querySelector('#message_input')
const sendButton = document.querySelector('#send_button')
const messageForm = document.querySelector('#message_form')
const sendLocation = document.querySelector('#send-location_button')
const messages = document.querySelector('#messages')
//Templates
const messageTamplate = document.querySelector('#message-template').innerHTML
const locationTamplate = document.querySelector('#Location-message-template').innerHTML
const sidebarTamplate = document.querySelector('#sidebar-template').innerHTML
//Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })
///

const autoScroll = () => {
    //New message element
    const newMessage = messages.lastElementChild

    //Height of New message
    const newMessageStyles = getComputedStyle(newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = newMessage.offsetHeight + newMessageMargin
    //console.log(newMessageMargin)

    //visible height
    const visibleHeight = messages.offsetHeight //height of total messeages

    //Height of messages container 
    const containerHeight = messages.scrollHeight

    //How far have i scroll
    const scrollOffSet = messages.scrollTop + visibleHeight

    const scrolledToTheBottomZone = 10

    if (containerHeight - newMessageHeight <= scrollOffSet + scrolledToTheBottomZone) {
        messages.scrollTop = messages.scrollHeight
    }
}

messageForm.addEventListener('submit', (e) => {
    e.preventDefault()
    if (messageInput.value == "") { return }
    sendButton.setAttribute('disabled', 'disabled')
    socket.emit('sendMessage', messageInput.value, (error) => {
        sendButton.removeAttribute('disabled')
        messageInput.value = ""
        messageInput.focus()
        if (error) {
            return console.log(error)
        }
        // console.log("Message delivered")
        // console.log("message delivered!", error)
    }) //send the message to the server
})

sendLocation.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert("Geolocation is not supported by your browser.")
    }
    sendLocation.setAttribute('disabled', 'disabled')
    navigator.geolocation.getCurrentPosition((position) => {
        const locationData = {
            longtitude: position.coords.longitude,
            latitude: position.coords.latitude
        }
        socket.emit('sendLocation', locationData, () => {
            console.log("Location send!")
            sendLocation.removeAttribute('disabled')
        })
    })

})

socket.on('message', (message) => {  //listen to new messages from the server
    console.log(message)
    let html = Mustache.render(messageTamplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('H:mm')
    })
    messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})


socket.on('getLocation', (locationData) => {
    console.log(locationData)
    const locationHtml = Mustache.render(locationTamplate, {
        username: locationData.username,
        url: locationData.url,
        createdAt: moment(locationData.createdAt).format('H:mm')
    })
    messages.insertAdjacentHTML('beforeend', locationHtml)
    autoScroll()
})

socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTamplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

//COUNTER EXAMPLE
// const plusButton = document.querySelector('#plus')

// socket.on('countUpdate', (count) => {
//     console.log("the count has been updated!", count)
// })

// plusButton.addEventListener('click', () => {
//     console.log('Click')
//     socket.emit('increment')
// })