import { useEffect, useRef, useState } from "react";

export const useVoiceChat = ({ socket, roomCode, isInitiator }) => {
    const [micEnabled, setMicEnabled] = useState(false);
    const [audioEnabled, setAudioEnabled] = useState(true);
    const [isConnecting, setIsConnecting] = useState(false);
    const [connectionState, setConnectionState] = useState('new');

    const peerConnectionRef = useRef(null);
    const localStreamRef = useRef(null);
    const remoteAudioRef = useRef(new Audio());

    // Configuración de servidores STUN/TURN
    const pcConfig = {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' }
        ]
    };

    useEffect(() => {
        if (!socket || !roomCode) return;

        let peer = null;
        let cleanup = false;

        const initializePeerConnection = () => {
            if (cleanup) return;

            peer = new RTCPeerConnection(pcConfig);
            peerConnectionRef.current = peer;            // Monitorear el estado de la conexión
            peer.onconnectionstatechange = () => {
                console.log('Connection state:', peer.connectionState);
                setConnectionState(peer.connectionState);
                
                if (peer.connectionState === 'connected') {
                    setIsConnecting(false);
                } else if (peer.connectionState === 'failed' || peer.connectionState === 'disconnected') {
                    setIsConnecting(false);
                } else if (peer.connectionState === 'connecting') {
                    setIsConnecting(true);
                }
            };

            peer.ontrack = (event) => {
                console.log('Received remote track');
                if (event.streams && event.streams[0]) {
                    remoteAudioRef.current.srcObject = event.streams[0];
                    remoteAudioRef.current.play().catch((e) => 
                        console.warn("AutoPlay error:", e)
                    );
                }
                // Cuando recibimos el track remoto, consideramos que la conexión está lista
                setIsConnecting(false);
            };

            peer.onicecandidate = (event) => {
                if (event.candidate && !cleanup) {
                    console.log('Sending ICE candidate');
                    socket.emit("signal", {
                        roomCode,
                        data: { candidate: event.candidate }
                    });
                }
            };            peer.onicegatheringstatechange = () => {
                console.log('ICE gathering state:', peer.iceGatheringState);
                if (peer.iceGatheringState === 'complete') {
                    // Cuando ICE gathering está completo, la conexión debería estar lista
                    setTimeout(() => {
                        if (peer.connectionState === 'connected' || peer.connectionState === 'completed') {
                            setIsConnecting(false);
                        }
                    }, 1000);
                }
            };

            return peer;
        };        const handleSignaling = async (data) => {
            try {
                if (cleanup || !peerConnectionRef.current) return;

                const peer = peerConnectionRef.current;
                console.log('Received signal:', Object.keys(data), 'Current state:', peer.signalingState);

                if (data.offer) {
                    console.log('Processing offer... Current state:', peer.signalingState);
                    
                    // Solo procesar si estamos en el estado correcto
                    if (peer.signalingState === 'stable') {
                        await peer.setRemoteDescription(new RTCSessionDescription(data.offer));
                          // Obtener stream de audio si no lo tenemos
                        if (!localStreamRef.current) {
                            try {
                                // Solo obtener audio para responder, pero mantener micrófono desactivado
                                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                                localStreamRef.current = stream;
                                
                                // Agregar tracks pero con el micrófono desactivado por defecto
                                stream.getTracks().forEach((track) => {
                                    track.enabled = false; // Desactivar por defecto
                                    peer.addTrack(track, stream);
                                });
                                setMicEnabled(false); // Asegurar que esté desactivado
                            } catch (error) {
                                console.warn('Could not get user media:', error);
                                setMicEnabled(false);
                            }
                        }// Crear respuesta solo si estamos en el estado correcto
                        if (peer.signalingState === 'have-remote-offer') {
                            const answer = await peer.createAnswer();
                            await peer.setLocalDescription(answer);
                            
                            if (!cleanup) {
                                socket.emit("signal", { 
                                    roomCode, 
                                    data: { answer } 
                                });
                            }
                            
                            // Una vez que enviamos la respuesta, podemos considerar que la conexión está en progreso
                            console.log('Answer sent, connection should be establishing...');
                        }
                    } else {
                        console.warn('Cannot process offer in state:', peer.signalingState);
                    }
                }

                if (data.answer) {
                    console.log('Processing answer... Current state:', peer.signalingState);
                    
                    // Solo procesar si estamos esperando una respuesta
                    if (peer.signalingState === 'have-local-offer') {
                        await peer.setRemoteDescription(new RTCSessionDescription(data.answer));
                    } else {
                        console.warn('Cannot process answer in state:', peer.signalingState);
                    }
                }

                if (data.candidate) {
                    console.log('Processing ICE candidate... Remote description exists:', !!peer.remoteDescription);
                    
                    // Solo agregar candidatos si tenemos una descripción remota
                    if (peer.remoteDescription && peer.remoteDescription.type) {
                        try {
                            await peer.addIceCandidate(new RTCIceCandidate(data.candidate));
                        } catch (error) {
                            console.warn('Error adding ICE candidate:', error);
                        }
                    } else {
                        console.warn('Cannot add ICE candidate without remote description');
                    }
                }
            } catch (error) {
                console.error('Error handling signaling:', error);
                setIsConnecting(false);
                
                // Si hay un error crítico, intentar reinicializar la conexión
                if (error.name === 'InvalidStateError') {
                    console.log('InvalidStateError detected, reinitializing connection...');
                    setTimeout(() => {
                        if (!cleanup && peerConnectionRef.current) {
                            try {
                                peerConnectionRef.current.close();
                                peerConnectionRef.current = null;
                                setupPeerConnection();
                            } catch (e) {
                                console.error('Error reinitializing:', e);
                            }
                        }
                    }, 1000);
                }
            }
        };        const setupPeerConnection = async () => {
            if (cleanup) return;
            
            setIsConnecting(true);
            
            // Timeout para el estado de conexión
            const connectionTimeout = setTimeout(() => {
                if (!cleanup) {
                    console.log('Connection timeout, enabling controls');
                    setIsConnecting(false);
                }
            }, 10000); // 10 segundos timeout

            const peer = initializePeerConnection();

            // Limpiar timeout cuando la conexión se establece
            const originalOnTrack = peer.ontrack;
            peer.ontrack = (event) => {
                clearTimeout(connectionTimeout);
                if (originalOnTrack) originalOnTrack(event);
            };

            const originalOnConnectionStateChange = peer.onconnectionstatechange;
            peer.onconnectionstatechange = () => {
                if (peer.connectionState === 'connected' || peer.connectionState === 'failed') {
                    clearTimeout(connectionTimeout);
                }
                if (originalOnConnectionStateChange) originalOnConnectionStateChange();
            };            if (isInitiator) {
                console.log('Initiating connection...');
                try {
                    // Obtener stream de audio pero sin activar el micrófono por defecto
                    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                    localStreamRef.current = stream;
                    
                    // Agregar tracks al peer connection pero desactivados
                    stream.getTracks().forEach((track) => {
                        track.enabled = false; // Desactivar micrófono por defecto
                        peer.addTrack(track, stream);
                    });
                    
                    setMicEnabled(false); // Asegurar que esté desactivado

                    // Crear oferta solo si estamos en el estado correcto
                    if (peer.signalingState === 'stable') {
                        const offer = await peer.createOffer({
                            offerToReceiveAudio: true
                        });
                        
                        await peer.setLocalDescription(offer);
                        
                        if (!cleanup) {
                            socket.emit("signal", {
                                roomCode,
                                data: { offer }
                            });
                        }
                    } else {
                        console.warn('Cannot create offer in state:', peer.signalingState);
                        clearTimeout(connectionTimeout);
                        setIsConnecting(false);
                    }
                } catch (error) {
                    console.error('Error setting up initiator:', error);
                    clearTimeout(connectionTimeout);
                    setMicEnabled(false);
                    setIsConnecting(false);
                    
                    // Reintento después de un error
                    if (!cleanup) {
                        setTimeout(() => {
                            if (!cleanup) {
                                console.log('Retrying connection setup...');
                                setupPeerConnection();
                            }
                        }, 2000);
                    }
                }
            }

            return () => {
                clearTimeout(connectionTimeout);
            };
        };

        // Configurar event listeners
        socket.on("signal", ({ data }) => handleSignaling(data));

        // Inicializar conexión
        setupPeerConnection();

        return () => {
            cleanup = true;
            socket.off("signal");
            
            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach(track => track.stop());
                localStreamRef.current = null;
            }
            
            if (peerConnectionRef.current) {
                peerConnectionRef.current.close();
                peerConnectionRef.current = null;
            }
            
            setIsConnecting(false);
            setMicEnabled(false);
        };
    }, [socket, roomCode, isInitiator]);    const toggleMic = async () => {
        try {
            if (!localStreamRef.current) {
                // Primera activación: solicitar acceso al micrófono
                console.log('🎙️ Solicitando acceso al micrófono por primera vez...');
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                localStreamRef.current = stream;
                
                // Agregar tracks al peer connection si existe
                if (peerConnectionRef.current) {
                    stream.getTracks().forEach((track) => {
                        track.enabled = true; // Activar al obtener por primera vez
                        // Verificar si el track ya está agregado
                        const senders = peerConnectionRef.current.getSenders();
                        const existingSender = senders.find(sender => sender.track === track);
                        if (!existingSender) {
                            peerConnectionRef.current.addTrack(track, stream);
                        }
                    });
                }
                setMicEnabled(true);
                console.log('✅ Micrófono activado por primera vez');
            } else {
                // Alternar el estado enabled de la pista de audio existente
                const audioTrack = localStreamRef.current.getAudioTracks()[0];
                if (audioTrack) {
                    audioTrack.enabled = !audioTrack.enabled;
                    setMicEnabled(audioTrack.enabled);
                    console.log(`🎙️ Micrófono ${audioTrack.enabled ? 'activado' : 'desactivado'}`);
                }
            }
        } catch (error) {
            console.error('❌ Error toggling microphone:', error);
            setMicEnabled(false);
            
            // Mostrar mensaje de error más descriptivo al usuario
            if (error.name === 'NotAllowedError') {
                alert('🚫 Se necesita acceso al micrófono para usar el chat de voz.\n\nPor favor:\n1. Permite el acceso al micrófono en tu navegador\n2. Recarga la página si es necesario\n3. Vuelve a intentar');
            } else if (error.name === 'NotFoundError') {
                alert('🎙️ No se encontró un micrófono conectado.\n\nVerifica que:\n1. Tengas un micrófono conectado\n2. El micrófono esté funcionando correctamente\n3. No esté siendo usado por otra aplicación');
            } else if (error.name === 'NotReadableError') {
                alert('⚠️ El micrófono está siendo usado por otra aplicación.\n\nCierra otras aplicaciones que puedan estar usando el micrófono y vuelve a intentar.');
            } else {
                alert(`❌ Error al acceder al micrófono:\n${error.message}\n\nIntenta recargar la página si el problema persiste.`);
            }
        }
    };

    const toggleAudio = () => {
        try {
            if (remoteAudioRef.current) {
                remoteAudioRef.current.muted = !remoteAudioRef.current.muted;
                setAudioEnabled(!remoteAudioRef.current.muted);
            }
        } catch (error) {
            console.error('Error toggling audio:', error);
        }
    };    const forceEnableControls = () => {
        console.log('Forzando habilitación de controles de voz');
        setIsConnecting(false);
    };

    return {
        micEnabled,
        audioEnabled,
        toggleMic,
        toggleAudio,
        isConnecting,
        connectionState,
        forceEnableControls
    };
};
