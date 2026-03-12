import { Menu, Plus, Trash2, LogOut, LogIn, MessageSquare, Trash } from "lucide-react"
import { useState, useEffect } from "react"

export function Sidebar({ conversations, currentConvId, onNewChat, onSelectChat, onDeleteChat, isOpen, setIsOpen, isLoggedIn, onLogout, onLogin, userName, onDeleteMultiple, pagination, onLoadMore, isLoadingMore, listRef }) {
    const [selectedConvs, setSelectedConvs] = useState(new Set())
    const [isSelectMode, setIsSelectMode] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    
    // Infinite scroll detection
    useEffect(() => {
      if (!listRef?.current) return
      
      const handleScroll = () => {
        const element = listRef.current
        if (element.scrollHeight - element.scrollTop - element.clientHeight < 100) {
          if (!isLoadingMore && pagination?.hasNextPage) {
            onLoadMore()
          }
        }
      }
      
      const scrollElement = listRef.current
      scrollElement.addEventListener('scroll', handleScroll)
      return () => scrollElement.removeEventListener('scroll', handleScroll)
    }, [isLoadingMore, pagination, onLoadMore, listRef])

    const toggleSelectMode = () => {
        setIsSelectMode(!isSelectMode)
        setSelectedConvs(new Set())
    }

    const toggleSelectAll = () => {
        if (selectedConvs.size === conversations.length) {
            setSelectedConvs(new Set())
        } else {
            setSelectedConvs(new Set(conversations.map(c => c.id)))
        }
    }

    const toggleConversation = (convId) => {
        const newSelected = new Set(selectedConvs)
        if (newSelected.has(convId)) {
            newSelected.delete(convId)
        } else {
            newSelected.add(convId)
        }
        setSelectedConvs(newSelected)
    }

    const handleDeleteSelected = () => {
        if (selectedConvs.size === 0) return
        setIsDeleteModalOpen(true)
    }

    const handleConfirmDelete = async () => {
        await onDeleteMultiple(Array.from(selectedConvs))
        setSelectedConvs(new Set())
        setIsSelectMode(false)
        setIsDeleteModalOpen(false)
    }

    const handleCancelDelete = () => {
        setIsDeleteModalOpen(false)
    }

    return (
        <>
            {/* Mobile Menu Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="fixed top-3 sm:top-4 left-3 sm:left-4 z-40 md:hidden p-2.5 sm:p-2 rounded-lg hover:bg-gray-200 active:bg-gray-300 transition-colors"
                >
                    <Menu className="w-6 sm:w-6 h-6 sm:h-6" />
                </button>
            )}

            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-35 md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div
                className={`fixed md:static w-64 h-dvh md:h-screen bg-gray-900 text-white flex flex-col z-40 transform transition-transform md:translate-x-0 overflow-hidden ${isOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                {/* Header */}
                <div className="p-3 sm:p-4 border-b border-gray-700 flex-shrink-0 space-y-2">
                    {isSelectMode ? (
                        <>
                            <button
                                onClick={toggleSelectAll}
                                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium transition-colors text-white"
                            >
                                {selectedConvs.size === conversations.length ? 'Deselect All' : 'Select All'}
                            </button>
                            <button
                                onClick={handleDeleteSelected}
                                disabled={selectedConvs.size === 0}
                                className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium transition-colors text-white disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Trash className="w-4 h-4" />
                                Delete ({selectedConvs.size})
                            </button>
                            <button
                                onClick={toggleSelectMode}
                                className="w-full flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium transition-colors text-gray-200"
                            >
                                Cancel
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={onNewChat}
                                className="w-full flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 active:bg-gray-600 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-medium transition-colors duration-200"
                            >
                                <Plus className="w-4 h-4 flex-shrink-0" />
                                <span className="truncate">New chat</span>
                            </button>
                            {conversations.length > 0 && (
                                <button
                                    onClick={toggleSelectMode}
                                    className="w-full flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium transition-colors text-gray-200"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Select & Delete
                                </button>
                            )}
                        </>
                    )}
                </div>

                {/* Conversations List */}
                <div ref={listRef} className="flex-1 overflow-y-auto px-2 py-1 sm:py-2 space-y-1 min-h-0">
                    {conversations.length === 0 ? (
                        <p className="text-gray-500 text-xs sm:text-sm px-2 py-8 text-center">No conversations yet</p>
                    ) : (
                        <>
                            {conversations.map((conv) => {
                                const isSelected = selectedConvs.has(conv.id)
                                return (
                                    <div
                                        key={conv.id}
                                        className={`group flex items-center justify-between gap-2 rounded-lg sm:rounded-xl px-3 sm:px-4 py-1.5 sm:py-2 cursor-pointer transition-all ${isSelected
                                            ? "bg-blue-100 text-gray-900 shadow-md border border-blue-300"
                                            : currentConvId === conv.id
                                                ? "bg-white text-gray-900 shadow-md border border-gray-200"
                                                : "bg-gray-800 text-gray-300 hover:bg-gray-750 hover:text-gray-100 border border-gray-700"
                                            }`}
                                        onClick={() => {
                                            if (isSelectMode) {
                                                toggleConversation(conv.id)
                                            } else {
                                                onSelectChat(conv.id)
                                                setIsOpen(false)
                                            }
                                        }}
                                    >
                                        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                                            {isSelectMode && (
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => toggleConversation(conv.id)}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="w-4 h-4 rounded border-gray-300 cursor-pointer flex-shrink-0"
                                                />
                                            )}
                                            <MessageSquare className={`w-4 h-4 flex-shrink-0 ${isSelected ? "text-blue-600" : currentConvId === conv.id ? "text-gray-600" : "text-gray-500"
                                                }`} />
                                            <span className={`flex-1 truncate text-xs sm:text-sm font-medium leading-relaxed ${isSelected ? "text-gray-900" : currentConvId === conv.id ? "text-gray-900" : "text-gray-300"
                                                }`}>
                                                {conv.title}
                                            </span>
                                        </div>
                                        {!isSelectMode && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    onDeleteChat(conv.id)
                                                }}
                                                className={`opacity-0 group-hover:opacity-100 p-1.5 sm:p-2 rounded-lg transition-all flex-shrink-0 ${currentConvId === conv.id
                                                    ? "hover:bg-red-50"
                                                    : "hover:bg-gray-700"
                                                    }`}
                                                title="Delete conversation"
                                            >
                                                <Trash2 className={`w-3.5 sm:w-4 h-3.5 sm:h-4 ${currentConvId === conv.id ? "text-red-500" : "text-red-400"
                                                    }`} />
                                            </button>
                                        )}
                                    </div>
                                )
                            })}
                            
                            {/* Loading indicator for infinite scroll */}
                            {isLoadingMore && (
                                <div className="flex items-center justify-center gap-2 py-3 text-gray-400">
                                    <div className="w-2 h-2 rounded-full bg-gray-500 animate-pulse"></div>
                                    <span className="text-xs sm:text-sm">Loading more...</span>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="border-t border-gray-700 p-3 sm:p-4 flex-shrink-0 space-y-2 sm:space-y-3">
                    {isLoggedIn && (
                        <div className="px-2 sm:px-3 py-2 bg-gray-800 rounded-lg text-center">
                            <p className="text-xs sm:text-sm font-medium text-white truncate">{userName}</p>
                        </div>
                    )}
                    {isLoggedIn ? (
                        <button
                            onClick={onLogout}
                            className="w-full flex items-center justify-center gap-2 text-gray-400 hover:text-white rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm transition-colors hover:bg-gray-800"
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="hidden sm:inline">Log out</span>
                            <span className="sm:hidden">Logout</span>
                        </button>
                    ) : (
                        <button
                            onClick={onLogin}
                            className="w-full flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium transition-colors"
                        >
                            <LogIn className="w-4 h-4" />
                            Sign In
                        </button>
                    )}
                </div>
            </div>

            {/* Delete Multiple Confirm Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-lg p-5 sm:p-6 md:p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-start gap-3 sm:gap-4">
                            <div className="flex-shrink-0 mt-0.5">
                                <Trash className="w-5 sm:w-6 h-5 sm:h-6 text-red-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">
                                   Are you sure you want to delete?
                                </h2>
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 mt-5 sm:mt-6 sm:justify-end">
                            <button
                                onClick={handleCancelDelete}
                                className="px-3 sm:px-4 py-2 text-gray-900 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm font-medium transition-colors h-auto"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                className="px-3 sm:px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium transition-colors h-auto"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
