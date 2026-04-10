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
  Play, 
  Code, 
  Workflow,
  CheckCircle,
  Volume2,
  VolumeX
} from 'lucide-react';
import type { Message, AutomationTask } from '@/types';
import { cn } from '@/lib/utils';

interface ChatInterfaceProps {
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
  currentTask: AutomationTask | null;
}

export function ChatInterface({ 
  messages, 
  onSendMessage, 
  isProcessing, 
  voiceState,
  currentTask 
}: ChatInterfaceProps) {
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

  const getMessageIcon = (type?: string) => {
    switch (type) {
      case 'automation':
        return <Play className="h-4 w-4" />;
      case 'workflow':
        return <Workflow className="h-4 w-4" />;
      case 'code':
        return <Code className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <ScrollArea className="flex-1 px-4" ref={scrollRef}>
        <div className="space-y-4 py-4">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <Bot className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">
                AI Automation Agent
              </h3>
              <p className="text-slate-500 max-w-md mx-auto mb-6">
                I can create automations for you using chat or voice commands. 
                Just tell me what you want to automate!
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {[
                  'Send me daily weather updates',
                  'Post tweets automatically',
                  'Create a Discord notification bot',
                  'Fetch news and save to file',
                  'Translate text automatically',
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => onSendMessage(suggestion)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm rounded-full transition-colors"
                  >
                    {suggestion}
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
                      : 'bg-white'
                  )}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 mb-1">
                      {getMessageIcon(message.type)}
                      {message.type && message.type !== 'text' && (
                        <Badge 
                          variant="secondary" 
                          className={cn(
                            'text-xs',
                            message.role === 'user' && 'bg-white/20 text-white'
                          )}
                        >
                          {message.type}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </CardContent>
                </Card>
                
                {message.metadata && message.role === 'assistant' && (
                  <div className="mt-2 space-y-2">
                    {message.metadata.automationId && (
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        Automation created: {message.metadata.automationId}
                      </div>
                    )}
                  </div>
                )}

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
                    <span className="text-sm text-slate-600">Thinking...</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Current Task Status */}
      {currentTask && currentTask.status === 'running' && (
        <div className="px-4 py-2 bg-slate-50 border-t border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-violet-500" />
              <span className="text-sm font-medium text-slate-700">
                {currentTask.name}
              </span>
            </div>
            <Badge variant="secondary" className="text-xs">
              {currentTask.progress}%
            </Badge>
          </div>
          <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-300"
              style={{ width: `${currentTask.progress}%` }}
            />
          </div>
          {currentTask.logs.length > 0 && (
            <p className="text-xs text-slate-500 mt-1">
              {currentTask.logs[currentTask.logs.length - 1]}
            </p>
          )}
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 border-t border-slate-200 bg-white">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={voiceState.isListening ? 'Listening...' : 'Type your automation request...'}
              disabled={isProcessing}
              className="pr-10"
            />
            {voiceState.isListening && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2">
                <span className="flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
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
                'transition-all',
                voiceState.isListening && 'animate-pulse'
              )}
            >
              {voiceState.isListening ? (
                <MicOff className="h-4 w-4" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </Button>
          )}
          
          <Button
            type="submit"
            disabled={!input.trim() || isProcessing}
            className="bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600"
          >
            {isProcessing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
        
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-slate-400">
            {voiceState.isSupported 
              ? 'Click the microphone to use voice commands' 
              : 'Voice commands not supported in this browser'}
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
                <>
                  <VolumeX className="h-3 w-3" />
                  Stop speaking
                </>
              ) : (
                <>
                  <Volume2 className="h-3 w-3" />
                  Read aloud
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
