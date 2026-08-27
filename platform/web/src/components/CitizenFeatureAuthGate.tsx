import vneidLogoUrl from '../../../../assets/images/vneid-logo.png';

interface CitizenFeatureAuthGateProps {
  feature: 'reports' | 'sos';
  onLogin: () => void;
}

const gateCopy = {
  reports: 'Bạn phải đăng nhập VNeID thì mới có thể gửi phản ánh.',
  sos: 'Bạn phải đăng nhập VNeID thì mới có thể sử dụng SOS.',
} as const;

export function CitizenFeatureAuthGate({ feature, onLogin }: CitizenFeatureAuthGateProps) {
  return (
    <section className="citizen-feature-auth-gate" aria-label="Yêu cầu đăng nhập VNeID">
      <p>{gateCopy[feature]}</p>
      <button type="button" onClick={onLogin}>
        <img src={vneidLogoUrl} alt="" width="30" height="30" />
        <span>Đăng nhập VNeID</span>
      </button>
    </section>
  );
}
