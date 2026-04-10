import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  Code2, 
  Copy, 
  Download, 
  CheckCircle,
  FileCode,
  Terminal
} from 'lucide-react';

interface CodeViewerProps {
  code: string;
  language?: string;
}

export function CodeViewer({ code, language = 'javascript' }: CodeViewerProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'automation.js';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!code) {
    return (
      <Card className="h-full border-dashed border-2">
        <CardContent className="flex flex-col items-center justify-center h-full py-12">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <Code2 className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-600 mb-2">
            No Code Generated Yet
          </h3>
          <p className="text-sm text-slate-400 text-center max-w-xs">
            Ask me to create a code-based automation and I'll generate it for you
          </p>
        </CardContent>
      </Card>
    );
  }

  // Simple syntax highlighting
  const highlightCode = (code: string) => {
    return code
      .replace(/(\/\/.*$)/gm, '<span class="text-slate-500">$1</span>')
      .replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="text-slate-500">$1</span>')
      .replace(/\b(const|let|var|function|async|await|return|if|else|try|catch|throw|new|import|from|export|default|class|extends)\b/g, '<span class="text-purple-400">$1</span>')
      .replace(/\b(true|false|null|undefined)\b/g, '<span class="text-orange-400">$1</span>')
      .replace(/('[^']*'|"[^"]*"|`[^`]*`)/g, '<span class="text-green-400">$1</span>')
      .replace(/\b(\d+)\b/g, '<span class="text-blue-400">$1</span>')
      .replace(/\b(console|fetch|JSON|Math|Date|Array|Object|String|Number|Boolean|Promise|Error)\b/g, '<span class="text-cyan-400">$1</span>');
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="border-b border-slate-100 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCode className="h-5 w-5 text-violet-500" />
            <CardTitle className="text-lg">Generated Code</CardTitle>
            <Badge variant="secondary" className="text-xs uppercase">
              {language}
            </Badge>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCopy}>
              {copied ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </>
              )}
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-1" />
              Download
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <ScrollArea className="flex-1">
        <CardContent className="p-0">
          <div className="relative">
            <div className="absolute left-0 top-0 bottom-0 w-12 bg-slate-900 border-r border-slate-700">
              {code.split('\n').map((_, i) => (
                <div 
                  key={i} 
                  className="h-6 text-right pr-2 text-xs text-slate-500 leading-6"
                >
                  {i + 1}
                </div>
              ))}
            </div>
            <pre className="pl-14 pr-4 py-4 bg-slate-900 text-slate-100 text-sm font-mono leading-6 overflow-x-auto">
              <code 
                dangerouslySetInnerHTML={{ __html: highlightCode(code) }}
              />
            </pre>
          </div>
        </CardContent>
      </ScrollArea>
      
      <div className="p-3 border-t border-slate-100 bg-slate-50">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Terminal className="h-4 w-4" />
          <span>Run with: </span>
          <code className="px-2 py-0.5 bg-slate-200 rounded text-slate-700">
            node automation.js
          </code>
        </div>
      </div>
    </Card>
  );
}
