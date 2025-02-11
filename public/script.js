// const socket = io('/');
// const videoGrid = document.getElementById('video-grid');
// const myPeer = new Peer(undefined, {
//     host: '/',
//     port: '3001'
// });
// const myVideo = document.createElement('video');
// myVideo.muted = true;
// const peers = {};

// // Get user media (video + audio)
// navigator.mediaDevices.getUserMedia({
//     video: true,
//     audio: true
// }).then(stream => {
//     addVideoStream(myVideo, stream);

//     myPeer.on('call', call => {
//         console.log('Incoming call from:', call.peer);
//         call.answer(stream);
//         const video = document.createElement('video');
//         call.on('stream', userVideoStream => {
//             console.log('Receiving video stream from:', call.peer);
//             addVideoStream(video, userVideoStream);
//         });
//         call.on('close', () => {
//             video.remove();
//         });
//     });

//     socket.on('user-connected', userId => {
//         console.log('User connected:', userId);
//         setTimeout(() => {  // Delay to ensure both users are ready
//             connectToNewUser(userId, stream);
//         }, 1000);
//     });
// });

// // Handle user disconnection
// socket.on('user-disconnected', userId => {
//     console.log('User disconnected:', userId);
//     if (peers[userId]) {
//         peers[userId].close();
//     }
// });

// // Notify the server that the user joined
// myPeer.on('open', id => {
//     console.log('My Peer ID:', id);
//     socket.emit('join-room', ROOM_ID, id);
// });

// function connectToNewUser(userId, stream) {
//     console.log('Calling user:', userId);
//     const call = myPeer.call(userId, stream);
//     if (!call) {
//         console.error('Call failed to initiate');
//         return;
//     }
//     const video = document.createElement('video');
    
//     call.on('stream', userVideoStream => {
//         console.log('Adding video stream from:', userId);
//         addVideoStream(video, userVideoStream);
//     });

//     call.on('close', () => {
//         console.log('Call closed with:', userId);
//         video.remove();
//     });

//     peers[userId] = call;
// }

// function addVideoStream(video, stream) {
//     video.srcObject = stream;
//     video.addEventListener('loadedmetadata', () => {
//         video.play();
//     });
//     videoGrid.append(video);
// }

// VERSRION 2

const socket = io('/');
const videoGrid = document.getElementById('video-grid');
const myPeer = new Peer(undefined, {
    host: '/',
    port: '3001'
});
const myVideo = document.createElement('video');
myVideo.classList.add('video-style');
myVideo.muted = true;
const peers = {};

// Get user media (video + audio)
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    addVideoStream(myVideo, stream);

    myPeer.on('call', call => {
        call.answer(stream);
        const video = document.createElement('video');
        video.classList.add('video-style');
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream);
        });
        call.on('close', () => {
            video.remove();
        });
    });

    socket.on('user-connected', userId => {
        setTimeout(() => {
            connectToNewUser(userId, stream);
        }, 1000);
    });

    // Add controls for muting audio and video
    document.getElementById('mute-btn').addEventListener('click', () => {
        stream.getAudioTracks()[0].enabled = !stream.getAudioTracks()[0].enabled;
        document.getElementById('mute-btn').textContent = stream.getAudioTracks()[0].enabled ? '🔊 Unmute' : '🔇 Mute';
    });

    document.getElementById('video-btn').addEventListener('click', () => {
        stream.getVideoTracks()[0].enabled = !stream.getVideoTracks()[0].enabled;
        document.getElementById('video-btn').textContent = stream.getVideoTracks()[0].enabled ? '📹 Stop Video' : '📷 Start Video';
    });

    document.getElementById('leave-btn').addEventListener('click', () => {
        window.location.href = "/";
    });
});

// Handle user disconnection
socket.on('user-disconnected', userId => {
    if (peers[userId]) {
        peers[userId].close();
    }
});

myPeer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id);
});

function connectToNewUser(userId, stream) {
    const call = myPeer.call(userId, stream);
    const video = document.createElement('video');
    video.classList.add('video-style');

    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream);
    });

    call.on('close', () => {
        video.remove();
    });

    peers[userId] = call;
}

function addVideoStream(video, stream) {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play();
    });
    videoGrid.append(video);
}
