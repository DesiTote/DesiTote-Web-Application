import { Badge } from "@/components/ui/badge";

export default function ProductStatusBadge({
    status,
}: {
    status: string;
}) {
    if (status === "ACTIVE") {
        return (
            <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100">
                Active
            </Badge>
        );
    }

    if (status === "DRAFT") {
        return (
            <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-100">
                Draft
            </Badge>
        );
    }

    return (
        <Badge className="bg-red-100 text-red-700 border-red-200 hover:bg-red-100">
            Archived
        </Badge>
    );
}