import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  LayoutGrid,
  Map,
  MessageCircleQuestion,
  MousePointerClick,
  Siren,
  Sparkles,
  UserRound,
  X,
} from 'lucide-react';

interface TourStep {
  target: string | null;
  eyebrow: string;
  title: string;
  body: string;
  points: string[];
  action: string;
  icon: LucideIcon;
}

const steps: TourStep[] = [
  {
    target: null,
    eyebrow: 'Bắt đầu',
    title: 'Làm quen Bản đồ số CSKV',
    body: 'Trong khoảng một phút, bạn sẽ biết nơi tra cứu địa bàn, gửi phản ánh và tìm hỗ trợ khi cần.',
    points: ['6 điểm chính, có thể quay lại bất cứ lúc nào', 'Mỗi khung sáng chỉ đúng vị trí cần ghi nhớ'],
    action: 'Chọn “Bắt đầu khám phá” để xem từng vị trí.',
    icon: Sparkles,
  },
  {
    target: '[data-tour="feature-menu"]',
    eyebrow: 'Điều hướng',
    title: 'Tất cả chức năng ở một nơi',
    body: 'Nút Tính năng mở danh sách đầy đủ mà không làm mất vị trí bạn đang xem trên bản đồ.',
    points: ['Cảnh báo địa bàn và phản ánh hiện trường', 'SOS, đánh giá, trợ lý và tài khoản'],
    action: 'Sau tour, nhấn “Tính năng” để chọn công việc cần làm.',
    icon: LayoutGrid,
  },
  {
    target: '#map-panel',
    eyebrow: 'Tra cứu địa bàn',
    title: 'Bản đồ là trung tâm thông tin',
    body: 'Tại đây bạn có thể nhận biết ranh Phường Xuân Hương, các khu vực và điểm phục vụ được công khai.',
    points: ['Chạm một khu vực để xem thông tin chi tiết', 'Dùng nút định vị để trở về vị trí hiện tại'],
    action: 'Khung trắng đang bao quanh toàn bộ vùng bản đồ có thể tương tác.',
    icon: Map,
  },
  {
    target: '[data-tour="sos"]',
    eyebrow: 'Tình huống khẩn cấp',
    title: 'SOS có bước bảo vệ chống nhấn nhầm',
    body: 'SOS mở quy trình yêu cầu hỗ trợ kèm vị trí. Hệ thống chỉ gửi khi đã đăng nhập và giữ nút đủ 3 giây.',
    points: ['Kiểm tra GPS trước khi kích hoạt', 'Thả tay trước 3 giây để hủy thao tác'],
    action: 'Chỉ sử dụng SOS khi thật sự cần hỗ trợ khẩn cấp.',
    icon: Siren,
  },
  {
    target: '[data-tour="assistant"]',
    eyebrow: 'Hỗ trợ sử dụng',
    title: 'Trợ lý luôn ở cạnh bản đồ',
    body: 'Mở trợ lý để xem câu hỏi gợi ý, cách gửi phản ánh và hướng dẫn tra cứu thủ tục.',
    points: ['Biểu tượng bong bóng nằm cạnh nút định vị', 'Nội dung AI chuyên sâu đang tiếp tục phát triển'],
    action: 'Nhấn biểu tượng sau tour để mở lời chào của trợ lý.',
    icon: MessageCircleQuestion,
  },
  {
    target: '[data-tour="account"]',
    eyebrow: 'Hồ sơ cá nhân',
    title: 'Theo dõi mọi việc trong Tài khoản',
    body: 'Tài khoản tập trung phiên đăng nhập, phản ánh đã gửi, đánh giá và lối mở lại hướng dẫn này.',
    points: ['Đăng nhập khi gửi hoặc theo dõi yêu cầu', 'Có thể xem lại tour từ trang Tài khoản'],
    action: 'Bạn đã sẵn sàng. Chọn “Hoàn tất” để bắt đầu sử dụng.',
    icon: UserRound,
  },
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
      const node = selector
        ? [...document.querySelectorAll<HTMLElement>(selector)]
          .map((candidate) => ({ candidate, bounds: candidate.getBoundingClientRect() }))
          .filter(({ bounds }) => bounds.width > 0 && bounds.height > 0)
          .sort((a, b) => b.bounds.width * b.bounds.height - a.bounds.width * a.bounds.height)[0]?.candidate ?? null
        : null;
      if (!node) { setRect(null); return; }
      const bounds = node.getBoundingClientRect();
      const top = Math.max(8, bounds.top - 6);
      const left = Math.max(8, bounds.left - 6);
      setRect({
        top,
        left,
        width: Math.max(0, Math.min(bounds.width + 12, window.innerWidth - left - 8)),
        height: Math.max(0, Math.min(bounds.height + 12, window.innerHeight - top - 8)),
      });
      node.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
    };
    const timer = window.setTimeout(update, 80);
    const targetRefresh = window.setInterval(update, 320);
    update();
    window.addEventListener('resize', update); window.addEventListener('scroll', update, true);
    return () => { window.clearTimeout(timer); window.clearInterval(targetRefresh); window.removeEventListener('resize', update); window.removeEventListener('scroll', update, true); };
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
  const StepIcon = current.icon;
  const last = step === steps.length - 1;
  const cardStyle: CSSProperties = !rect || rect.height > window.innerHeight * 0.48
    ? { top: '50%', transform: 'translateY(-50%)' }
    : rect.top + rect.height < window.innerHeight * 0.64
      ? { top: Math.min(window.innerHeight - 390, rect.top + rect.height + 18) }
      : { bottom: Math.max(16, window.innerHeight - rect.top + 18) };

  return <div className="citizen-tour" role="dialog" aria-modal="true" aria-labelledby="tour-title" aria-describedby="tour-description">
    {rect ? <div className="tour-spotlight" style={rect}><span>Vị trí đang hướng dẫn</span></div> : <div className="tour-dim" />}
    <div className="tour-card" style={cardStyle} ref={cardRef} tabIndex={-1}>
      <header>
        <div className="tour-step-label"><span>{String(step + 1).padStart(2, '0')}</span><small>{current.eyebrow}</small></div>
        <button type="button" onClick={() => onClose(false)} aria-label="Bỏ qua hướng dẫn"><X /></button>
      </header>
      <div className="tour-step-dots" aria-label={`Bước ${step + 1} trên ${steps.length}`}>
        {steps.map((item, index) => <i key={item.title} className={index === step ? 'active' : index < step ? 'done' : ''} />)}
      </div>
      <div className="tour-heading"><span><StepIcon aria-hidden="true" /></span><h2 id="tour-title">{current.title}</h2></div>
      <p id="tour-description">{current.body}</p>
      <ul>{current.points.map((point) => <li key={point}><Check aria-hidden="true" /> <span>{point}</span></li>)}</ul>
      <div className="tour-action-hint"><MousePointerClick aria-hidden="true" /><span>{current.action}</span></div>
      <footer>{step > 0 ? <button type="button" className="tour-back" onClick={() => setStep((value) => value - 1)}><ArrowLeft /> Quay lại</button> : <button type="button" className="tour-back" onClick={() => onClose(false)}>Bỏ qua</button>}<button type="button" className="tour-next" onClick={() => last ? onClose(true) : setStep((value) => value + 1)}>{last ? <><Check /> Hoàn tất</> : <>{step === 0 ? 'Bắt đầu khám phá' : 'Tiếp theo'} <ArrowRight /></>}</button></footer>
    </div>
  </div>;
}
