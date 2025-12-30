import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface CommentFiltersProps {
    searchTerm: string;
    setSearchTerm: (value: string) => void;
}

export function CommentFilters({
    searchTerm,
    setSearchTerm,
}: CommentFiltersProps) {
    return (
        <Card className="p-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <div className="flex-1">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                            type="text"
                            placeholder="Tìm kiếm theo nội dung bình luận..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>
            </div>
        </Card>
    );
}
