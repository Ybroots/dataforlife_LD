import vneidLogoUrl from '../../../../assets/images/vneid-logo.png';

interface CitizenFeatureAuthGateProps {
  feature: 'reports' | 'sos';
  onLogin: () => void;
}

const gateCopy = {
  reports: 'Bạn cần đăng nhập tài khoản người dân để gửi phản ánh.',
  sos: 'Bạn cần đăng nhập tài khoản người dân để sử dụng SOS.',
} as const;

export function CitizenFeatureAuthGate({ feature, onLogin }: CitizenFeatureAuthGateProps) {
  return (
    <section className="citizen-feature-auth-gate" aria-label="Yêu cầu đăng nhập tài khoản người dân">
      <p>{gateCopy[feature]}</p>
      <button type="button" onClick={onLogin}>
        <img src={vneidLogoUrl} alt="" width="30" height="30" />
        <span>Đăng nhập hoặc đăng ký</span>
      </button>
    </section>
  );
}
