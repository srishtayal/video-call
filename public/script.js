const socket = io('/');
const videoGrid = document.getElementById('video-grid');
const peer = new Peer();
const myVideo = document.createElement('video');
myVideo.muted = true;
const peers = {};
let localStream; 


navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    localStream = stream;
    addVideoStream(myVideo, stream);

    peer.on('call', call => {
        call.answer(stream);
        const video = document.createElement('video');
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream);
        });
    });

    socket.on('user-connected', userId => {
        connectToNewUser(userId, stream);
    });
});

peer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id);
});

socket.on('user-disconnected', userId => {
    if (peers[userId]) peers[userId].close();
});

function connectToNewUser(userId, stream) {
    const call = peer.call(userId, stream);
    const video = document.createElement('video');
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

document.getElementById('video-btn').addEventListener('click', () => {
    if (localStream) {
        const videoTrack = localStream.getVideoTracks()[0];
        videoTrack.enabled = !videoTrack.enabled;

        document.getElementById('video-btn').innerHTML = videoTrack.enabled
            ? '<i class="fas fa-video"></i> Stop Video'
            : '<i class="fas fa-video-slash"></i> Start Video';

        document.getElementById
    }
});

document.getElementById('mute-btn').addEventListener('click', () => {
    if (localStream) {
        const audioTrack = localStream.getAudioTracks()[0];
        audioTrack.enabled = !audioTrack.enabled;

        document.getElementById('mute-btn').innerHTML = audioTrack.enabled
            ? '<i class="fas fa-microphone"></i> Mute'
            : '<i class="fas fa-microphone-slash"></i> Unmute';
    }
});

document.getElementById('leave-btn').addEventListener('click', () => {
    socket.disconnect();
    localStream.getTracks().forEach(track => track.stop());
    location.href = '/';
});

