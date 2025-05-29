"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { MessageSquare, Search, Eye, Trash, Calendar, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// Type for chat and message data
interface ChatMessage {
  id: string;
  role: string;
  content: string;
  timestamp: string;
}

interface ChatData {
  id: string;
  title: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  isArchived: boolean;
  isDeleted: boolean;
  messages: ChatMessage[];
  user?: {
    name: string;
    email: string;
  };
}

// Get the current chats from localStorage
const getChatsFromStorage = (): ChatData[] => {
  if (typeof window === 'undefined') return [];

  // Try to get chat sessions
  const chatSessions = localStorage.getItem('chatSessions');
  if (!chatSessions) return [];

  try {
    // Parse and transform into admin format
    const sessions = JSON.parse(chatSessions);

    return sessions.map((session: any) => ({
      id: session.id,
      title: session.title,
      userId: 'user-id', // Mock user ID
      createdAt: new Date(session.createdAt).toISOString(),
      updatedAt: new Date(session.updatedAt).toISOString(),
      isArchived: false,
      isDeleted: false,
      messages: session.messages.map((msg: any) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        timestamp: new Date(msg.timestamp).toISOString()
      })),
      user: {
        name: 'Regular User',
        email: 'user@example.com'
      }
    }));
  } catch (error) {
    console.error('Error parsing chat sessions:', error);
    return [];
  }
};

export default function ChatsList() {
  const [chats, setChats] = useState<ChatData[]>([]);
  const [filteredChats, setFilteredChats] = useState<ChatData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChat, setSelectedChat] = useState<ChatData | null>(null);
  const [viewingMessages, setViewingMessages] = useState(false);

  // Load chats from localStorage
  useEffect(() => {
    const storedChats = getChatsFromStorage();
    setChats(storedChats);
    setFilteredChats(storedChats);
    setLoading(false);

    // Save to mockChats for stats
    localStorage.setItem('mockChats', JSON.stringify(storedChats));
  }, []);

  // Filter chats when search term changes
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredChats(chats);
      return;
    }

    const filtered = chats.filter(chat =>
      chat.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chat.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chat.user?.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredChats(filtered);
  }, [searchTerm, chats]);

  // Delete a chat
  const handleDeleteChat = (chatId: string) => {
    setChats(prev => prev.filter(chat => chat.id !== chatId));
    setFilteredChats(prev => prev.filter(chat => chat.id !== chatId));

    // Remove from main chat storage too (this would normally be an API call)
    const chatSessions = localStorage.getItem('chatSessions');
    if (chatSessions) {
      try {
        const sessions = JSON.parse(chatSessions);
        const updatedSessions = sessions.filter((session: any) => session.id !== chatId);
        localStorage.setItem('chatSessions', JSON.stringify(updatedSessions));
      } catch (error) {
        console.error('Error updating chat sessions:', error);
      }
    }

    toast.success('Chat deleted successfully');
  };

  // View chat messages
  const handleViewChat = (chat: ChatData) => {
    setSelectedChat(chat);
    setViewingMessages(true);
  };

  // Format date to readable string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  // Get message count for a chat
  const getMessageCount = (chat: ChatData) => {
    return chat.messages.length;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse flex space-x-2">
          <div className="h-3 w-3 bg-sky-400 rounded-full"></div>
          <div className="h-3 w-3 bg-sky-400 rounded-full"></div>
          <div className="h-3 w-3 bg-sky-400 rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="backdrop-blur-md bg-card-gradient border border-sky-500/30">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Chat Management</CardTitle>
              <CardDescription>View and manage all user conversations</CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-sky-300" />
              <Input
                placeholder="Search chats..."
                className="pl-10 border-sky-500/30 bg-sky-900/20 text-white backdrop-blur-sm w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-sky-500/20">
                  <th className="px-4 py-2 text-left text-sm text-sky-300">Title</th>
                  <th className="px-4 py-2 text-left text-sm text-sky-300">User</th>
                  <th className="px-4 py-2 text-center text-sm text-sky-300">Messages</th>
                  <th className="px-4 py-2 text-left text-sm text-sky-300">Created</th>
                  <th className="px-4 py-2 text-left text-sm text-sky-300">Last Updated</th>
                  <th className="px-4 py-2 text-right text-sm text-sky-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredChats.length > 0 ? (
                  filteredChats.map((chat) => (
                    <tr key={chat.id} className="border-b border-sky-500/10 hover:bg-sky-900/20">
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center">
                          <div className="h-8 w-8 flex items-center justify-center rounded-full bg-sky-900/40 border border-sky-500/20 mr-2">
                            <MessageSquare className="h-4 w-4 text-sky-300" />
                          </div>
                          <span className="font-medium">{chat.title}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center">
                          <User className="h-4 w-4 text-sky-300 mr-1" />
                          <span>{chat.user?.name || 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-center">
                        <Badge className="bg-sky-900/50 border border-sky-500/30">
                          {getMessageCount(chat)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center text-sky-300/80">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDate(chat.createdAt)}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-sky-300/80">
                        {formatDate(chat.updatedAt)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-sky-300 hover:text-sky-100 hover:bg-sky-900/30"
                            onClick={() => handleViewChat(chat)}
                          >
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">View</span>
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-300 hover:text-red-100 hover:bg-red-900/30"
                            onClick={() => handleDeleteChat(chat.id)}
                          >
                            <Trash className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-sky-300/70">
                      No chats found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
        <CardFooter className="justify-between border-t border-sky-500/20 pt-4">
          <div className="text-sm text-sky-300/70">
            Total: {filteredChats.length} chat{filteredChats.length !== 1 ? 's' : ''}
          </div>
        </CardFooter>
      </Card>

      {/* Chat Messages Dialog */}
      <Dialog open={viewingMessages} onOpenChange={setViewingMessages}>
        <DialogContent className="backdrop-blur-md bg-card-gradient border border-sky-500/30 max-w-3xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Chat Messages</DialogTitle>
            <DialogDescription>
              {selectedChat?.title} - {selectedChat?.user?.name} ({selectedChat?.user?.email})
            </DialogDescription>
          </DialogHeader>

          <div className="overflow-y-auto max-h-[50vh] p-4 border border-sky-500/20 rounded-md bg-black/40">
            {selectedChat?.messages.map((message, index) => (
              <div
                key={message.id}
                className={`mb-4 p-3 rounded-lg max-w-[80%] ${
                  message.role === 'user'
                    ? 'ml-auto bg-sky-600/40 text-white'
                    : 'mr-auto bg-card-gradient border border-sky-500/20'
                }`}
              >
                <div className="flex items-center mb-1">
                  <Badge variant="outline" className="h-5 border-sky-500/30 text-sky-300 text-xs">
                    {message.role}
                  </Badge>
                  <span className="ml-2 text-xs text-sky-300/70">
                    {formatDate(message.timestamp)}
                  </span>
                </div>
                <div className="whitespace-pre-wrap">{message.content}</div>
              </div>
            ))}

            {(!selectedChat?.messages || selectedChat.messages.length === 0) && (
              <div className="text-center py-8 text-sky-300/70">
                No messages in this chat.
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setViewingMessages(false)}
              className="border-sky-500/30 text-sky-300 hover:bg-sky-900/30"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
