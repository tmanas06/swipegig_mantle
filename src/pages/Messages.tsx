
import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { mockClients } from '@/data/mockData';

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
}

interface Conversation {
  id: string;
  participantId: string;
  lastMessagePreview: string;
  unread: number;
  lastMessageTime: string;
}

const Messages = () => {
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: '1',
      participantId: '1',
      lastMessagePreview: 'Hi there! I saw your profile and would like to discuss the NFT marketplace project.',
      unread: 2,
      lastMessageTime: '2h ago',
    },
    {
      id: '2',
      participantId: '2',
      lastMessagePreview: 'Thanks for accepting! When can we schedule a call to discuss the details?',
      unread: 0,
      lastMessageTime: '1d ago',
    },
    {
      id: '3',
      participantId: '3',
      lastMessagePreview: 'Contract proposal received. Would you be open to negotiating the timeline?',
      unread: 1,
      lastMessageTime: '3d ago',
    }
  ]);

  const [messages, setMessages] = useState<{ [key: string]: Message[] }>({
    '1': [
      {
        id: '1-1',
        senderId: '1',
        receiverId: 'me',
        content: 'Hi there! I saw your profile and would like to discuss the NFT marketplace project.',
        timestamp: '2023-04-24T10:30:00Z',
      },
      {
        id: '1-2',
        senderId: '1',
        receiverId: 'me',
        content: 'Do you have experience with ERC-721 and ERC-1155 standards?',
        timestamp: '2023-04-24T10:32:00Z',
      }
    ],
    '2': [
      {
        id: '2-1',
        senderId: '2',
        receiverId: 'me',
        content: 'Hello! Thanks for accepting my job proposal.',
        timestamp: '2023-04-23T09:15:00Z',
      },
      {
        id: '2-2',
        senderId: 'me',
        receiverId: '2',
        content: "No problem! I'm excited to work on this project.",
        timestamp: '2023-04-23T09:20:00Z',
      },
      {
        id: '2-3',
        senderId: '2',
        receiverId: 'me',
        content: 'Thanks for accepting! When can we schedule a call to discuss the details?',
        timestamp: '2023-04-23T09:25:00Z',
      }
    ],
    '3': [
      {
        id: '3-1',
        senderId: '3',
        receiverId: 'me',
        content: 'Contract proposal received. Would you be open to negotiating the timeline?',
        timestamp: '2023-04-21T14:10:00Z',
      }
    ]
  });

  useEffect(() => {
    // Set the first conversation as active by default
    if (conversations.length > 0 && !activeConversation) {
      setActiveConversation(conversations[0].id);
    }
  }, [conversations, activeConversation]);

  const handleSendMessage = () => {
    if (!messageInput.trim() || !activeConversation) return;

    const newMessage: Message = {
      id: `${activeConversation}-${Date.now()}`,
      senderId: 'me',
      receiverId: conversations.find(c => c.id === activeConversation)?.participantId || '',
      content: messageInput,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => ({
      ...prev,
      [activeConversation]: [...(prev[activeConversation] || []), newMessage]
    }));

    // Update conversation preview
    setConversations(prev => 
      prev.map(conv => 
        conv.id === activeConversation 
          ? { ...conv, lastMessagePreview: messageInput, lastMessageTime: 'Just now', unread: 0 } 
          : conv
      )
    );

    setMessageInput('');
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getParticipant = (participantId: string) => {
    return mockClients.find(client => client.id === participantId) || null;
  };

  const handleConversationSelect = (conversationId: string) => {
    setActiveConversation(conversationId);
    
    // Mark conversation as read
    setConversations(prev => 
      prev.map(conv => 
        conv.id === conversationId 
          ? { ...conv, unread: 0 } 
          : conv
      )
    );
  };

  const activeParticipant = activeConversation 
    ? getParticipant(conversations.find(c => c.id === activeConversation)?.participantId || '')
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto pt-24 pb-8 px-4">
        <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
          <div className="flex h-[600px]">
            {/* Sidebar - Conversations List */}
            <div className="w-1/3 border-r">
              <div className="p-4 border-b">
                <h2 className="font-bold text-lg">Messages</h2>
              </div>
              
              <div className="overflow-y-auto h-[calc(100%-65px)]">
                {conversations.map(conversation => {
                  const participant = getParticipant(conversation.participantId);
                  
                  return (
                    <div 
                      key={conversation.id}
                      className={`flex p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                        activeConversation === conversation.id ? 'bg-gray-100' : ''
                      }`}
                      onClick={() => handleConversationSelect(conversation.id)}
                    >
                      <Avatar className="h-12 w-12 mr-4">
                        <AvatarImage src={participant?.avatar} />
                        <AvatarFallback>{participant?.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold truncate">{participant?.name}</h3>
                          <span className="text-xs text-gray-500">{conversation.lastMessageTime}</span>
                        </div>
                        <p className="text-sm text-gray-600 truncate">{conversation.lastMessagePreview}</p>
                      </div>
                      
                      {conversation.unread > 0 && (
                        <div className="ml-2 bg-web3-primary text-white rounded-full h-5 min-w-5 flex items-center justify-center text-xs px-1">
                          {conversation.unread}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
              {activeConversation && activeParticipant ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b flex items-center">
                    <Avatar className="h-10 w-10 mr-3">
                      <AvatarImage src={activeParticipant?.avatar} />
                      <AvatarFallback>{activeParticipant?.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{activeParticipant?.name}</h3>
                      {activeParticipant?.lensHandle && (
                        <p className="text-xs text-gray-500">{activeParticipant.lensHandle}</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages[activeConversation]?.map(message => (
                      <div 
                        key={message.id}
                        className={`flex ${message.senderId === 'me' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div 
                          className={`max-w-xs md:max-w-md p-3 rounded-lg ${
                            message.senderId === 'me' 
                              ? 'bg-web3-primary text-white rounded-br-none' 
                              : 'bg-gray-100 rounded-bl-none'
                          }`}
                        >
                          <p>{message.content}</p>
                          <div className={`text-xs mt-1 ${message.senderId === 'me' ? 'text-white/70' : 'text-gray-500'}`}>
                            {formatMessageTime(message.timestamp)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Message Input */}
                  <div className="p-4 border-t">
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Type a message..."
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleSendMessage();
                          }
                        }}
                        className="flex-1"
                      />
                      <Button 
                        onClick={handleSendMessage}
                        className="bg-web3-primary hover:bg-web3-secondary text-white"
                      >
                        Send
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Your messages</h3>
                  <p className="text-sm text-gray-500">Select a conversation to start messaging</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
