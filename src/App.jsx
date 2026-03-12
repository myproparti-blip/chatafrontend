import { useState, useRef, useEffect } from "react"
import ReactMarkdown from "react-markdown"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Send, LogIn, User, LogOut, X, Copy, Check } from "lucide-react"
import { Sidebar } from "@/components/Sidebar"
import { SignInModal } from "@/components/SignInModal"
import { LogoutModal } from "@/components/LogoutModal"
import { DeleteConfirmModal } from "@/components/DeleteConfirmModal"
import { conversationsApi, authApi } from "@/services/apiClient"

function App() {
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [conversations, setConversations] = useState([])
  const [currentConvId, setCurrentConvId] = useState(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userName, setUserName] = useState('')
  const [userPhone, setUserPhone] = useState('')
  const [userId, setUserId] = useState(null)
  const [authToken, setAuthToken] = useState('')
  const [userData, setUserData] = useState(null)
  const [isLoadingConversations, setIsLoadingConversations] = useState(true)
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false)
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [pendingDeleteId, setPendingDeleteId] = useState(null)
  const [pendingDeleteTitle, setPendingDeleteTitle] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [paginationMeta, setPaginationMeta] = useState(null)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const messagesEndRef = useRef(null)
  const conversationsListRef = useRef(null)
  const inputRef = useRef(null)
  const [copiedMessageId, setCopiedMessageId] = useState(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Restore auth state from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('authToken')
    const phone = localStorage.getItem('userPhone')
    const name = localStorage.getItem('userName')
    const id = localStorage.getItem('userId')

    if (token && phone && name && id) {
      setAuthToken(token)
      setUserPhone(phone)
      setUserName(name)
      setUserId(id)
      setIsLoggedIn(true)
      setIsSignInModalOpen(false)
    } else {
      // No valid auth, show sign in modal
      setIsLoggedIn(false)
      setUserId(null)
      setIsSignInModalOpen(true)
    }
  }, [])

  // Load initial conversations when userId changes
  useEffect(() => {
    if (isLoggedIn && userId) {
      setCurrentPage(1)
      fetchConversations(1, true)
    }
  }, [isLoggedIn, userId])

  // Auto-scroll to bottom on messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Focus input on new chat or when messages change
  useEffect(() => {
    if (isLoggedIn && currentConvId && inputRef.current) {
      inputRef.current.focus()
    }
  }, [currentConvId, isLoggedIn])



  // Fetch conversations from backend with pagination
  const fetchConversations = async (page = 1, isInitial = false) => {
    try {
      if (isInitial) {
        setIsLoadingConversations(true)
      } else {
        setIsLoadingMore(true)
      }
      
      if (!userId) {
        setConversations([])
        setPaginationMeta(null)
        return
      }
      
      const data = await conversationsApi.list(userId, page, 20)

      if (data.success) {
        setPaginationMeta(data.pagination)
        setCurrentPage(page)
        
        if (data.data.length > 0) {
          // Append new conversations on load more, replace on initial load
          if (isInitial) {
            setConversations(data.data)
            // Set first conversation as current only on initial load
            if (!currentConvId) {
              const firstConv = data.data[0]
              setCurrentConvId(firstConv.id)
              setMessages(firstConv.messages || [])
            }
          } else {
            setConversations(prev => [...prev, ...data.data])
          }
        } else if (isInitial && page === 1) {
          // Create first conversation if none exist
          await handleNewChat()
        }
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error)
      if (isInitial) {
        setConversations([])
        setPaginationMeta(null)
        setCurrentConvId(null)
        setMessages([])
      }
    } finally {
      if (isInitial) {
        setIsLoadingConversations(false)
      } else {
        setIsLoadingMore(false)
      }
    }
  }

  const sendMessage = async () => {
    if (!inputValue.trim() || !currentConvId || !userId) return

    const messageContent = inputValue
    setInputValue('')
    setIsLoading(true)

    try {
      const data = await conversationsApi.sendMessage(currentConvId, messageContent, userId)
       
       if (data.success) {
         // Update local messages with the response
         setMessages(data.data.messages)
         
         // Update conversations list with new message and possibly new title
         setConversations(prev => prev.map(c => 
           c.id === currentConvId 
             ? { ...c, title: data.data.title, messages: data.data.messages }
             : c
         ))
       } else {
        const errorMessage = {
          id: messages.length + 1,
          type: 'ai',
          content: `Error: ${data.error}`
        }
        setMessages(prev => [...prev, errorMessage])
      }
    } catch (error) {
      console.error('Send message error:', error)
      const errorMessage = {
        id: messages.length + 1,
        type: 'ai',
        content: `Connection error: ${error.message}`
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



  const handleCopyMessage = (msgId, content) => {
    navigator.clipboard.writeText(content).then(() => {
      setCopiedMessageId(msgId)
      // Reset the copied state after 2 seconds
      setTimeout(() => setCopiedMessageId(null), 2000)
    }).catch(err => {
      console.error('Failed to copy:', err)
    })
  }

  const handleNewChat = async () => {
    if (!userId) {
      setIsSignInModalOpen(true)
      return
    }

    try {
      const data = await conversationsApi.create(userId, 'New chat')

      if (data.success) {
         const newConv = data.data
         // Prepend newly created conversation to list
         setConversations([newConv, ...conversations])
         setCurrentConvId(newConv.id)
         setMessages(newConv.messages || [])
         setSidebarOpen(false)
       }
    } catch (error) {
      console.error('Failed to create new chat:', error)
    }
  }

  const handleSelectChat = (convId) => {
    const conversation = conversations.find(c => c.id === convId)
    setCurrentConvId(convId)
    setMessages(conversation?.messages || [])
  }

  const handleDeleteChat = (convId) => {
    const conversation = conversations.find(c => c.id === convId)
    if (conversation) {
      setPendingDeleteId(convId)
      setPendingDeleteTitle(conversation.title)
      setIsDeleteModalOpen(true)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!pendingDeleteId || !userId) return

    try {
      const data = await conversationsApi.delete(pendingDeleteId, userId)

      if (data.success) {
        const remaining = conversations.filter(c => c.id !== pendingDeleteId)
        setConversations(remaining)
        
        if (currentConvId === pendingDeleteId) {
          if (remaining.length > 0) {
            setCurrentConvId(remaining[0].id)
            setMessages(remaining[0].messages || [])
          } else {
            setCurrentConvId(null)
            setMessages([])
            // Create a new chat instead of calling handleNewChat directly
            // to ensure state is properly set
          }
        }
      }
    } catch (error) {
      console.error('Failed to delete chat:', error)
    } finally {
      setIsDeleteModalOpen(false)
      setPendingDeleteId(null)
      setPendingDeleteTitle('')
    }
  }

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false)
    setPendingDeleteId(null)
    setPendingDeleteTitle('')
  }

  const handleDeleteMultiple = async (convIds) => {
    if (!userId || convIds.length === 0) return

    try {
      const data = await conversationsApi.deleteMultiple(convIds, userId)

      if (data.success) {
        // Remove deleted conversations from state
        const remaining = conversations.filter(c => !convIds.includes(c.id))
        setConversations(remaining)
        
        // If current conversation was deleted, select first remaining conversation
        if (convIds.includes(currentConvId)) {
          if (remaining.length > 0) {
            setCurrentConvId(remaining[0].id)
            setMessages(remaining[0].messages || [])
          } else {
            setCurrentConvId(null)
            setMessages([])
          }
        }
      }
    } catch (error) {
      console.error('Failed to delete conversations:', error)
    }
  }

  const handleSignIn = (name, phone, token, user) => {
    setUserName(name)
    setUserPhone(phone)
    setAuthToken(token)
    setUserId(user?.id)
    setUserData(user)
    setIsLoggedIn(true)
    setIsSignInModalOpen(false)
    
    // Store auth data in localStorage
    localStorage.setItem('authToken', token)
    localStorage.setItem('userPhone', phone)
    localStorage.setItem('userName', name)
    localStorage.setItem('userId', user?.id)
  }

  const handleLogoutClick = () => {
    setIsLogoutModalOpen(true)
  }

  const handleLogoutConfirm = async () => {
    try {
      // Call logout API
      if (userPhone) {
        await authApi.logout(userPhone)
      }
    } catch (error) {
      console.error('Logout API error:', error)
    } finally {
      // Clear local state and storage
      setIsLoggedIn(false)
      setUserName('')
      setUserPhone('')
      setUserId(null)
      setAuthToken('')
      setUserData(null)
      setConversations([])
      setCurrentConvId(null)
      setMessages([])
      
      localStorage.removeItem('authToken')
      localStorage.removeItem('userPhone')
      localStorage.removeItem('userName')
      localStorage.removeItem('userId')
      
      setIsLogoutModalOpen(false)
      setIsSignInModalOpen(true)
    }
  }

  const handleLogoutCancel = () => {
    setIsLogoutModalOpen(false)
  }

  return (
    <div className="h-screen bg-white flex overflow-hidden">
      {/* Sidebar */}
      <Sidebar
         conversations={conversations}
         currentConvId={currentConvId}
         onNewChat={handleNewChat}
         onSelectChat={handleSelectChat}
         onDeleteChat={handleDeleteChat}
         onDeleteMultiple={handleDeleteMultiple}
         isOpen={sidebarOpen}
         setIsOpen={setSidebarOpen}
         isLoggedIn={isLoggedIn}
         onLogout={handleLogoutClick}
         onLogin={() => setIsSignInModalOpen(true)}
         userName={userName}
         pagination={paginationMeta}
         onLoadMore={() => {
           if (paginationMeta && paginationMeta.hasNextPage && !isLoadingMore) {
             fetchConversations(currentPage + 1, false)
           }
         }}
         isLoadingMore={isLoadingMore}
         listRef={conversationsListRef}
       />

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-white border-l border-gray-200">
        {/* Header */}
        <div className="border-b border-gray-200 px-3 sm:px-6 py-3 sm:py-4 bg-white flex items-center justify-between flex-shrink-0 gap-2 sm:gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">AI Chat Assistant</h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1 hidden sm:block">Powered by Mahim Architect</p>
          </div>
          
          {/* Right side: Profile or Login */}
          {isLoggedIn ? (
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900 truncate">{userName}</p>
                <p className="text-xs text-gray-500 truncate">{userPhone}</p>
              </div>
              <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-full bg-gray-700 text-white flex items-center justify-center text-xs sm:text-sm font-semibold hover:bg-gray-800 transition-colors cursor-pointer flex-shrink-0">
                {userName.charAt(0).toUpperCase()}
              </div>
            </div>
          ) : (
            <Button
              onClick={() => setIsSignInModalOpen(true)}
              className="bg-gray-800 hover:bg-gray-900 text-white flex items-center gap-1 sm:gap-2 text-sm sm:text-base py-2 px-3 sm:px-4 h-auto flex-shrink-0"
            >
              <LogIn className="w-4 h-4" />
              <span className="hidden sm:inline">Sign In</span>
            </Button>
          )}
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 sm:py-8 space-y-4 sm:space-y-6 bg-white">
          {!isLoggedIn ? (
            <div className="flex flex-col items-center justify-center h-full">
              <p className="text-gray-500 text-base sm:text-lg mb-4">Please sign in to continue</p>
              <Button 
                onClick={() => setIsSignInModalOpen(true)}
                className="bg-gray-800 hover:bg-gray-900 text-white py-2 px-4 h-auto"
              >
                Sign In
              </Button>
            </div>
          ) : isLoadingConversations ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">Loading conversations...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <p className="text-gray-500 text-base sm:text-lg mb-4">Start a new conversation</p>
              <Button 
                onClick={handleNewChat}
                className="bg-gray-800 hover:bg-gray-900 text-white py-2 px-4 h-auto"
              >
                New Chat
              </Button>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto w-full space-y-3 sm:space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-3 sm:gap-4 ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.type === 'ai' && (
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-8 sm:w-9 h-8 sm:h-9 rounded-full bg-gray-700 flex items-center justify-center text-white text-xs sm:text-sm font-semibold shadow-sm">
                        A
                      </div>
                    </div>
                  )}
                  
                  <div className={`flex flex-col gap-2 ${msg.type === 'user' ? 'items-end max-w-2xl' : 'items-start max-w-3xl'}`}>
                     {/* Message content with copy button */}
                     <div className={`group relative rounded-lg px-4 py-3 text-sm sm:text-base leading-relaxed break-words ${
                       msg.type === 'user' 
                         ? 'bg-gray-800 text-white rounded-br-none shadow-sm' 
                         : 'bg-gray-100 text-gray-900 rounded-bl-none'
                     }`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          {msg.type === 'ai' ? (
                            <div className="prose prose-sm max-w-none dark:prose-invert">
                              <ReactMarkdown
                                components={{
                                  p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                                  ul: ({node, ...props}) => <ul className="list-disc list-inside mb-2 space-y-1" {...props} />,
                                  ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-2 space-y-1" {...props} />,
                                  li: ({node, ...props}) => <li className="mb-0" {...props} />,
                                  strong: ({node, ...props}) => <strong className="font-semibold" {...props} />,
                                  em: ({node, ...props}) => <em className="italic" {...props} />,
                                  code: ({node, inline, ...props}) => 
                                    inline ? (
                                      <code className="bg-gray-200 px-1.5 py-0.5 rounded text-xs font-mono" {...props} />
                                    ) : (
                                      <code className="bg-gray-200 px-3 py-2 rounded block text-xs font-mono overflow-x-auto mb-2" {...props} />
                                    ),
                                  pre: ({node, ...props}) => <pre className="bg-gray-800 text-gray-100 p-3 rounded-lg overflow-x-auto mb-2 text-xs" {...props} />,
                                  blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-gray-400 pl-4 italic my-2" {...props} />,
                                  h1: ({node, ...props}) => <h1 className="text-lg font-bold mt-3 mb-2" {...props} />,
                                  h2: ({node, ...props}) => <h2 className="text-base font-bold mt-2 mb-1" {...props} />,
                                  h3: ({node, ...props}) => <h3 className="text-sm font-bold mt-2 mb-1" {...props} />,
                                  a: ({node, ...props}) => <a className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
                                  hr: ({node, ...props}) => <hr className="my-3 border-gray-300" {...props} />,
                                }}
                              >
                                {msg.content}
                              </ReactMarkdown>
                            </div>
                          ) : (
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                          )}
                        </div>
                        
                        {/* Copy button */}
                        <button
                          onClick={() => handleCopyMessage(msg.id, msg.content)}
                          className={`flex-shrink-0 p-2 rounded-md transition-colors ${
                            msg.type === 'user'
                              ? copiedMessageId === msg.id
                                ? 'bg-gray-700 text-green-400'
                                : 'opacity-0 group-hover:opacity-100 hover:bg-gray-700 text-gray-300 hover:text-white'
                              : copiedMessageId === msg.id
                                ? 'bg-gray-200 text-green-600'
                                : 'opacity-0 group-hover:opacity-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800'
                          }`}
                          title="Copy message"
                        >
                          {copiedMessageId === msg.id ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      </div>
                  </div>
                  
                  {msg.type === 'user' && (
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-8 sm:w-9 h-8 sm:h-9 rounded-full bg-gray-600 flex items-center justify-center text-white text-xs sm:text-sm font-semibold shadow-sm">
                        U
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-2 sm:gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-7 sm:w-8 h-7 sm:h-8 rounded-full bg-gray-700 flex items-center justify-center text-white text-xs sm:text-sm font-bold">
                      A
                    </div>
                  </div>
                  <div>
                    <div className="inline-block rounded-2xl px-3 sm:px-4 py-2 sm:py-3 bg-gray-200 text-gray-900 rounded-bl-none text-sm sm:text-base">
                      <p>Typing...</p>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        {isLoggedIn && (
          <div className="border-t border-gray-200 px-3 sm:px-6 py-3 sm:py-4 bg-white flex-shrink-0 safe-bottom">
            <div className="max-w-3xl mx-auto w-full">
              <div className="flex gap-2 sm:gap-3 bg-white rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 focus-within:ring-2 focus-within:ring-gray-400 focus-within:border-gray-400 transition-all shadow-sm hover:border-gray-400">
                <Input 
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Message..." 
                  disabled={isLoading}
                  className="flex-1 border-0 bg-transparent outline-none text-gray-900 placeholder:text-gray-500 text-sm sm:text-base disabled:opacity-50 focus-visible:ring-0 focus-visible:ring-offset-0 cursor-text"
                />
                <Button 
                  onClick={sendMessage}
                  disabled={isLoading || !inputValue.trim()}
                  size="icon"
                  className="bg-gray-800 hover:bg-gray-900 text-white w-9 sm:w-10 h-9 sm:h-10 p-0 flex items-center justify-center flex-shrink-0 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-4 sm:w-5 h-4 sm:h-5" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sign In Modal */}
      <SignInModal
        isOpen={isSignInModalOpen}
        onClose={() => setIsSignInModalOpen(false)}
        onSignIn={handleSignIn}
      />

      {/* Logout Modal */}
      <LogoutModal
        isOpen={isLogoutModalOpen}
        onConfirm={handleLogoutConfirm}
        onCancel={handleLogoutCancel}
      />

      {/* Delete Confirm Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        conversationTitle={pendingDeleteTitle}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </div>
  )
}

export default App
