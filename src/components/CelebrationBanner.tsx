import { Sparkles } from 'lucide-react';

type CelebrationBannerProps = {
  message: string | null;
};

export function CelebrationBanner({ message }: CelebrationBannerProps) {
  return (
    <div
      className={message ? 'celebration visible' : 'celebration'}
      role="status"
      aria-label="도형 변신 알림"
      aria-live="polite"
    >
      <Sparkles size={22} aria-hidden="true" />
      <span className="celebration-message">{message ?? ''}</span>
    </div>
  );
}
