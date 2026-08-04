// components/skeletons/BaseSkeleton.tsx

export default function BaseSkeleton({
    className,
}: {
    className?: string;
}) {
    return (
        <div className={`relative overflow-hidden bg-[#1B2A41]/8 rounded-md ${className}`}>
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-linear-to-r from-transparent via-white/50 to-transparent" />
        </div>
    );
}