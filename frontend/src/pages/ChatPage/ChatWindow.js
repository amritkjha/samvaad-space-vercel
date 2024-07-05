import axios from 'axios'
import React, { useEffect, useState } from 'react'
import io from 'socket.io-client'

const ChatWindow = ({room, setRoom}) => {
  // const chatSocket = new WebSocket('ws://localhost:8000/ws/chat/new_room/')
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([])
  // const messages = [
  //   {
  //     sender: 'Self',
  //     message: 'Namaste'
  //   },
  //   {
  //     sender: 'Contact',
  //     message: 'Ram Ram'
  //   },
  // ]

  const socket = io(`${window.location.origin}`);

  useEffect(() => {
    setMessages([]);
    socket.emit('joinRoom', room);

    socket.on('chatMessage',  (message) => {
      setMessages(prevMessages => [...prevMessages, message]);
    })
      
    socket.on('previousMessages',  (previousMessages) => {
      setMessages(previousMessages);
    })
    return () => {
      socket.emit('leaveRoom', room);
      socket.disconnect()
    }
  }, [room])

  const handleMessageSend = (e) => {
    e.preventDefault();
    const message = e?.target?.message?.value;
    const newMessage = {
      username: localStorage.getItem('userName'),
      message,
      timestamp: new Date(),
    }
    socket.emit('chatMessage', {room, ...newMessage});
    setMessage('');
  }

  const handleMessageChange = (e) => {
    setMessage(e.target.value);
  }

  const handleExitCommunity = () => {
    const community_id = room;
    const member_id = localStorage.getItem('userName');
    axios
        .post(`${window.location.origin}/api/community/leave-community`, {community_id, member_id})
        .then((res) => {
          console.log('community left', res);
          alert(res.data.message);
        })
        .catch((error) => {
          if(error.response.status === 400)alert(error.response.data.message);
          console.log('error', error);
        })
  }

  return (
    <div className='h-full p-5'>
      <div className='h-[93%]'>
        {room && <div className={`${room && 'border-b'} flex`}>
          <span className='text-3xl' role='button' onClick={()=>setRoom('')}>{'<'}</span><h3 className='text-2xl ms-2'>{room}</h3>
          <button className='ms-auto rounded px-3 my-auto bg-[red]' onClick={handleExitCommunity}>Exit</button>
        </div>}
        {messages?.map((msg)=>{return (<div className={`${msg?.username==localStorage.getItem('userName')?`bg-[red] ml-auto rounded-l-lg`:`bg-[green] mr-auto rounded-r-lg`} w-fit px-2 py-1`}>{msg.message}</div>)})}
      </div>
      {room &&<form className='flex h-[7%]' onSubmit={handleMessageSend}>
        <input type='text' name='message' className='sticky w-[81%] md:w-[89%] rounded mx-auto px-2 text-black' placeholder='Enter a message to send' value={message} onChange={handleMessageChange} />
        <button type='submit' className='bg-green-500 w-[15%] md:w-[6%] mx-auto rounded-r-[40%] text-white p-1 text-3xl leading-3'>&gt;</button>
      </form>}
    </div>
  )
}

export default ChatWindow
