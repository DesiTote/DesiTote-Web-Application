import { LucideIcon } from "lucide-react";

interface Props {
    icon: LucideIcon;
    title: string;
    subtitle: string;
}

export default function ShippingCard({
    icon: Icon,
    title,
    subtitle,
}: Props) {
    return (
        <div
            className="
            rounded-2xl
            border
            p-4
            flex
            gap-4
            items-center
            hover:shadow-md
            transition
        "
        >
            <Icon className="h-6 w-6 text-pink-600" />

            <div>

                <h4 className="font-semibold">
                    {title}
                </h4>

                <p className="text-sm text-muted-foreground">
                    {subtitle}
                </p>

            </div>
        </div>
    );
}