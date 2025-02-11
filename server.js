// const express = require('express');
// const app = express();
// const server = require('http').Server(app);
// const io = require('socket.io')(server);
// const { v4: uuidV4 } = require('uuid');

// app.set('view engine', 'ejs');
// app.use(express.static('public'));

// app.get('/', (req, res) => {
//   res.redirect(`/${uuidV4()}`);
// });

// app.get('/:room', (req, res) => {
//   res.render('room', { roomId: req.params.room });
// });

// io.on('connection', (socket) => {
//   socket.on('join-room', (roomId, userId) => {
//     socket.join(roomId);

//     // ✅ Fix here: Remove .broadcast
//     socket.to(roomId).emit('user-connected', userId);

//     // Store the roomId in the socket object for later access
//     socket.roomId = roomId;

//     socket.on('disconnect', () => {
//       if (socket.roomId) {
//         socket.to(socket.roomId).emit('user-disconnected', userId);
//       }
//     });
//   });
// });

// server.listen(3000, () => console.log('Server running on port 3000'));

//VERSION 2

// const express = require('express');
// const app = express();
// const server = require('http').Server(app);
// const io = require('socket.io')(server);
// const { v4: uuidV4 } = require('uuid');

// app.set('view engine', 'ejs');
// app.use(express.static('public'));

// app.get('/', (req, res) => {
//   res.redirect(`/${uuidV4()}`);
// });

// app.get('/:room', (req, res) => {
//   res.render('room', { roomId: req.params.room });
// });

// io.on('connection', (socket) => {
//   socket.on('join-room', (roomId, userId) => {
//     socket.join(roomId);

//     // ✅ Fix here: Remove .broadcast
//     socket.to(roomId).emit('user-connected', userId);

//     // Store the roomId in the socket object for later access
//     socket.roomId = roomId;

//     socket.on('disconnect', () => {
//       if (socket.roomId) {
//         socket.to(socket.roomId).emit('user-disconnected', userId);
//       }
//     });
//   });
// });

// server.listen(3000, () => console.log('Server running on port 3000'));

const express = require('express');
const http = require('http');
const { v4: uuidV4 } = require('uuid');
const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server);

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.render('home'); // Landing Page instead of directly creating a room
});

app.get('/new-call', (req, res) => {
    res.redirect(`/${uuidV4()}`); // Generates a unique room on button click
});

app.get('/:room', (req, res) => {
    res.render('room', { roomId: req.params.room });
});

io.on('connection', socket => {
    socket.on('join-room', (roomId, userId) => {
        socket.join(roomId);
        socket.to(roomId).emit('user-connected', userId);
        socket.on('disconnect', () => {
            socket.to(roomId).emit('user-disconnected', userId);
        });
    });
});

server.listen(3000);

