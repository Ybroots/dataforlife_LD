import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, X } from 'lucide-react';

const steps = [
  { target: null, title: 'Chào mừng đến Bản đồ số CSKV', body: 'Tour ngắn này giúp bạn tìm đúng địa bàn, gửi phản ánh và sử dụng SOS an toàn.' },
  { target: '[data-tour="feature-menu"]', title: 'Mở danh sách chức năng', body: 'Menu tập trung cảnh báo, phản ánh, đánh giá và trợ lý trong một nơi.' },
  { target: '#map-panel', title: 'Bản đồ là màn hình chính', body: 'Ranh Phường Xuân Hương, các khu cấu thành và điểm CSKV được hiển thị trực quan tại đây.' },
  { target: '[data-tour="sos"]', title: 'SOS chỉ dùng khi khẩn cấp', body: 'Nút đỏ chỉ xuất hiện trên bản đồ. Bạn phải đăng nhập và nhấn giữ 3 giây để tránh thao tác nhầm.' },
  { target: '[data-tour="assistant"]', title: 'Trợ lý ở cạnh bản đồ', body: 'Dùng để hỏi cách sử dụng và tra cứu thủ tục; nội dung AI vẫn đang phát triển.' },
  { target: '[data-tour="account"]', title: 'Tài khoản và hồ sơ của bạn', body: 'Mở tab Tài khoản để xem phiên đăng nhập, phản ánh của tôi, đánh giá và mở lại hướng dẫn.' },
];

interface Rect { top: number; left: number; width: number; height: number }

export function CitizenOnboardingTour({ open, onClose }: { open: boolean; onClose: (completed: boolean) => void }) {
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => { if (open) setStep(0); }, [open]);
  useLayoutEffect(() => {
    if (!open) return;
    const update = () => {
      const selector = steps[step]?.target;
      const node = selector ? document.querySelector<HTMLElement>(selector) : null;
      if (!node) { setRect(null); return; }
      const bounds = node.getBoundingClientRect();
      setRect({ top: Math.max(8, bounds.top - 6), left: Math.max(8, bounds.left - 6), width: Math.min(window.innerWidth - 16, bounds.width + 12), height: Math.min(window.innerHeight - 16, bounds.height + 12) });
      node.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
    };
    const timer = window.setTimeout(update, 80); update();
    window.addEventListener('resize', update); window.addEventListener('scroll', update, true);
    return () => { window.clearTimeout(timer); window.removeEventListener('resize', update); window.removeEventListener('scroll', update, true); };
  }, [open, step]);
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    cardRef.current?.focus();
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { onClose(false); return; }
      if (event.key !== 'Tab' || !cardRef.current) return;
      const focusable = [...cardRef.current.querySelectorAll<HTMLElement>('button:not([disabled])')];
      if (!focusable.length) return;
      const first = focusable[0]!; const last = focusable[focusable.length - 1]!;
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', keydown);
    return () => { document.removeEventListener('keydown', keydown); previous?.focus(); };
  }, [onClose, open]);

  if (!open) return null;
  const current = steps[step]!;
  const last = step === steps.length - 1;
  const cardStyle = rect && rect.height > window.innerHeight * 0.48 ? undefined : rect && rect.top + rect.height < window.innerHeight * 0.64
    ? { top: Math.min(window.innerHeight - 230, rect.top + rect.height + 14) }
    : rect ? { bottom: Math.max(16, window.innerHeight - rect.top + 14) } : undefined;

  return <div className="citizen-tour" role="dialog" aria-modal="true" aria-labelledby="tour-title">
    {rect ? <div className="tour-spotlight" style={rect} /> : <div className="tour-dim" />}
    <div className="tour-card" style={cardStyle} ref={cardRef} tabIndex={-1}>
      <header><span>{step + 1}/{steps.length}</span><button type="button" onClick={() => onClose(false)} aria-label="Bỏ qua hướng dẫn"><X /></button></header>
      <div className="tour-progress" aria-hidden="true"><i style={{ width: `${(step + 1) / steps.length * 100}%` }} /></div>
      <h2 id="tour-title">{current.title}</h2><p>{current.body}</p>
      <footer>{step > 0 ? <button type="button" className="tour-back" onClick={() => setStep((value) => value - 1)}><ArrowLeft /> Quay lại</button> : <button type="button" className="tour-back" onClick={() => onClose(false)}>Bỏ qua</button>}<button type="button" className="tour-next" onClick={() => last ? onClose(true) : setStep((value) => value + 1)}>{last ? <><Check /> Hoàn tất</> : <>Tiếp theo <ArrowRight /></>}</button></footer>
    </div>
  </div>;
}
