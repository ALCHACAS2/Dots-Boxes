import { useEffect, useRef, useState } from "react";

export const useVoiceChat = ({ socket, roomCode, isInitiator }) => {
    const [micEnabled, setMicEnabled] = useState(false);
    const [audioEnabled, setAudioEnabled] = useState(true);

    const peerConnectionRef = useRef(null);
    const localStreamRef = useRef(null);
    const remoteAudioRef = useRef(new Audio());

    useEffect(() => {
        const peer = new RTCPeerConnection();

        peer.ontrack = (event) => {
            remoteAudioRef.current.srcObject = event.streams[0];
            remoteAudioRef.current.play().catch((e) => console.warn("AutoPlay error:", e));
        };

        peer.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit("signal", {
                    roomCode,
                    data: { candidate: event.candidate }
                });
            }
        };

        peerConnectionRef.current = peer;

        if (isInitiator) {
            navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
                localStreamRef.current = stream;
                stream.getTracks().forEach((track) => peer.addTrack(track, stream));

                peer.createOffer().then((offer) => {
                    peer.setLocalDescription(offer);
                    socket.emit("signal", {
                        roomCode,
                        data: { offer }
                    });
                });
            });
        }

        socket.on("signal", async ({ data }) => {
            if (data.offer) {
                await peer.setRemoteDescription(new RTCSessionDescription(data.offer));
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                localStreamRef.current = stream;
                stream.getTracks().forEach((track) => peer.addTrack(track, stream));
                const answer = await peer.createAnswer();
                await peer.setLocalDescription(answer);
                socket.emit("signal", { roomCode, data: { answer } });
            }

            if (data.answer) {
                await peer.setRemoteDescription(new RTCSessionDescription(data.answer));
            }

            if (data.candidate) {
                await peer.addIceCandidate(new RTCIceCandidate(data.candidate));
            }
        });

        return () => {
            socket.off("signal");
            peer.close();
        };
    }, [socket, roomCode, isInitiator]);

    const toggleMic = async () => {
        if (!micEnabled) {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            localStreamRef.current = stream;
            stream.getTracks().forEach((track) => {
                peerConnectionRef.current?.addTrack(track, stream);
            });
            setMicEnabled(true);
        } else {
            localStreamRef.current?.getTracks().forEach((track) => track.stop());
            setMicEnabled(false);
        }
    };

    const toggleAudio = () => {
        remoteAudioRef.current.muted = !remoteAudioRef.current.muted;
        setAudioEnabled(!remoteAudioRef.current.muted);
    };

    return {
        micEnabled,
        audioEnabled,
        toggleMic,
        toggleAudio,
    };
};
