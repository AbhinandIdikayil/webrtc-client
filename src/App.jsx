import { useState } from 'react'

import './App.css'
import { Route, Routes } from 'react-router-dom'
import Lobby from './pages/Lobby'
import SocketProvider from './context/SocketProvider'
import Room from './pages/Room'
// import PeerProvider from './context/PeerProvider'

function App() {

  return (
    <SocketProvider>
      {/* <PeerProvider> */}
        <Routes>
          <Route path='/' element={<Lobby />} />
          <Route path='/room/:room' element={<Room />} />
        </Routes>
      {/* </PeerProvider> */}
    </SocketProvider>
  )
}

export default App
