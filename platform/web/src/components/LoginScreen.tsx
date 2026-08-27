import { FormEvent, useEffect, useRef, useState } from 'react';
import { ArrowLeft, Eye, EyeOff, LogIn, ShieldCheck, UserCheck, Users, ArrowRight } from 'lucide-react';
import { ApiError, signInCitizen, signInOfficer } from '../api';
import type { CitizenSession, WorkflowActor } from '../types';
import directoryLogoUrl from '../../../../assets/images/logo-128.png';
import vneidLogoUrl from '../../../../assets/images/vneid-logo.png';

interface LoginScreenProps {
  onEnterAsCitizen: () => void;
  onCitizenLoginSuccess: (session: CitizenSession) => void;
  onOfficerLoginSuccess: (actor: WorkflowActor) => void;
}

export function LoginScreen({ onEnterAsCitizen, onCitizenLoginSuccess, onOfficerLoginSuccess }: LoginScreenProps) {
  const [view, setView] = useState<'roles' | 'citizen-login' | 'officer-login'>('roles');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const usernameRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (view === 'officer-login' || view === 'citizen-login') {
      setTimeout(() => usernameRef.current?.focus({ preventScroll: true }), 50);
    }
  }, [view]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const actor = await signInOfficer(username, password);
      setError('');
      onOfficerLoginSuccess(actor);
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : 'Không thể kết nối hệ thống xác thực.');
    } finally {
      setSubmitting(false);
    }
  };

  const submitCitizen = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const phone = username.replace(/\s/g, '');
    if (!/^0\d{9}$/.test(phone)) {
      setError('Số điện thoại phải gồm 10 chữ số và bắt đầu bằng số 0.');
      return;
    }
    if (!password) {
      setError('Vui lòng nhập mật khẩu.');
      return;
    }
    setSubmitting(true);
    try {
      const session = await signInCitizen(phone, password);
      setError('');
      onCitizenLoginSuccess(session);
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : 'Không thể kết nối hệ thống đăng nhập.');
    } finally {
      setSubmitting(false);
    }
  };

  const backToRoles = () => {
    setView('roles'); setError(''); setUsername(''); setPassword('');
  };

  return (
    <main className="login-screen" aria-label="Chọn vai trò đăng nhập">
      <div className="login-screen-inner">

        <header className="login-brand">
          <div className="login-brand-logo">
            <img src={directoryLogoUrl} alt="Logo Công an Lâm Đồng" width="64" height="64" />
          </div>
          <div className="login-brand-text">
            <strong>Công an tỉnh Lâm Đồng</strong>
            <span>Nền tảng dịch vụ công an địa bàn</span>
          </div>
        </header>

        {view === 'roles' && (
          <>
            <section className="login-role-section" aria-labelledby="role-heading">
              <p id="role-heading" className="login-role-heading">Bạn đang truy cập với tư cách?</p>
              <div className="login-role-cards">

                <button className="login-role-card citizen" type="button" onClick={onEnterAsCitizen}>
                  <div className="role-card-icon"><Users size={30} aria-hidden="true" /></div>
                  <div className="role-card-body">
                    <strong>Người dân</strong>
                    <span>Tra cứu địa bàn, gửi phản ánh và cầu cứu khẩn cấp</span>
                  </div>
                  <div className="role-card-arrow"><ArrowRight size={20} aria-hidden="true" /></div>
                </button>

                <button className="login-role-card officer" type="button" onClick={() => setView('officer-login')}>
                  <div className="role-card-icon"><ShieldCheck size={30} aria-hidden="true" /></div>
                  <div className="role-card-body">
                    <strong>Cán bộ Công an</strong>
                    <span>Cổng nghiệp vụ địa bàn CSKV</span>
                  </div>
                  <div className="role-card-arrow"><ArrowRight size={20} aria-hidden="true" /></div>
                </button>

              </div>
            </section>

            <div className="login-divider"><span>hoặc đăng nhập qua</span></div>

            <div className="login-vneid-section">
              <button className="login-vneid-button" type="button" onClick={() => setView('citizen-login')}>
                <div className="vneid-icon">
                  <img src={vneidLogoUrl} alt="VNeID" width="36" height="36" style={{ borderRadius: '8px' }} />
                </div>
                <div className="vneid-body">
                  <strong>Đăng nhập VNeID</strong>
                  <span>Dùng số điện thoại và mật khẩu bản mô phỏng</span>
                </div>
                <ArrowRight size={19} aria-hidden="true" />
              </button>
              <p className="vneid-notice">
                <UserCheck size={13} aria-hidden="true" />
                Chỉ mô phỏng giao diện. Kết nối và xác thực VNeID thật sẽ được phát triển sau.
              </p>
            </div>
          </>
        )}

        {view === 'citizen-login' && (
          <div className="citizen-inline-login-panel">
            <button className="officer-login-back" type="button" onClick={backToRoles}>
              <ArrowLeft size={16} aria-hidden="true" /> Quay lại
            </button>
            <div className="citizen-inline-login-header">
              <img src={vneidLogoUrl} alt="VNeID" width="58" height="58" />
              <div><p>VNEID · BẢN MÔ PHỎNG</p><h2>Đăng nhập người dân</h2></div>
            </div>
            <p className="officer-login-lead">Nhập số điện thoại và mật khẩu thử nghiệm. Hệ thống chưa kết nối VNeID thật.</p>
            <form className="officer-login-form" onSubmit={submitCitizen} noValidate>
              <label htmlFor="ls-citizen-phone">Số điện thoại
                <input ref={usernameRef} id="ls-citizen-phone" name="username" type="tel" inputMode="numeric" autoComplete="tel" maxLength={10} placeholder="0912345678" value={username} onChange={(event) => { setUsername(event.target.value.replace(/[^0-9 ]/g, '')); setError(''); }} aria-invalid={Boolean(error)} required />
              </label>
              <div className="officer-password-field">
                <label htmlFor="ls-citizen-password">Mật khẩu</label>
                <span className="officer-password-wrap">
                  <input id="ls-citizen-password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={(event) => { setPassword(event.target.value); setError(''); }} aria-invalid={Boolean(error)} required />
                  <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                </span>
              </div>
              {error && <p className="officer-login-error" role="alert">{error}</p>}
              <button className="citizen-inline-login-submit" type="submit" disabled={submitting}><LogIn size={19} /> {submitting ? 'Đang xác thực…' : 'Đăng nhập'}</button>
            </form>
          </div>
        )}

        {view === 'officer-login' && (
          <div className="officer-login-panel">
            <button
              className="officer-login-back"
              type="button"
              onClick={backToRoles}
            >
              <ArrowLeft size={16} aria-hidden="true" />
              Quay lại
            </button>

            <div className="officer-login-header">
              <div className="officer-login-icon"><ShieldCheck size={28} aria-hidden="true" /></div>
              <div>
                <p>Cổng nghiệp vụ địa bàn</p>
                <h2>Đăng nhập CSKV</h2>
              </div>
            </div>

            <p className="officer-login-lead">Chỉ cán bộ đã đăng nhập mới có thể xem hàng đợi SOS và phản ánh của địa bàn.</p>

            <form className="officer-login-form" onSubmit={submit} noValidate>
              <label htmlFor="ls-username">Tên đăng nhập
                <input
                  ref={usernameRef}
                  id="ls-username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); setError(''); }}
                  aria-invalid={Boolean(error)}
                  required
                />
              </label>

              <div className="officer-password-field">
                <label htmlFor="ls-password">Mật khẩu</label>
                <span className="officer-password-wrap">
                  <input
                    id="ls-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(''); }}
                    aria-invalid={Boolean(error)}
                    required
                  />
                  <button type="button" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}>
                    {showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
                  </button>
                </span>
              </div>

              {error && <p className="officer-login-error" role="alert">{error}</p>}

              <button className="officer-login-submit" type="submit" disabled={submitting}>
                <LogIn size={19} aria-hidden="true" /> {submitting ? 'Đang xác thực…' : 'Đăng nhập vào cổng CSKV'}
              </button>
            </form>
          </div>
        )}

        <footer className="login-footer">
          <p>© 2026 Công an tỉnh Lâm Đồng · Dữ liệu được bảo vệ theo pháp luật</p>
        </footer>

      </div>
    </main>
  );
}
