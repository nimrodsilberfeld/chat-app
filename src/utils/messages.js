const generateMessage = (text,username) => {
    return {
        username:username,
        text,
        createdAt: new Date().getTime()
    }
}

const generateLocationMessage = (locationData,username) => {
    return {
        username:username,
        url: `https://google.com/maps?q=${locationData.latitude},${locationData.longtitude}`,
        createdAt: new Date().getTime()
    }

}

module.exports = {
    generateMessage,
    generateLocationMessage
}