import { MessageSquare, Search, Star, Trash2 } from "lucide-react";

const ConversationSidebar = ({ 
  conversations, 
  currentConversationId, 
  onSelectConversation, 
  onNewConversation,
  onDeleteConversation,
  onToggleStar,
  searchQuery,
  onSearchChange
}: {
  conversations: {
    id: string;
    title: string;
    preview: string;
    messageCount: number;
    lastMessage: Date;
    tags: string[];
    isStarred: boolean;
  }[];
  currentConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
  onToggleStar: (id: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}) => (
  <div className="w-80 bg-sand-50/50 border-r-2 border-sand-200 p-4 flex flex-col h-full">
    {/* Header */}
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-display font-bold text-stone-800 flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-sun" />
        Conversations
      </h2>
      <button
        onClick={onNewConversation}
        className="px-3 py-1.5 bg-sun text-white rounded-cartouche text-sm font-semibold hover:bg-sun/90 transition-colors"
      >
        New
      </button>
    </div>

    {/* Search */}
    <div className="relative mb-4">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-stone-400" />
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search conversations..."
        className="w-full pl-10 pr-4 py-2 border border-sand-300 rounded-cartouche bg-white text-sm focus:border-sun focus:ring-2 focus:ring-sun/20 outline-none"
      />
    </div>

    {/* Conversation List */}
    <div className="flex-1 overflow-y-auto space-y-2">
      {conversations.map((conv) => (
        <div
          key={conv.id}
          onClick={() => onSelectConversation(conv.id)}
          className={`p-3 rounded-cartouche border cursor-pointer transition-all hover:shadow-md ${
            currentConversationId === conv.id
              ? 'bg-sun/10 border-sun/30'
              : 'bg-white border-sand-200 hover:bg-sand-50'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-sm text-stone-800 truncate flex-1">
              {conv.title}
            </h3>
            <div className="flex items-center gap-1">
              {conv.isStarred && (
                <Star className="h-3 w-3 text-sun fill-current" aria-hidden="true" />
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleStar(conv.id);
                }}
                className="p-1 hover:bg-stone-200 rounded"
                aria-label={`Toggle star for ${conv.title}`}
                title={`Toggle star for ${conv.title}`}
              >
                <Star className={`h-3 w-3 ${conv.isStarred ? 'text-sun fill-current' : 'text-stone-400'}`} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteConversation(conv.id);
                }}
                className="p-1 hover:bg-red-100 text-red-500 rounded"
                aria-label={`Delete conversation ${conv.title}`}
                title={`Delete conversation ${conv.title}`}
              >
                <Trash2 className="h-3 w-3" aria-hidden="true" />
              </button>
            </div>
          </div>
          <p className="text-xs text-stone-600 line-clamp-2">{conv.preview}</p>
          <div className="flex items-center justify-between mt-2 text-xs text-stone-500">
            <span>{conv.messageCount} messages</span>
            <span>{new Date(conv.lastMessage).toISOString().slice(0, 10)}</span>
          </div>
        </div>
      ))}
    </div>
  </div>
);
export default ConversationSidebar;