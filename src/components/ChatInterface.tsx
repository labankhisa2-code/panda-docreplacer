import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Send, Loader2 } from "lucide-react";

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

interface ChatInterfaceProps {
  currentUserId: string;
  otherUserId: string;
  otherUserName: string;
}

const ChatInterface = ({ currentUserId, otherUserId, otherUserName }: ChatInterfaceProps) => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages();
    subscribeToMessages();
  }, [currentUserId, otherUserId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${currentUserId})`)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setMessages(data || []);

      // Mark received messages as read
      await markAsRead();
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel("messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `receiver_id=eq.${currentUserId}`,
        },
        (payload) => {
          if (payload.new.sender_id === otherUserId) {
            setMessages((prev) => [...prev, payload.new as Message]);
            markAsRead();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const markAsRead = async () => {
    try {
      await supabase
        .from("messages")
        .update({ is_read: true })
        .eq("receiver_id", currentUserId)
        .eq("sender_id", otherUserId)
        .eq("is_read", false);
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      const { error } = await supabase.from("messages").insert([
        {
          sender_id: currentUserId,
          receiver_id: otherUserId,
          content: newMessage.trim(),
        },
      ]);

      if (error) throw error;

      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card className="flex flex-col h-[600px] bg-card border-border">
      {/* Chat Header */}
      <div className="p-4 border-b border-border bg-gradient-primary">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback className="bg-accent text-accent-foreground">
              {getInitials(otherUserName)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-primary-foreground">{otherUserName}</h3>
            <p className="text-xs text-primary-foreground/80">Online</p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No messages yet. Start the conversation!
            </div>
          ) : (
            messages.map((message) => {
              const isSent = message.sender_id === currentUserId;
              return (
                <div
                  key={message.id}
                  className={`flex ${isSent ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      isSent
                        ? "bg-gradient-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        isSent ? "text-primary-foreground/70" : "text-muted-foreground"
                      }`}
                    >
                      {new Date(message.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>

      {/* Message Input */}
      <form onSubmit={sendMessage} className="p-4 border-t border-border bg-background">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            disabled={sending}
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={sending || !newMessage.trim()}
            className="bg-gradient-primary hover:opacity-90 text-primary-foreground"
          >
            {sending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default ChatInterface;
