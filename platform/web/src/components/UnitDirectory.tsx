import { useEffect, useState } from 'react';
import { Building2, ChevronDown, Phone } from 'lucide-react';
import { listUnitContacts } from '../api';
import type { PublicUnitContact } from '../types';

// Reuse the directory's native disclosure and typography; no new overlay/card system.
export function UnitDirectory() {
  const [contacts, setContacts] = useState<PublicUnitContact[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let cancelled = false;
    setFailed(false);
    listUnitContacts().then(items => { if (!cancelled) setContacts(items); })
      .catch(() => { if (!cancelled) setFailed(true); });
    return () => { cancelled = true; };
  }, [attempt]);
  const groups = Object.values((contacts ?? []).reduce<Record<string, PublicUnitContact[]>>((acc, item) => {
    (acc[item.unitCode] ??= []).push(item); return acc;
  }, {}));
  return <details className="directory-section unit-directory">
    <summary>
      <span className="section-icon"><Building2 size={20} aria-hidden="true" /></span>
      <span className="section-copy"><strong>Phòng nghiệp vụ và đồn KCN</strong>
        <small>{contacts ? `${groups.length} đơn vị · ${contacts.length} liên hệ công khai` : 'Danh bạ đơn vị cấp tỉnh'}</small></span>
      <ChevronDown className="section-chevron" size={20} aria-hidden="true" />
    </summary>
    <div className="section-content hotline-groups">
      {failed ? <div role="alert"><p>Chưa tải được danh bạ đơn vị.</p><button className="secondary-action" type="button" onClick={() => setAttempt(value => value + 1)}>Thử lại</button></div>
        : contacts === null ? <p role="status">Đang tải danh bạ…</p>
        : !contacts.length ? <p className="empty-copy">Chưa có liên hệ đơn vị công khai.</p>
        : groups.map(entries => <section key={entries[0]!.unitCode}>
          <h3>{entries[0]!.unitName}</h3>
          {entries[0]!.address && <p>{entries[0]!.address}</p>}
          <div className="directory-list">{entries.map(entry => <article className="contact-card" key={entry.id}>
            <div className="contact-copy"><strong>{entry.displayName}</strong>
              {(entry.rank || entry.roleTitle) && <p>{[entry.rank, entry.roleTitle].filter(Boolean).join(' · ')}</p>}</div>
            <a className="call-button" href={`tel:${entry.phone.replace(/[^0-9+]/g, '')}`} aria-label={`Gọi ${entry.displayName}`}>
              <Phone size={18} aria-hidden="true" /><span>{entry.phone}</span></a>
          </article>)}</div>
        </section>)}
    </div>
  </details>;
}
