import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/auth/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { format, formatDistanceToNow } from "date-fns";
import { 
  MessageSquare, 
  Send, 
  Archive, 
  MoreVertical,
  Reply,
  Shield,
  AlertCircle,
  Clock,
  Check,
  CheckCheck,
  X,
  Info,
  Users,
  Search,
  Filter
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getPersonIdFromUserId } from "@/utils/donorUtils";

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderType: 'family' | 'clinic' | 'donor';
  recipientId: string;
  subject: string;
  content: string;
  createdAt: Date;
  isRead: boolean;
  isApproved: boolean;
  familyId?: string;
  familyName?: string;
  threadId?: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface Thread {
  id: string;
  familyId: string;
  familyName: string;
  lastMessage: string;
  lastMessageDate: Date;
  unreadCount: number;
  isArchived: boolean;
}

const DonorCommunication = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [activeTab, setActiveTab] = useState("inbox");
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [pendingMessages, setPendingMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [requiresApproval, setRequiresApproval] = useState(true);

  useEffect(() => {
    if (user) {
      loadCommunicationData();
      loadPrivacySettings();
    }
  }, [user]);

  const loadPrivacySettings = async () => {
    if (!user) return;
    
    try {
      // First get the person ID from the user ID
      const personId = await getPersonIdFromUserId(user.id);
      if (!personId) {
        console.error('Person record not found');
        return;
      }
      
      const { data: donorData } = await supabase
        .from('donors')
        .select('metadata')
        .eq('person_id', personId)
        .single();

      if (donorData?.metadata?.privacy_settings) {
        setRequiresApproval(donorData.metadata.privacy_settings.require_message_approval ?? true);
      }
    } catch (error) {
      console.error('Error loading privacy settings:', error);
    }
  };

  const loadCommunicationData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // First get the person ID from the user ID
      const personId = await getPersonIdFromUserId(user.id);
      if (!personId) {
        throw new Error('Person record not found');
      }
      
      // Load threads (grouped conversations with families)
      const { data: threadData, error: threadError } = await supabase
        .from('donor_family_threads')
        .select(`
          *,
          family:family_id (
            id,
            name
          ),
          messages:donor_family_messages (
            id,
            content,
            created_at,
            is_read
          )
        `)
        .eq('donor_id', personId)
        .order('last_message_at', { ascending: false });

      if (threadError) throw threadError;

      // Transform thread data
      const formattedThreads: Thread[] = threadData?.map(thread => ({
        id: thread.id,
        familyId: thread.family_id,
        familyName: thread.family?.name || 'Unknown Family',
        lastMessage: thread.messages?.[0]?.content || 'No messages yet',
        lastMessageDate: new Date(thread.last_message_at),
        unreadCount: thread.messages?.filter(m => !m.is_read).length || 0,
        isArchived: thread.is_archived || false
      })) || [];

      setThreads(formattedThreads);

      // Load pending messages if approval required
      if (requiresApproval) {
        const { data: pendingData } = await supabase
          .from('donor_family_messages')
          .select('*')
          .eq('recipient_id', user.id)
          .eq('status', 'pending')
          .order('created_at', { ascending: false });

        setPendingMessages(pendingData || []);
      }

      // Load messages for the first thread
      if (formattedThreads.length > 0 && !selectedThread) {
        setSelectedThread(formattedThreads[0]);
        loadThreadMessages(formattedThreads[0].id);
      }
    } catch (error) {
      console.error('Error loading communication data:', error);
      toast({
        title: "Error loading messages",
        description: "Failed to load your messages",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadThreadMessages = async (threadId: string) => {
    if (!user) return;
    
    try {
      const { data: messageData, error } = await supabase
        .from('donor_family_messages')
        .select(`
          *,
          sender:sender_id (
            id,
            first_name,
            last_name
          ),
          family:family_id (
            id,
            name
          )
        `)
        .eq('thread_id', threadId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const formattedMessages: Message[] = messageData?.map(msg => ({
        id: msg.id,
        senderId: msg.sender_id,
        senderName: `${msg.sender?.first_name} ${msg.sender?.last_name}`,
        senderType: msg.sender_type,
        recipientId: msg.recipient_id,
        subject: msg.subject || '',
        content: msg.content,
        createdAt: new Date(msg.created_at),
        isRead: msg.is_read,
        isApproved: msg.status === 'approved',
        familyId: msg.family_id,
        familyName: msg.family?.name,
        threadId: msg.thread_id,
        status: msg.status
      })) || [];

      setMessages(formattedMessages);

      // Mark messages as read
      markMessagesAsRead(threadId);
    } catch (error) {
      console.error('Error loading thread messages:', error);
    }
  };

  const markMessagesAsRead = async (threadId: string) => {
    if (!user) return;
    
    try {
      await supabase
        .from('donor_family_messages')
        .update({ is_read: true })
        .eq('thread_id', threadId)
        .eq('recipient_id', user.id)
        .eq('is_read', false);

      // Update local state
      setMessages(prev => prev.map(msg => 
        msg.threadId === threadId && msg.recipientId === user.id 
          ? { ...msg, isRead: true }
          : msg
      ));
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!user || !selectedThread || !newMessage.trim()) return;
    
    setSending(true);
    
    try {
      const messageData = {
        sender_id: user.id,
        sender_type: 'donor',
        recipient_id: selectedThread.familyId,
        family_id: selectedThread.familyId,
        thread_id: selectedThread.id,
        content: newMessage.trim(),
        status: 'approved', // Donor messages are auto-approved
        is_read: false,
        created_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('donor_family_messages')
        .insert(messageData);

      if (error) throw error;

      // Update thread's last message time
      await supabase
        .from('donor_family_threads')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', selectedThread.id);

      toast({
        title: "Message sent",
        description: "Your message has been sent successfully"
      });

      setNewMessage("");
      loadThreadMessages(selectedThread.id);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error sending message",
        description: "Failed to send your message",
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };

  const handleApproveMessage = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('donor_family_messages')
        .update({ status: 'approved' })
        .eq('id', messageId);

      if (error) throw error;

      toast({
        title: "Message approved",
        description: "The message has been approved and added to your inbox"
      });

      // Reload data
      loadCommunicationData();
    } catch (error) {
      console.error('Error approving message:', error);
      toast({
        title: "Error approving message",
        description: "Failed to approve the message",
        variant: "destructive"
      });
    }
  };

  const handleRejectMessage = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('donor_family_messages')
        .update({ status: 'rejected' })
        .eq('id', messageId);

      if (error) throw error;

      toast({
        title: "Message rejected",
        description: "The message has been rejected"
      });

      // Reload data
      loadCommunicationData();
    } catch (error) {
      console.error('Error rejecting message:', error);
      toast({
        title: "Error rejecting message",
        description: "Failed to reject the message",
        variant: "destructive"
      });
    }
  };

  const handleArchiveThread = async (threadId: string) => {
    try {
      const { error } = await supabase
        .from('donor_family_threads')
        .update({ is_archived: true })
        .eq('id', threadId);

      if (error) throw error;

      toast({
        title: "Conversation archived",
        description: "The conversation has been archived"
      });

      // Reload threads
      loadCommunicationData();
    } catch (error) {
      console.error('Error archiving thread:', error);
      toast({
        title: "Error archiving conversation",
        description: "Failed to archive the conversation",
        variant: "destructive"
      });
    }
  };

  const filteredThreads = threads.filter(thread => 
    thread.familyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    thread.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-coral-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Communication Center</h1>
        <p className="text-muted-foreground">
          Manage messages with recipient families and clinic staff
        </p>
      </div>

      {/* Privacy Notice */}
      {requiresApproval && (
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Message approval is enabled. New messages from families will appear in the pending tab for your review.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Sidebar - Thread List */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Conversations</CardTitle>
            <div className="mt-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full rounded-none">
                <TabsTrigger value="inbox" className="flex-1">
                  Inbox
                  {threads.filter(t => !t.isArchived && t.unreadCount > 0).length > 0 && (
                    <Badge variant="destructive" className="ml-2">
                      {threads.filter(t => !t.isArchived).reduce((sum, t) => sum + t.unreadCount, 0)}
                    </Badge>
                  )}
                </TabsTrigger>
                {requiresApproval && (
                  <TabsTrigger value="pending" className="flex-1">
                    Pending
                    {pendingMessages.length > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {pendingMessages.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                )}
                <TabsTrigger value="archived" className="flex-1">
                  Archived
                </TabsTrigger>
              </TabsList>

              <TabsContent value="inbox" className="m-0">
                <ScrollArea className="h-[400px]">
                  {filteredThreads.filter(t => !t.isArchived).length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">
                      No active conversations
                    </div>
                  ) : (
                    <div className="divide-y">
                      {filteredThreads.filter(t => !t.isArchived).map((thread) => (
                        <div
                          key={thread.id}
                          className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
                            selectedThread?.id === thread.id ? 'bg-muted' : ''
                          }`}
                          onClick={() => {
                            setSelectedThread(thread);
                            loadThreadMessages(thread.id);
                          }}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="font-medium truncate">{thread.familyName}</p>
                                {thread.unreadCount > 0 && (
                                  <Badge variant="destructive" className="h-5 w-5 p-0 justify-center">
                                    {thread.unreadCount}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground truncate mt-1">
                                {thread.lastMessage}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {formatDistanceToNow(thread.lastMessageDate, { addSuffix: true })}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>

              {requiresApproval && (
                <TabsContent value="pending" className="m-0">
                  <ScrollArea className="h-[400px]">
                    {pendingMessages.length === 0 ? (
                      <div className="p-4 text-center text-muted-foreground">
                        No pending messages
                      </div>
                    ) : (
                      <div className="divide-y">
                        {pendingMessages.map((message) => (
                          <div key={message.id} className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <p className="font-medium">{message.familyName}</p>
                                <p className="text-xs text-muted-foreground">
                                  {format(message.createdAt, 'MMM d, yyyy h:mm a')}
                                </p>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">
                              {message.content.substring(0, 100)}...
                            </p>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleApproveMessage(message.id)}
                              >
                                <Check className="h-3 w-3 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRejectMessage(message.id)}
                              >
                                <X className="h-3 w-3 mr-1" />
                                Reject
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </TabsContent>
              )}

              <TabsContent value="archived" className="m-0">
                <ScrollArea className="h-[400px]">
                  {filteredThreads.filter(t => t.isArchived).length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">
                      No archived conversations
                    </div>
                  ) : (
                    <div className="divide-y">
                      {filteredThreads.filter(t => t.isArchived).map((thread) => (
                        <div
                          key={thread.id}
                          className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => {
                            setSelectedThread(thread);
                            loadThreadMessages(thread.id);
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{thread.familyName}</p>
                              <p className="text-sm text-muted-foreground">
                                {thread.lastMessage.substring(0, 50)}...
                              </p>
                            </div>
                            <Badge variant="secondary">Archived</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Main Content - Message Thread */}
        <Card className="md:col-span-2">
          {selectedThread ? (
            <>
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>
                        <Users className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-base">{selectedThread.familyName}</CardTitle>
                      <CardDescription>Family Connection</CardDescription>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleArchiveThread(selectedThread.id)}>
                        <Archive className="h-4 w-4 mr-2" />
                        Archive conversation
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              
              <CardContent className="p-0">
                <ScrollArea className="h-[400px] p-4">
                  <div className="space-y-4">
                    {messages.map((message) => {
                      const isOwnMessage = message.senderId === user?.id;
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg p-3 ${
                              isOwnMessage
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-xs font-medium">
                                {isOwnMessage ? 'You' : message.senderName}
                              </p>
                              <p className="text-xs opacity-70">
                                {format(message.createdAt, 'h:mm a')}
                              </p>
                              {isOwnMessage && (
                                <div className="ml-auto">
                                  {message.isRead ? (
                                    <CheckCheck className="h-3 w-3" />
                                  ) : (
                                    <Check className="h-3 w-3" />
                                  )}
                                </div>
                              )}
                            </div>
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
                
                <div className="border-t p-4">
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      rows={3}
                      className="flex-1"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || sending}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Press Enter to send, Shift+Enter for new line
                  </p>
                </div>
              </CardContent>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>Select a conversation to view messages</p>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Information */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          All communications are secure and comply with privacy regulations. Messages are only shared
          with authorized recipients based on your privacy settings.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default DonorCommunication;