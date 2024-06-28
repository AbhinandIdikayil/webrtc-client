import React, { useCallback, useEffect, useState } from 'react'
import { useSocket } from '../context/SocketProvider'
import ReactPlayer from 'react-player';
import peer from '../service/peer'


function Room() {
    const socket = useSocket();
    const [remoteSocketId, setRemoteSocketId] = useState()
    const [myStream, setMyStream] = useState()
    const [remoteStream, setRemoteStream] = useState()
    // const { peer, createOffer } = UsePeer()

    const handleUserJoined = useCallback(({ email, id }) => {
        console.log(`Emal ${email} joined room `)
        setRemoteSocketId(id)
    }, [])

    const handleCallUser = useCallback(async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        const offer = await peer.getOffer();
        socket.emit('user:call', { to: remoteSocketId, offer })
        setMyStream(stream)
    }, [remoteSocketId, socket])

    const handleIncomingCall = useCallback(async ({ from, offer }) => {
        setRemoteSocketId(from)
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        setMyStream(stream)
        console.log('Incoming call', from, offer)
        const ans = await peer.getAnswer(offer);
        socket.emit('call:accepted', { to: from, ans })
    }, [remoteSocketId, socket]);

    const sendStreams = useCallback(() => {
        for (const track of myStream.getTracks()) {
            peer.peer.addTrack(track, myStream)
        }
    }, [myStream])

    const handleCallAccepted = useCallback(async ({ from, ans }) => {
        peer.setLoaclDescription(ans)
        console.log('call accepted')
        sendStreams()
    }, [sendStreams])


    const handleNegoNeeded = useCallback(async () => {
        const offer = await peer.getOffer()
        socket.emit('peer:nego:needed', { offer, to: remoteSocketId })
    }, [remoteSocketId, socket])

    useEffect(() => {
        peer.peer.addEventListener('negotiationneeded', handleNegoNeeded)
        return () => {
            peer.peer.removeEventListener('negotiationneeded', handleNegoNeeded)
        }
    }, [handleNegoNeeded])

    useEffect(() => {
        peer.peer.addEventListener('track', async (ev) => {
            const remoteStream = ev.streams
            setRemoteStream(remoteStream[0])
        })
    }, [])

    const handleNegotiationIncoming = useCallback(async ({ from, offer }) => {
        const ans = await peer.getAnswer(offer)
        socket.emit('peer:nego:done', { to: from, ans })
    }, [socket])

    const handleNegotiationFinal = useCallback(async ({ ans }) => {
        await peer.setLoaclDescription(ans)
    }, [socket])

    useEffect(() => {
        socket.on('user:joined', handleUserJoined);
        socket.on('incomming:call', handleIncomingCall);
        socket.on('call:accepted', handleCallAccepted);
        socket.on('peer:nego:needed', handleNegotiationIncoming)
        socket.on('peer:nego:final', handleNegotiationFinal)


        return () => {
            socket.off('user:joined', handleUserJoined)
            socket.off('incomming:call', handleIncomingCall)
            socket.off('call:accepted', handleCallAccepted);
            socket.off('peer:nego:needed', handleNegotiationIncoming)
            socket.off('peer:nego:final', handleNegotiationFinal)

        }
    }, [socket, handleUserJoined,
        handleIncomingCall, handleCallAccepted,
        handleNegotiationIncoming, handleNegotiationFinal
    ]
    )


    return (
        <>
            <div>Room</div>
            <h4>{remoteSocketId ? 'you are connected' : 'no one in room'}</h4>
            {
                remoteSocketId &&
                <button onClick={handleCallUser}>CALL</button>
            }
            {
                myStream && <button onClick={sendStreams}> send stream </button>
            }
            {
                myStream && <ReactPlayer muted playing width={'300px'} height={'300px'} url={myStream} />
            }
            {
                remoteStream && (
                    <>
                        <h2>remote stream</h2>
                        <ReactPlayer muted playing width={'300px'} height={'300px'} url={remoteStream} />
                    </>
                )
            }
        </>
    )
}

export default Room