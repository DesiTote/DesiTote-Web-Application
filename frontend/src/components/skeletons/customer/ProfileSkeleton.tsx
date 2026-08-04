// components/skeletons/ProfileSkeleton.tsx
import BaseSkeleton from "../BaseSkeleton";
import PageContainer from "@/components/shared/PageContainer";

// Bug fix: this previously rendered its own standalone min-h-screen layout
// with a hardcoded bg color and pt-24 (assuming a fixed navbar), instead of
// matching the real ProfilePage's PageContainer + padding. That mismatch
// meant the loading → loaded transition could visibly jump. Now it uses the
// exact same wrapper/classes as the loaded state.
//
// Also removed the redundant `bg-slate-200` passed into every BaseSkeleton
// — BaseSkeleton already sets its own themed background internally, and
// having two same-specificity bg-* utilities in one className is fragile
// (whichever wins depends on generated CSS order, not source order).

export default function ProfileSkeleton() {
  return (
    <PageContainer className="py-10 pb-24 antialiased">
      <div className="space-y-6">

        {/* Header Title Placement */}
        <div className="space-y-2">
          <BaseSkeleton className="h-7 w-48" />
          <BaseSkeleton className="h-4 w-96" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">

          {/* Sidebar Card Blueprint */}
          <div className="bg-[#FBF8F1] rounded-2xl border border-[#1B2A41]/10 p-5 space-y-6 shadow-sm">
            <div className="flex flex-col items-center text-center gap-3">
              <BaseSkeleton className="w-16 h-16 rounded-2xl" />
              <BaseSkeleton className="h-4 w-32" />
              <BaseSkeleton className="h-3 w-40" />
            </div>
            <div className="space-y-2 pt-2 border-t border-[#1B2A41]/10">
              <BaseSkeleton className="h-9 w-full rounded-xl" />
              <BaseSkeleton className="h-9 w-full rounded-xl" />
              <BaseSkeleton className="h-9 w-full rounded-xl" />
            </div>
          </div>

          {/* Main Info Box Blueprint Area */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-[#FBF8F1] rounded-2xl border border-[#1B2A41]/10 p-6 space-y-6 shadow-sm">
              <div className="space-y-2 pb-2 border-b border-[#1B2A41]/10">
                <BaseSkeleton className="h-5 w-40" />
                <BaseSkeleton className="h-3 w-64" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <BaseSkeleton className="h-3 w-16" />
                  <BaseSkeleton className="h-11 w-full rounded-xl" />
                </div>
                <div className="space-y-2">
                  <BaseSkeleton className="h-3 w-16" />
                  <BaseSkeleton className="h-11 w-full rounded-xl" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <BaseSkeleton className="h-3 w-24" />
                  <BaseSkeleton className="h-11 w-full rounded-xl" />
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </PageContainer>
  );
}