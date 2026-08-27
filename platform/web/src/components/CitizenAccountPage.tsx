import { BookOpen, ChevronRight, FileWarning, HelpCircle, LogOut, ShieldCheck, Star, UserRoundCheck } from 'lucide-react';
import type { CitizenSession } from '../types';
import vneidLogoUrl from '../../../../assets/images/vneid-logo.png';

interface CitizenAccountPageProps {
  session: CitizenSession | null;
  onLogin: () => void;
  onLogout: () => void;
  onNavigate: (feature: 'reports' | 'feedback') => void;
  onStartTour: () => void;
}

export function CitizenAccountPage({ session, onLogin, onLogout, onNavigate, onStartTour }: CitizenAccountPageProps) {
  return <section className="citizen-account-page" aria-labelledby="citizen-account-title">
    <div className="account-hero">
      <span className="account-avatar">{session ? <UserRoundCheck /> : <img src={vneidLogoUrl} alt="" />}</span>
      <div><p>TÀI KHOẢN NGƯỜI DÂN</p><h1 id="citizen-account-title">{session?.displayName ?? 'Chưa đăng nhập'}</h1><span>{session ? 'Phiên đăng nhập tượng trưng qua VNeID' : 'Đăng nhập để gửi phản ánh, SOS và theo dõi tiến trình'}</span></div>
      <span className={session ? 'account-status active' : 'account-status'}><ShieldCheck size={15} /> {session ? 'Đã đăng nhập' : 'Khách'}</span>
    </div>

    {session ? <div className="account-identity-card">
      <header><img src={vneidLogoUrl} alt="Biểu trưng VNeID" /><div><small>MÃ TÀI KHOẢN THỬ NGHIỆM</small><strong>{session.id}</strong></div></header>
      <dl><div><dt>Họ tên hiển thị</dt><dd>{session.displayName}</dd></div><div><dt>Địa bàn đang sử dụng</dt><dd>Phường Xuân Hương – Đà Lạt</dd></div><div><dt>Xác thực định danh</dt><dd>Đang phát triển kết nối VNeID chính thức</dd></div></dl>
    </div> : <button className="account-login-button" type="button" onClick={onLogin}><img src={vneidLogoUrl} alt="" /> Đăng nhập bằng VNeID <ChevronRight /></button>}

    <nav className="account-actions" aria-label="Tiện ích tài khoản">
      <button type="button" onClick={() => onNavigate('reports')}><span><FileWarning /></span><div><strong>Phản ánh của tôi</strong><small>Gửi mới và theo dõi tiến trình xử lý</small></div><ChevronRight /></button>
      <button type="button" onClick={() => onNavigate('feedback')}><span><Star /></span><div><strong>Đánh giá hài lòng</strong><small>Đánh giá phản ánh đã có kết quả</small></div><ChevronRight /></button>
      <button type="button" onClick={onStartTour}><span><HelpCircle /></span><div><strong>Hướng dẫn sử dụng</strong><small>Xem lại tour các chức năng chính</small></div><ChevronRight /></button>
    </nav>
    <div className="account-privacy-note"><BookOpen /><p><strong>Minh bạch dữ liệu</strong><span>Thông tin tài khoản chỉ dùng trong môi trường thử nghiệm local. Kết nối định danh quốc gia chưa được kích hoạt.</span></p></div>
    {session && <button className="account-logout-button" type="button" onClick={onLogout}><LogOut /> Đăng xuất tài khoản</button>}
  </section>;
}
