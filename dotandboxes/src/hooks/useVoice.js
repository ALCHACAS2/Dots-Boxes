import { useEffect, useRef, useState } from "react";

export const useVoiceChat = ({ socket, roomCode, isInitiator }) => {
    const [micEnabled, setMicEnabled] = useState(false);
    const [audioEnabled, setAudioEnabled] = useState(true);

    const peerConnectionRef = useRef(null);
    const localStreamRef = useRef(null);
    const remoteAudioRef = useRef(new Audio());
    const localAudioTrackRef = useRef(null);

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
            startMicrophone(); // Solo el iniciador arranca con el micrófono si quiere
        }

        socket.on("signal", async ({ data }) => {
            if (data.offer) {
                await peer.setRemoteDescription(new RTCSessionDescription(data.offer));
                await startMicrophone();
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

    // Activar micro
    const startMicrophone = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        localStreamRef.current = stream;
        const track = stream.getAudioTracks()[0];
        localAudioTrackRef.current = track;

        peerConnectionRef.current.addTrack(track, stream);
        setMicEnabled(true);
    };

    // Activar / desactivar mic
    const toggleMic = async () => {
        if (!micEnabled) {
            await startMicrophone();
        } else {
            if (localAudioTrackRef.current) {
                localAudioTrackRef.current.enabled = false;
                peerConnectionRef.current.getSenders().forEach(sender => {
                    if (sender.track === localAudioTrackRef.current) {
                        peerConnectionRef.current.removeTrack(sender);
                    }
                });
                localAudioTrackRef.current.stop();
                localAudioTrackRef.current = null;
            }

            setMicEnabled(false);
        }
    };

    // Activar / desactivar audio recibido
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
