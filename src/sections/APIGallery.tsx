import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Search, 
  Cloud, 
  Newspaper, 
  MessageSquare, 
  Languages, 
  QrCode, 
  Link,
  Database,
  Github,
  Mail,
  Twitter,
  Zap
} from 'lucide-react';
import { freeAPIs } from '@/lib/apiIntegrations';
import { cn } from '@/lib/utils';

const categoryIcons = {
  social: Twitter,
  productivity: Zap,
  data: Database,
  communication: MessageSquare,
  utility: Cloud,
};

const categoryColors = {
  social: 'bg-blue-100 text-blue-700',
  productivity: 'bg-green-100 text-green-700',
  data: 'bg-purple-100 text-purple-700',
  communication: 'bg-orange-100 text-orange-700',
  utility: 'bg-cyan-100 text-cyan-700',
};

const apiIcons: Record<string, typeof Zap> = {
  openweather: Cloud,
  newsapi: Newspaper,
  'discord-webhook': MessageSquare,
  libretranslate: Languages,
  qrserver: QrCode,
  cleanuri: Link,
  jsonplaceholder: Database,
  'github-api': Github,
  sendgrid: Mail,
  'twitter-api': Twitter,
};

export function APIGallery() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredAPIs = freeAPIs.filter(api => {
    const matchesSearch = 
      api.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      api.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory ? api.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(freeAPIs.map(api => api.category)));

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="h-5 w-5 text-violet-500" />
          <CardTitle className="text-lg">Free API Integrations</CardTitle>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search APIs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <div className="flex flex-wrap gap-2 mt-3">
          <button
            onClick={() => setSelectedCategory(null)}
            className={cn(
              'px-3 py-1 text-xs rounded-full transition-colors',
              selectedCategory === null
                ? 'bg-violet-500 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            )}
          >
            All
          </button>
          {categories.map(category => {
            const Icon = categoryIcons[category];
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category === selectedCategory ? null : category)}
                className={cn(
                  'px-3 py-1 text-xs rounded-full transition-colors flex items-center gap-1 capitalize',
                  selectedCategory === category
                    ? 'bg-violet-500 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                )}
              >
                <Icon className="h-3 w-3" />
                {category}
              </button>
            );
          })}
        </div>
      </CardHeader>
      
      <ScrollArea className="flex-1">
        <CardContent className="p-4">
          <div className="space-y-3">
            {filteredAPIs.map(api => {
              const Icon = apiIcons[api.id] || Zap;
              
              return (
                <div
                  key={api.id}
                  className="p-3 rounded-lg border border-slate-200 hover:border-violet-300 hover:shadow-sm transition-all cursor-pointer group"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center flex-shrink-0">
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-slate-800 text-sm">
                          {api.name}
                        </h4>
                        <Badge 
                          variant="secondary" 
                          className={cn('text-xs capitalize', categoryColors[api.category])}
                        >
                          {api.category}
                        </Badge>
                        {api.isFree && (
                          <Badge variant="outline" className="text-xs text-green-600 border-green-200">
                            FREE
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-xs text-slate-500 mb-2">
                        {api.description}
                      </p>
                      
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <span className="font-medium">{api.endpoints.length}</span> endpoints
                        </span>
                        <span>•</span>
                        <span>{api.authType === 'none' ? 'No auth' : api.authType}</span>
                        {api.rateLimit && (
                          <>
                            <span>•</span>
                            <span className="text-amber-600">{api.rateLimit}</span>
                          </>
                        )}
                      </div>
                      
                      <div className="mt-2 flex flex-wrap gap-1">
                        {api.endpoints.slice(0, 3).map((endpoint, i) => (
                          <span 
                            key={i}
                            className="text-xs px-2 py-0.5 bg-slate-100 rounded text-slate-600"
                          >
                            {endpoint.method} {endpoint.name}
                          </span>
                        ))}
                        {api.endpoints.length > 3 && (
                          <span className="text-xs px-2 py-0.5 bg-slate-100 rounded text-slate-500">
                            +{api.endpoints.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {filteredAPIs.length === 0 && (
              <div className="text-center py-8">
                <p className="text-sm text-slate-400">No APIs found matching your search</p>
              </div>
            )}
          </div>
        </CardContent>
      </ScrollArea>
    </Card>
  );
}
