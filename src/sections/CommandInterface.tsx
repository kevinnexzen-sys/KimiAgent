import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  Send, 
  Mic, 
  MicOff, 
  Bot, 
  User, 
  Loader2, 
  Sparkles,
  Zap,
  Clock,
  CheckCircle,
  Volume2,
  VolumeX,
  Command
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type?: 'text' | 'automation' | 'error';
  metadata?: any;
}

interface CommandInterfaceProps {
  messages: Message[];
  onSendMessage: (content: string) => void;
  isProcessing: boolean;
  voiceState: {
    isListening: boolean;
    isSpeaking: boolean;
    transcript: string;
    startListening: () => void;
    stopListening: () => void;
    speak: (text: string) => void;
    stopSpeaking: () => void;
    isSupported: boolean;
  };
}

const quickCommands = [
  { icon: Zap, text: 'Send WhatsApp to +1234567890 saying Hello', desc: 'Send message' },
  { icon: Clock, text: 'Every day at 9am check weather', desc: 'Schedule task' },
  { icon: Command, text: 'Download news headlines', desc: 'Fetch data' },
  { icon: Sparkles, text: 'Notify me every hour', desc: 'Set reminder' },
];

export function CommandInterface({ 
  messages, 
  onSendMessage, 
  isProcessing, 
  voiceState 
}: CommandInterfaceProps) {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (voiceState.transcript && !voiceState.isListening) {
      setInput(voiceState.transcript);
    }
  }, [voiceState.transcript, voiceState.isListening]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isProcessing) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const handleVoiceToggle = () => {
    if (voiceState.isListening) {
      voiceState.stopListening();
      if (voiceState.transcript) {
        onSendMessage(voiceState.transcript);
        setInput('');
      }
    } else {
      voiceState.startListening();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Messages Area */}
      <ScrollArea className="flex-1 px-4" ref={scrollRef}>
        <div className="space-y-4 py-4">
          {messages.length === 0 && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg shadow-violet-500/30">
                <Bot className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">
                Your Personal AI Agent
              </h3>
              <p className="text-slate-500 max-w-md mx-auto mb-6">
                I can automate tasks, send messages, schedule reminders, and more. 
                Just tell me what you need!
              </p>
              
              {/* Quick Commands */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg mx-auto">
                {quickCommands.map((cmd, i) => (
                  <button
                    key={i}
                    onClick={() => onSendMessage(cmd.text)}
                    className="flex items-center gap-3 p-3 text-left bg-slate-50 hover:bg-violet-50 hover:border-violet-200 border border-slate-200 rounded-lg transition-all group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-violet-100 group-hover:bg-violet-200 flex items-center justify-center">
                      <cmd.icon className="h-4 w-4 text-violet-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700">{cmd.desc}</p>
                      <p className="text-xs text-slate-400 truncate">{cmd.text.slice(0, 30)}...</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'flex gap-3',
                message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
              )}
            >
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                  message.role === 'user'
                    ? 'bg-gradient-to-br from-blue-500 to-cyan-500'
                    : 'bg-gradient-to-br from-violet-500 to-fuchsia-500'
                )}
              >
                {message.role === 'user' ? (
                  <User className="h-4 w-4 text-white" />
                ) : (
                  <Bot className="h-4 w-4 text-white" />
                )}
              </div>

              <div className={cn('max-w-[80%]', message.role === 'user' ? 'items-end' : 'items-start')}>
                <Card
                  className={cn(
                    'border-0 shadow-sm',
                    message.role === 'user'
                      ? 'bg-gradient-to-br from-blue-500 to-cyan-500 text-white'
                      : message.type === 'error'
                      ? 'bg-red-50 border-red-200'
                      : 'bg-white'
                  )}
                >
                  <CardContent className="p-3">
                    {message.type === 'automation' && (
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="h-4 w-4 text-violet-500" />
                        <Badge variant="secondary" className="text-xs">Automation</Badge>
                      </div>
                    )}
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    {message.metadata?.automationId && (
                      <div className="mt-2 pt-2 border-t border-slate-100">
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          Created: {message.metadata.automationId}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
                <span className="text-xs text-slate-400 mt-1 block">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}

          {isProcessing && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <Card className="border-0 shadow-sm bg-white">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-violet-500" />
                    <span className="text-sm text-slate-600">Processing your request...</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 border-t border-slate-200 bg-white">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={voiceState.isListening ? 'Listening... Speak now' : 'Type your command...'}
              disabled={isProcessing}
              className="pr-10 h-12"
            />
            {voiceState.isListening && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2">
                <span className="flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
              </span>
            )}
          </div>
          
          {voiceState.isSupported && (
            <Button
              type="button"
              variant={voiceState.isListening ? 'destructive' : 'outline'}
              size="icon"
              onClick={handleVoiceToggle}
              disabled={isProcessing}
              className={cn(
                'h-12 w-12 transition-all',
                voiceState.isListening && 'animate-pulse'
              )}
            >
              {voiceState.isListening ? (
                <MicOff className="h-5 w-5" />
              ) : (
                <Mic className="h-5 w-5" />
              )}
            </Button>
          )}
          
          <Button
            type="submit"
            disabled={!input.trim() || isProcessing}
            className="h-12 px-6 bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600"
          >
            {isProcessing ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </form>
        
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-slate-400">
            {voiceState.isSupported 
              ? 'Click microphone for voice commands' 
              : 'Voice commands not supported'}
          </p>
          
          {messages.length > 0 && messages[messages.length - 1].role === 'assistant' && (
            <button
              onClick={() => {
                const lastMessage = messages[messages.length - 1];
                if (lastMessage.role === 'assistant') {
                  voiceState.speak(lastMessage.content);
                }
              }}
              className="text-xs text-violet-500 hover:text-violet-600 flex items-center gap-1"
            >
              {voiceState.isSpeaking ? (
                <><VolumeX className="h-3 w-3" /> Stop</>
              ) : (
                <><Volume2 className="h-3 w-3" /> Read</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
