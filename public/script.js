// const socket = io('/');
// const videoGrid = document.getElementById('video-grid');
// const peer = new Peer();
// const myVideo = document.createElement('video');
// myVideo.muted = true;
// const peers = {};
// let localStream; 


// navigator.mediaDevices.getUserMedia({
//     video: true,
//     audio: true
// }).then(stream => {
//     localStream = stream;
//     addVideoStream(myVideo, stream);

//     peer.on('call', call => {
//         call.answer(stream);
//         const video = document.createElement('video');
//         call.on('stream', userVideoStream => {
//             addVideoStream(video, userVideoStream);
//         });
//     });

//     socket.on('user-connected', userId => {
//         connectToNewUser(userId, stream);
//     });
// });

// peer.on('open', id => {
//     socket.emit('join-room', ROOM_ID, id);
// });

// socket.on('user-disconnected', userId => {
//     if (peers[userId]) peers[userId].close();
// });

// function connectToNewUser(userId, stream) {
//     const call = peer.call(userId, stream);
//     const video = document.createElement('video');
//     call.on('stream', userVideoStream => {
//         addVideoStream(video, userVideoStream);
//     });
//     call.on('close', () => {
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

// document.getElementById('video-btn').addEventListener('click', () => {
//     if (localStream) {
//         const videoTrack = localStream.getVideoTracks()[0];
//         videoTrack.enabled = !videoTrack.enabled;

//         document.getElementById('video-btn').innerHTML = videoTrack.enabled
//             ? '<i class="fas fa-video"></i> Stop Video'
//             : '<i class="fas fa-video-slash"></i> Start Video';

//         document.getElementById
//     }
// });

// document.getElementById('mute-btn').addEventListener('click', () => {
//     if (localStream) {
//         const audioTrack = localStream.getAudioTracks()[0];
//         audioTrack.enabled = !audioTrack.enabled;

//         document.getElementById('mute-btn').innerHTML = audioTrack.enabled
//             ? '<i class="fas fa-microphone"></i> Mute'
//             : '<i class="fas fa-microphone-slash"></i> Unmute';
//     }
// });

// document.getElementById('leave-btn').addEventListener('click', () => {
//     socket.disconnect();
//     localStream.getTracks().forEach(track => track.stop());
//     location.href = '/';
// });

const socket = io('/');
const videoGrid = document.getElementById('video-grid');
const myVideo = document.createElement('video');
myVideo.muted = true;  // Mute self to avoid echo
const peers = {};
let localStream;

// Initialize PeerJS with STUN & TURN servers
const peer = new Peer({
    config: {
        iceServers: [
            { urls: "stun:stun.l.google.com:19302" }, // Google's STUN
            { 
                urls: "turn:relay1.expressturn.com:3478", // Free TURN server
                username: "expressturn",
                credential: "expressturn"
            }
        ]
    }
});

// Get user media
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    localStream = stream;
    addVideoStream(myVideo, stream);

    peer.on('call', call => {
        call.answer(stream);
        const video = document.createElement('video');
        call.on('stream', userVideoStream => addVideoStream(video, userVideoStream));
        call.on('close', () => video.remove());
    });

    socket.on('user-connected', userId => {
        console.log(`User connected: ${userId}`);
        connectToNewUser(userId, stream);
    });
}).catch(error => {
    console.error('Error accessing media devices:', error);
});

// Send Peer ID to server
peer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id);
});

// Handle user disconnect
socket.on('user-disconnected', userId => {
    if (peers[userId]) peers[userId].close();
    console.log(`User disconnected: ${userId}`);
});

// Connect to new user
function connectToNewUser(userId, stream) {
    const call = peer.call(userId, stream);
    const video = document.createElement('video');

    call.on('stream', userVideoStream => addVideoStream(video, userVideoStream));
    call.on('close', () => video.remove());

    peers[userId] = call;
}

// Add video stream to grid
function addVideoStream(video, stream) {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => video.play());
    videoGrid.append(video);
}

// Toggle video
document.getElementById('video-btn').addEventListener('click', () => {
    if (localStream) {
        const videoTrack = localStream.getVideoTracks()[0];
        videoTrack.enabled = !videoTrack.enabled;
        document.getElementById('video-btn').innerHTML = videoTrack.enabled
            ? '<i class="fas fa-video"></i> Stop Video'
            : '<i class="fas fa-video-slash"></i> Start Video';
    }
});

// Toggle audio
document.getElementById('mute-btn').addEventListener('click', () => {
    if (localStream) {
        const audioTrack = localStream.getAudioTracks()[0];
        audioTrack.enabled = !audioTrack.enabled;
        document.getElementById('mute-btn').innerHTML = audioTrack.enabled
            ? '<i class="fas fa-microphone"></i> Mute'
            : '<i class="fas fa-microphone-slash"></i> Unmute';
    }
});

// Leave room
document.getElementById('leave-btn').addEventListener('click', () => {
    socket.emit('leave-room');
    socket.disconnect();
    
    // Stop all tracks
    localStream.getTracks().forEach(track => track.stop());
    
    // Remove all videos
    videoGrid.innerHTML = '';
    
    location.href = '/';
});
