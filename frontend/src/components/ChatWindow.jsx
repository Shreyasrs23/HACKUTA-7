import { useState, useEffect, useRef } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import axios from 'axios'

function ChatWindow() {
  const { getAccessTokenSilently } = useAuth0()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [sessionId, setSessionId] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)
  const messagesEndRef = useRef(null)

  const API_BASE = import.meta.env.VITE_API_BASE

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const startApplication = async () => {
    setHasStarted(true)
    const welcomeMessage = {
      sender: 'ai',
      message: 'Hello! I can help you with your SNAP (Food Assistance) application. What is your full name?',
      timestamp: new Date()
    }
    setMessages([welcomeMessage])
    
    // Play audio for welcome message (if ElevenLabs integration is added)
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(welcomeMessage.message)
      utterance.rate = 0.9
      utterance.pitch = 1
      window.speechSynthesis.speak(utterance)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!input.trim()) return

    const userMessage = {
      sender: 'user',
      message: input.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const token = await getAccessTokenSilently()

      const response = await axios.post(
        `${API_BASE}/chat`,
        {
          message: userMessage.message,
          session_id: sessionId
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      const aiMessage = {
        sender: 'ai',
        message: response.data.reply,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, aiMessage])
      setSessionId(response.data.session_id)

      // Play audio for AI response
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(response.data.reply)
        utterance.rate = 0.9
        utterance.pitch = 1
        window.speechSynthesis.speak(utterance)
      }
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage = {
        sender: 'ai',
        message: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  if (!hasStarted) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="mb-8">
            <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Food Assistance (SNAP)</h2>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              I'll help you complete your SNAP application through a simple conversation.
              I'll ask you a few questions, and at the end, you'll receive your completed form.
            </p>
          </div>
          <button
            onClick={startApplication}
            className="px-8 py-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Start Application
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-200px)] flex flex-col bg-white rounded-2xl shadow-xl overflow-hidden">
      <div className="bg-indigo-600 text-white p-6">
        <h2 className="text-2xl font-bold">SNAP Application Assistant</h2>
        <p className="text-indigo-100 text-sm mt-1">I'm here to help you complete your form</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] rounded-2xl px-6 py-4 ${
                msg.sender === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-none'
                  : 'bg-white text-gray-800 shadow-md rounded-bl-none border border-gray-200'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.message}</p>
              <span className={`text-xs mt-2 block ${
                msg.sender === 'user' ? 'text-indigo-200' : 'text-gray-500'
              }`}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-800 rounded-2xl rounded-bl-none px-6 py-4 shadow-md border border-gray-200">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-gray-200 p-6 bg-white">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your answer..."
            disabled={isLoading}
            className="flex-1 px-6 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed text-lg"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-8 py-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 font-semibold shadow-lg hover:shadow-xl"
          >
            Send
          </button>
        </form>
        <p className="text-xs text-gray-500 mt-3 text-center">
          Your responses are saved automatically
        </p>
      </div>
    </div>
  )
}

export default ChatWindow
