import { useState, useRef, useEffect } from 'react';
import { useProjectChat } from '../../hooks/useProjectChat';
import { useAuth } from '../../context/AuthContext';
import {
  Send,
  MessageSquare,
  Users,
  AlertCircle,
  Loader2,
} from 'lucide-react';

export const ProjectChat = ({ projectId, projectTitle = 'Project Workspace' }) => {
  const { user } = useAuth();
  const [inputContent, setInputContent] = useState('');
  const messagesEndRef = useRef(null);

  const {
    messages,
    sendMessage,
    startTyping,
    stopTyping,
    typingUsers,
    onlineUsers,
    connectionStatus,
    roomError,
    isLoading,
    isSending,
  } = useProjectChat(projectId);

  // Auto-scroll to latest message
  const scrollToBottom = () => {
    if (typeof messagesEndRef.current?.scrollIntoView === 'function') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingUsers]);

  const handleInputChange = (e) => {
    setInputContent(e.target.value);
    if (e.target.value.trim()) {
      startTyping();
    } else {
      stopTyping();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!inputContent.trim() || isSending) return;

    stopTyping();
    const text = inputContent.trim();
    setInputContent('');
    await sendMessage(text);
  };

  const formatMessageTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="glass-panel rounded-3xl border border-slate-800 shadow-2xl flex flex-col h-[650px] overflow-hidden">
      {/* Chat Top Header */}
      <div className="p-4 sm:p-5 border-b border-slate-800/80 bg-slate-950/40 backdrop-blur-md flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-sm">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>{projectTitle} — Live Team Chat</span>
            </h3>
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-indigo-400" />
                <span>{onlineUsers.length} online</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span
                    className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                      connectionStatus === 'connected' ? 'bg-emerald-400' : 'bg-amber-400'
                    }`}
                  />
                  <span
                    className={`relative inline-flex rounded-full h-2 w-2 ${
                      connectionStatus === 'connected' ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
                  />
                </span>
                <span className="text-[11px] capitalize text-slate-300 font-mono">
                  {connectionStatus === 'connected' ? 'Live Stream Active' : connectionStatus}
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Error Alert Banner */}
      {roomError && (
        <div className="p-3 mx-4 mt-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{roomError}</span>
        </div>
      )}

      {/* Message Stream Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {isLoading ? (
          <div className="h-full flex flex-col items-center justify-center gap-2 text-slate-400 text-xs">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
            <span>Loading project conversation history...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-2">
              <MessageSquare className="w-6 h-6 text-indigo-400" />
            </div>
            <h4 className="text-sm font-bold text-white mb-1">No Messages Yet</h4>
            <p className="text-xs text-slate-400 max-w-xs">
              Say hello to your project team! Messages persist across sessions and notify members in real-time.
            </p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = msg.sender?._id === user?._id || msg.sender === user?._id;
            const senderName = msg.sender?.name || 'Member';
            const senderAvatar = msg.sender?.profile?.avatar;

            return (
              <div
                key={msg._id || idx}
                className={`flex items-end gap-2.5 ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                {/* Other user avatar */}
                {!isMe && (
                  <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-indigo-300 flex-shrink-0 overflow-hidden shadow-sm mb-1">
                    {senderAvatar ? (
                      <img src={senderAvatar} alt={senderName} className="w-full h-full object-cover" />
                    ) : (
                      senderName.charAt(0).toUpperCase()
                    )}
                  </div>
                )}

                <div className={`max-w-[75%] space-y-1 ${isMe ? 'items-end' : 'items-start'}`}>
                  {/* Sender Name (if not current user) */}
                  {!isMe && (
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 px-1">
                      <span className="font-semibold text-slate-300">{senderName}</span>
                      {msg.sender?.role && (
                        <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                          {msg.sender.role}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div
                    className={`p-3.5 rounded-2xl text-xs leading-relaxed shadow-md ${
                      isMe
                        ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-br-none'
                        : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none'
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                    <div
                      className={`text-[9px] mt-1 text-right font-mono ${
                        isMe ? 'text-indigo-200' : 'text-slate-500'
                      }`}
                    >
                      {formatMessageTime(msg.createdAt)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Typing Indicator Bubble */}
        {typingUsers.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-slate-400 animate-fadeIn">
            <div className="w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center text-[10px] font-bold text-indigo-400">
              {typingUsers[0].name.charAt(0).toUpperCase()}
            </div>
            <div className="px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-[11px] flex items-center gap-1.5">
              <span>{typingUsers.map((u) => u.name.split(' ')[0]).join(', ')} is typing</span>
              <span className="flex gap-0.5">
                <span className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce" />
                <span className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]" />
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form Bar */}
      <div className="p-3 sm:p-4 border-t border-slate-800/80 bg-slate-950/60 backdrop-blur-md">
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={inputContent}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={
                connectionStatus === 'connected'
                  ? 'Type a message to project team (Enter to send)...'
                  : 'Connecting to chat stream...'
              }
              disabled={connectionStatus !== 'connected'}
              className="w-full pl-4 pr-10 py-3 bg-slate-900/90 border border-slate-800 rounded-2xl text-slate-100 text-xs placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            />
          </div>

          <button
            type="submit"
            disabled={!inputContent.trim() || isSending || connectionStatus !== 'connected'}
            className="p-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:bg-slate-800 text-white disabled:text-slate-600 transition-all shadow-md shadow-indigo-600/20 disabled:shadow-none flex items-center justify-center flex-shrink-0"
            title="Send Message"
          >
            {isSending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProjectChat;
