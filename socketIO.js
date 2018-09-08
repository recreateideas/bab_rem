require('dotenv').config();
const io = require('socket.io')();

io.on('connection', (client) => {
    client.on('subscribeToTimer', interval => {
        console.log('client is subscribing to time interval ', interval);
        setInterval(()=>{
            client.emit('timer', new Date());
        }, interval)
    });
});

const socket_port = process.env.SOCKET_PORT || 8011;


io.listen(socket_port);
console.log(`#-- Socket listening on ${process.env.REMOTE_HOST} port: ${socket_port}`);
