import React, { useCallback, useEffect, useState } from 'react'
import { useSocket } from '../context/SocketProvider';
import {useNavigate} from 'react-router-dom'


function Lobby() {
    const [email, setEmail] = useState('')
    const [room, setRoom] = useState('');
    const navigate = useNavigate()

    // ! getting socket from context
    const socket = useSocket()

    
    const handleSubmit = useCallback((e) => {
        e.preventDefault();
        socket.emit('room:join', { email, room })
    }, [socket, email, room]);
    
    const handleJoinRoom = useCallback((data) => {
        const { email, room } = data;
        navigate(`/room/${room}`)
    }, [])
    
    useEffect(() => {
        socket.on('room:join', handleJoinRoom)
        return () => {
            socket.off('room:join', handleJoinRoom)
        }
    }, [socket, handleJoinRoom])


    return (
        <div>
            <form action="" onSubmit={handleSubmit}>
                <label htmlFor="email">Email ID</label>
                <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" id='email' />
                <br />
                <label htmlFor="room">Room Number</label>
                <input value={room} onChange={(e) => setRoom(e.target.value)} type="text" id='room' />
                <button>join</button>
            </form>
        </div>
    )
}

export default Lobby