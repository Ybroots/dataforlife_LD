import { ChevronRight } from 'lucide-react';
import vneidLogoUrl from '../../../../assets/images/vneid-logo.png';

interface VneIdLoginPromptProps {
  action: string;
  onLogin: () => void;
  compact?: boolean;
}

export function VneIdLoginPrompt({ action, onLogin, compact = false }: VneIdLoginPromptProps) {
  return (
    <aside className={compact ? 'vneid-access-prompt compact' : 'vneid-access-prompt'} aria-label="Yêu cầu đăng nhập VNeID mô phỏng">
      <img src={vneidLogoUrl} alt="VNeID" width="46" height="46" />
      <span><strong>Đăng nhập để {action}</strong><small>Bản mô phỏng bằng số điện thoại và mật khẩu.</small></span>
      <button type="button" onClick={onLogin}><span>Đăng nhập</span><ChevronRight size={18} aria-hidden="true" /></button>
    </aside>
  );
}
