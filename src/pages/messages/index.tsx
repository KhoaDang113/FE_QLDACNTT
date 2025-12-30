import { useState } from "react";
import { Input } from "@/components/ui/input";
import { ConversationList } from "@/components/messages/ConversationList";
import { Search } from "lucide-react";

export default function MessagesPage() {
  const [search, setSearch] = useState("");

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-br from-green-50 via-blue-50 to-emerald-50">
      {/* Content */}
      <div className="flex-1 overflow-auto p-4 pt-1">
        <div className="space-y-6 max-w-7xl">
          {/* Search and Filters */}
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo tên user, email..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Conversations List */}
          <ConversationList search={search} />
        </div>
      </div>
    </div>
  );
}
