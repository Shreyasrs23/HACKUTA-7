import React, { useState, useRef, useEffect } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { Send, ArrowLeft, Download, Volume2, VolumeX } from 'lucide-react'
import axios from 'axios'

const ChatWindow = ({ onBack }) => {
  const { getAccessTokenSilently } = useAuth0()
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      content: 'Hello! I can help you with your SNAP application. What is your full name?',
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState(null)
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [showCompletionModal, setShowCompletionModal] = useState(false)
  const messagesEndRef = useRef(null)
  const audioRef = useRef(null)

  // Set the target number of messages for 100% completion (15 Q + 15 A = 30)
  const COMPLETION_TARGET = 27 

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const playAudio = (text) => {
    if (!isAudioEnabled || !audioRef.current) return
    
    // In a real implementation, you would use the audio URL from the API
    // For now, we'll use the Web Speech API as a fallback
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 1.5
      utterance.pitch = 1
      speechSynthesis.speak(utterance)
    }
  }

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      content: inputMessage,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      const token = await getAccessTokenSilently()
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE}/chat`,
        {
          message: inputMessage,
          session_id: sessionId
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      const aiMessage = {
        id: Date.now() + 1,
        sender: 'ai',
        content: response.data.reply,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, aiMessage])
      setSessionId(response.data.session_id)

      // Play audio for AI response
      if (isAudioEnabled) {
        playAudio(response.data.reply)
      }
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage = {
        id: Date.now() + 1,
        sender: 'ai',
        content: 'I apologize, but I encountered an error. Please try again.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const downloadForm = async () => {
    if (!sessionId) return
    
    try {
      const token = await getAccessTokenSilently()
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE}/download`,
        { session_id: sessionId },
        {
          headers: {
            Authorization: `Bearer ${token}`
          },
          responseType: 'blob'
        }
      )
      
      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'SNAP_Application_Filled.pdf')
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      // Show completion modal
      setShowCompletionModal(true)
    } catch (error) {
      console.error('Error downloading form:', error)
      alert('Error downloading form. Please try again.')
    }
  }

  // Form is complete after 15 questions + initial AI welcome + 15 user answers = 31 messages total
  const isFormComplete = messages.length >= COMPLETION_TARGET 

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">SNAP Application</h1>
                <p className="text-sm text-gray-500">Food Assistance Application</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              
              {isFormComplete && (
                <button
                  onClick={downloadForm}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Download Form</span>
                </button>
              )}
            </div>
        </div>
        </div>
      </header>

      {/* Chat Messages */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-xl shadow-lg h-96 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.sender === 'user'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p className={`text-xs mt-1 ${
                  message.sender === 'user' ? 'text-primary-100' : 'text-gray-500'
                }`}>
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          {/* Loading Spinner/Dots for AI Response */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="mt-6 flex space-x-4">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your answer here..."
            className="flex-1 input-field"
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4" />
            <span>Send</span>
          </button>
        </div>

        {/* Progress Indicator */}
        <div className="mt-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            {/* UPDATED: Target is 30 messages (15 Q + 15 A) */}
            <span>{Math.min(Math.round((messages.length / COMPLETION_TARGET) * 100), 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min((messages.length / COMPLETION_TARGET) * 100, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Audio element for playing responses */}
      <audio ref={audioRef} />

      {/* Completion Modal */}
      {showCompletionModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-96 text-center">
            <div className="text-2xl font-semibold text-gray-900">You are done!</div>
            <p className="text-gray-600 mt-2">Thank you for completing your SNAP application summary.</p>
            <div className="mt-6 flex gap-3 justify-center">
              <button
                className="btn-primary"
                onClick={() => setShowCompletionModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ChatWindow