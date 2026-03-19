'use client';

interface Props {
  courseId: string;
  isFree: boolean;
  onEnroll: () => void;
  isLoading: boolean;
}

export function EnrollButton({ courseId, isFree, onEnroll, isLoading }: Props) {
  return (
    <button
      onClick={onEnroll}
      disabled={isLoading}
      className="w-full sm:w-auto rounded-lg bg-[#C9A227] px-8 py-3 text-sm
                 font-semibold text-[#0E1B2A] hover:bg-[#C9A227]/90
                 transition-colors disabled:opacity-50"
    >
      {isLoading ? 'Enrolling...' : isFree ? 'Enroll for Free' : 'Enroll Now'}
    </button>
  );
}
