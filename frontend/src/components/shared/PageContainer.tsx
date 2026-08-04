type Props = {
    children: React.ReactNode;
    className?: string;
};

export default function PageContainer({
    children,
    className = "",
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div className={`w-full px-6 md:px-16 lg:px-24 ${className}`}>
            {children}
        </div>
    );
}