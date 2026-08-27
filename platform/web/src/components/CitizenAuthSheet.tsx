import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from 'react';
import { Eye, EyeOff, LogIn, X } from 'lucide-react';
import { ApiError, signInCitizen } from '../api';
import type { CitizenSession } from '../types';
import vneidLogoUrl from '../../../../assets/images/vneid-logo.png';

interface CitizenAuthSheetProps {
  open: boolean;
  action: string;
  onClose: () => void;
  onSuccess: (session: CitizenSession) => void;
}

export function CitizenAuthSheet({ open, action, onClose, onSuccess }: CitizenAuthSheetProps) {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const sheetRef = useRef<HTMLElement | null>(null);
  const phoneRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!open) return;
    setError('');
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.setTimeout(() => phoneRef.current?.focus({ preventScroll: true }), 180);
    return () => { document.body.style.overflow = previousOverflow; };
  }, [open]);

  if (!open) return null;

  const handleKeys = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Escape') onClose();
    if (event.key !== 'Tab' || !sheetRef.current) return;
    const items = [...sheetRef.current.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled)')];
    if (!items.length) return;
    const first = items[0]!; const last = items.at(-1)!;
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedPhone = phone.replace(/\s/g, '');
    if (!/^0\d{9}$/.test(normalizedPhone)) { setError('Số điện thoại phải gồm 10 chữ số và bắt đầu bằng số 0.'); return; }
    if (!password) { setError('Vui lòng nhập mật khẩu.'); return; }
    setSubmitting(true); setError('');
    try { onSuccess(await signInCitizen(normalizedPhone, password)); }
    catch (caught) { setError(caught instanceof ApiError ? caught.message : 'Không thể kết nối hệ thống đăng nhập.'); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="citizen-auth-layer">
      <button className="citizen-auth-scrim" type="button" onClick={onClose} aria-label="Đóng đăng nhập" />
      <section ref={sheetRef} className="citizen-auth-sheet" role="dialog" aria-modal="true" aria-labelledby="citizen-auth-sheet-title" tabIndex={-1} onKeyDown={handleKeys}>
        <span className="citizen-auth-grip" aria-hidden="true" />
        <header>
          <img src={vneidLogoUrl} alt="VNeID" width="54" height="54" />
          <div><small>VNEID · BẢN MÔ PHỎNG</small><h2 id="citizen-auth-sheet-title">Đăng nhập để {action}</h2></div>
          <button type="button" onClick={onClose} aria-label="Đóng"><X size={21} aria-hidden="true" /></button>
        </header>
        <form className="citizen-auth-form" onSubmit={submit} noValidate>
          <label htmlFor="auth-sheet-phone">Số điện thoại
            <input ref={phoneRef} id="auth-sheet-phone" name="username" type="tel" inputMode="numeric" autoComplete="tel" maxLength={10} placeholder="0912345678" value={phone} onChange={(event) => { setPhone(event.target.value.replace(/[^0-9 ]/g, '')); setError(''); }} aria-invalid={Boolean(error)} required />
          </label>
          <label htmlFor="auth-sheet-password">Mật khẩu
            <span className="citizen-password-field"><input id="auth-sheet-password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={(event) => { setPassword(event.target.value); setError(''); }} aria-invalid={Boolean(error)} required /><button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></span>
          </label>
          {error && <p role="alert">{error}</p>}
          <button className="citizen-auth-submit" type="submit" disabled={submitting}><LogIn size={19} aria-hidden="true" />{submitting ? 'Đang xác thực…' : 'Đăng nhập VNeID'}</button>
        </form>
      </section>
    </div>
  );
}
