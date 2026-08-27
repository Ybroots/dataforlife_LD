import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { ContactRound, FileWarning, HelpCircle, LogIn, Map, MapPinned, Menu, Search, ShieldCheck, UserRound, UserRoundCheck, X } from 'lucide-react';
import { ApiError, getCitizenSession, getOfficerSession, listHotlines, lookupByCode, lookupByLocation, searchAreas, signOutCitizen, signOutOfficer } from './api';
import { DirectoryPanel } from './components/DirectoryPanel';
import { FeatureDrawer } from './components/FeatureDrawer';
import { PoliceLoginDialog, PoliceLoginScreen } from './components/PoliceLogin';
import { LoginScreen } from './components/LoginScreen';
import { CitizenAuthSheet } from './components/CitizenAuthSheet';
import { CitizenOnboardingTour } from './components/CitizenOnboardingTour';
import { CitizenNotifications } from './components/CitizenNotifications';
import type { FeatureId } from './features';
import type { AreaLookup, AreaSummary, CitizenSession, Hotline, WorkflowActor } from './types';
import directoryLogoUrl from '../../../assets/images/logo-128.png';
import drumPatternUrl from '../../../assets/images/bg.png';
import vneidLogoUrl from '../../../assets/images/vneid-logo.png';

const MapPane = lazy(async () => {
  const module = await import('./components/MapPane');
  return { default: module.MapPane };
});

const FeaturePage = lazy(async () => {
  const module = await import('./components/FeaturePage');
  return { default: module.FeaturePage };
});

const PolicePortal = lazy(async () => {
  const module = await import('./components/PolicePortal');
  return { default: module.PolicePortal };
});

type LookupState = 'idle' | 'loading' | 'success' | 'error';
const COMPACT_LAYOUT_QUERY = '(max-width: 1023px)';
const FEATURE_IDS: FeatureId[] = ['directory', 'alerts', 'reports', 'sos', 'feedback', 'assistant', 'account'];
const CITIZEN_TOUR_KEY = 'cskv-citizen-tour-v1';
const XUAN_HUONG_AREA_CODE = '24781';
const XUAN_HUONG_FIXTURE_CODE = 'DEMO-DA-LAT';
let xuanHuongAreaRequest: ReturnType<typeof lookupByCode> | null = null;
let entryLocationRequest: Promise<GeolocationPosition> | null = null;

function loadXuanHuongArea() {
  if (!xuanHuongAreaRequest) {
    xuanHuongAreaRequest = lookupByCode(XUAN_HUONG_AREA_CODE).catch((caught) => {
      if (!(caught instanceof ApiError) || caught.status !== 404) throw caught;
      return lookupByCode(XUAN_HUONG_FIXTURE_CODE);
    });
  }
  return xuanHuongAreaRequest;
}

function requestEntryLocation(): Promise<GeolocationPosition> {
  if (!entryLocationRequest) {
    entryLocationRequest = new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: false,
        timeout: 12_000,
        maximumAge: 300_000,
      });
    });
  }
  return entryLocationRequest;
}

function featureFromUrl(): FeatureId {
  const requested = new URL(window.location.href).searchParams.get('feature');
  return FEATURE_IDS.includes(requested as FeatureId) ? requested as FeatureId : 'directory';
}

function useCompactLayout(): boolean {
  const [matches, setMatches] = useState(() => window.matchMedia(COMPACT_LAYOUT_QUERY).matches);

  useEffect(() => {
    const media = window.matchMedia(COMPACT_LAYOUT_QUERY);
    const update = () => setMatches(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  return matches;
}

export default function App() {
  const policePortalRequested = new URL(window.location.href).searchParams.get('portal') === 'police';
  const isCompactLayout = useCompactLayout();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<AreaSummary[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchSettled, setSearchSettled] = useState(false);
  const [state, setState] = useState<LookupState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [area, setArea] = useState<AreaLookup | null>(null);
  const [isFixture, setIsFixture] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<{ latitude: number; longitude: number } | null>(null);
  const [mobileView, setMobileView] = useState<'directory' | 'map'>('map');
  const [mapRequested, setMapRequested] = useState(true);
  const [activeFeature, setActiveFeature] = useState<FeatureId>(featureFromUrl);
  const [featureMenuOpen, setFeatureMenuOpen] = useState(false);
  const [showDemoAlerts, setShowDemoAlerts] = useState(false);
  const [hotlines, setHotlines] = useState<Hotline[]>([]);
  const [policeSession, setPoliceSession] = useState<WorkflowActor | null>(null);
  const [policeSessionChecking, setPoliceSessionChecking] = useState(policePortalRequested);
  const [policeLoginOpen, setPoliceLoginOpen] = useState(false);
  const [citizenSession, setCitizenSession] = useState<CitizenSession | null>(null);
  const [citizenLoginOpen, setCitizenLoginOpen] = useState(false);
  const [citizenLoginAction, setCitizenLoginAction] = useState('tiếp tục');
  const [citizenLoginNotice, setCitizenLoginNotice] = useState('');
  const [tourOpen, setTourOpen] = useState(false);
  const [caseNavigationVersion, setCaseNavigationVersion] = useState(0);
  const tourAutoStarted = useRef(false);
  const [appView, setAppView] = useState<'landing' | 'citizen' | 'officer'>(() => {
    if (policePortalRequested) return 'officer';
    return 'landing';
  });
  const requestId = useRef(0);
  const lookupPanelRef = useRef<HTMLElement | null>(null);
  const statusRegionRef = useRef<HTMLDivElement | null>(null);
  const resultAnchorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const restoreFeature = () => setActiveFeature(featureFromUrl());
    window.addEventListener('popstate', restoreFeature);
    return () => window.removeEventListener('popstate', restoreFeature);
  }, []);

  useEffect(() => {
    void listHotlines().then(setHotlines).catch(() => setHotlines([]));
  }, []);

  useEffect(() => {
    if (!citizenLoginNotice) return;
    const timer = window.setTimeout(() => setCitizenLoginNotice(''), 4200);
    return () => window.clearTimeout(timer);
  }, [citizenLoginNotice]);

  useEffect(() => {
    if (!policePortalRequested) return;
    let cancelled = false;
    void getOfficerSession()
      .then((actor) => { if (!cancelled) setPoliceSession(actor); })
      .catch(() => { if (!cancelled) setPoliceSession(null); })
      .finally(() => { if (!cancelled) setPoliceSessionChecking(false); });
    return () => { cancelled = true; };
  }, [policePortalRequested]);

  useEffect(() => {
    if (appView !== 'citizen' || tourAutoStarted.current || window.localStorage.getItem(CITIZEN_TOUR_KEY)) return;
    tourAutoStarted.current = true;
    setMapRequested(true); setMobileView('map'); setActiveFeature('directory');
    const timer = window.setTimeout(() => setTourOpen(true), 700);
    return () => window.clearTimeout(timer);
  }, [appView]);

  useEffect(() => {
    if (policePortalRequested) return;
    let cancelled = false;
    void getCitizenSession()
      .then((session) => {
        if (cancelled) return;
        setCitizenSession(session);
        if (session) setAppView('citizen');
      })
      .catch(() => { if (!cancelled) setCitizenSession(null); });
    return () => { cancelled = true; };
  }, [policePortalRequested]);

  useEffect(() => {
    if (!isCompactLayout) {
      setMapRequested(true);
      lookupPanelRef.current?.scrollTo({ top: 0 });
    }
  }, [isCompactLayout]);

  useEffect(() => {
    if (!isCompactLayout || !error) return;
    const frame = window.requestAnimationFrame(() => {
      statusRegionRef.current?.scrollIntoView({
        behavior: 'auto',
        block: 'end',
      });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [error, isCompactLayout]);

  useEffect(() => {
    if (!isCompactLayout || state !== 'success' || !area) return;
    const frame = window.requestAnimationFrame(() => {
      resultAnchorRef.current?.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
        block: 'start',
      });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [area, isCompactLayout, state]);

  useEffect(() => {
    const currentRequest = ++requestId.current;
    if (area && query.trim() === area.name) {
      setSuggestions([]);
      setSearching(false);
      setSearchSettled(false);
      return;
    }
    if (query.trim().length < 2) {
      setSuggestions([]);
      setSearching(false);
      setSearchSettled(false);
      return;
    }
    const timer = window.setTimeout(async () => {
      setSearching(true);
      setSearchSettled(false);
      try {
        const results = await searchAreas(query);
        if (currentRequest === requestId.current) {
          setSuggestions(results);
          setSearchSettled(true);
        }
      } catch {
        if (currentRequest === requestId.current) {
          setSuggestions([]);
          setSearchSettled(true);
        }
      } finally {
        if (currentRequest === requestId.current) setSearching(false);
      }
    }, 250);
    return () => window.clearTimeout(timer);
  }, [area, query]);

  const acceptEnvelope = useCallback((payload: Awaited<ReturnType<typeof lookupByCode>>) => {
    setArea(payload.data);
    setIsFixture(payload.meta.dataSource === 'fixture');
    setState('success');
    setError(null);
    setSuggestions([]);
  }, []);

  const resolveCoordinates = useCallback(async (latitude: number, longitude: number) => {
    setSelectedPosition({ latitude, longitude });
    setState('loading');
    setError(null);
    try {
      acceptEnvelope(await lookupByLocation(latitude, longitude));
    } catch (caught) {
      const message = caught instanceof ApiError ? caught.message : 'Không thể tra cứu vị trí lúc này.';
      setState('error');
      setError(message);
    }
  }, [acceptEnvelope]);

  useEffect(() => {
    if (policePortalRequested) return;
    let cancelled = false;

    const loadXuanHuongDemo = async () => {
      setState('loading');
      setError(null);
      try {
        const payload = await loadXuanHuongArea();
        if (cancelled) return;
        acceptEnvelope(payload);
        setQuery(payload.data.name);
      } catch (caught) {
        if (cancelled) return;
        setState('error');
        setError(caught instanceof ApiError ? caught.message : 'Không thể tải bản demo Phường Xuân Hương lúc này.');
      }
    };

    void loadXuanHuongDemo();

    if (!navigator.geolocation) {
      return () => { cancelled = true; };
    }

    void requestEntryLocation().then(
      (position) => {
        if (cancelled) return;
        setSelectedPosition({ latitude: position.coords.latitude, longitude: position.coords.longitude });
      },
      () => undefined,
    );

    return () => { cancelled = true; };
  }, [acceptEnvelope, policePortalRequested]);

  const handleCoordinateSelect = useCallback((latitude: number, longitude: number) => {
    if (isCompactLayout) setMobileView('directory');
    void resolveCoordinates(latitude, longitude);
  }, [isCompactLayout, resolveCoordinates]);

  const chooseArea = async (item: AreaSummary) => {
    setQuery(item.name);
    setState('loading');
    setError(null);
    try {
      const payload = await lookupByCode(item.code);
      acceptEnvelope(payload);
      if (payload.data.center) setSelectedPosition(payload.data.center);
    } catch (caught) {
      setState('error');
      setError(caught instanceof ApiError ? caught.message : 'Không thể tải địa bàn lúc này.');
    }
  };

  const clearSearch = () => {
    setQuery('');
    setSuggestions([]);
    setSearchSettled(false);
  };

  const updateSearch = (value: string) => {
    setQuery(value);
    setSearchSettled(false);
    if (area && value.trim() !== area.name) {
      setArea(null);
      setSelectedPosition(null);
      setState('idle');
    }
  };

  const navigateToFeature = useCallback((feature: FeatureId) => {
    const url = new URL(window.location.href);
    if (feature === 'directory') url.searchParams.delete('feature');
    else url.searchParams.set('feature', feature);
    window.history.pushState({}, '', url);
    setActiveFeature(feature);
    setFeatureMenuOpen(false);
  }, []);

  const showAlertsOnMap = () => {
    setShowDemoAlerts(true);
    setMapRequested(true);
    setMobileView('map');
    navigateToFeature('directory');
  };

  const enterPolicePortal = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete('feature');
    url.searchParams.set('portal', 'police');
    window.location.assign(url.toString());
  };

  const handlePoliceLoginSuccess = (actor: WorkflowActor) => {
    setPoliceSession(actor);
    setPoliceLoginOpen(false);
    if (!policePortalRequested) enterPolicePortal();
  };

  const handlePoliceLogout = async () => {
    try {
      await signOutOfficer();
    } finally {
      setPoliceSession(null);
    }
    window.location.assign('./');
  };

  const handleCitizenLogout = async () => {
    try { await signOutCitizen(); } finally { setCitizenSession(null); }
    navigateToFeature('directory');
  };

  const startTour = useCallback(() => {
    navigateToFeature('directory'); setMapRequested(true); setMobileView('map'); setFeatureMenuOpen(false);
    window.setTimeout(() => setTourOpen(true), 120);
  }, [navigateToFeature]);

  const loading = state === 'loading';
  const panelStyle = { '--drum-image': `url(${drumPatternUrl})` } as CSSProperties;

  if (appView === 'landing') {
    return (
      <LoginScreen
        onEnterAsCitizen={() => setAppView('citizen')}
        onCitizenLoginSuccess={(session) => { setCitizenSession(session); setAppView('citizen'); }}
        onOfficerLoginSuccess={(actor) => { setPoliceSession(actor); setAppView('officer'); }}
      />
    );
  }

  if (appView === 'officer') {
    if (policeSessionChecking) return <main className="police-login-screen"><div className="queue-loading"><span className="loader" /> Đang kiểm tra phiên đăng nhập…</div></main>;
    return policeSession
      ? <Suspense fallback={<main className="police-login-screen"><div className="queue-loading"><span className="loader" /> Đang tải cổng nghiệp vụ…</div></main>}><PolicePortal sessionActor={policeSession} onSignOut={() => { void handlePoliceLogout(); setAppView('landing'); }} /></Suspense>
      : <PoliceLoginScreen onSuccess={handlePoliceLoginSuccess} onBack={() => setAppView('landing')} />;
  }

  return (
    <div className="app-shell" data-mobile-view={mobileView} data-active-feature={activeFeature}>
      <a className="skip-link" href={activeFeature === 'directory' ? '#lookup-panel' : '#main-content'}>Đến nội dung chính</a>
      <header className="topbar">
        <div className="brand-mark" aria-hidden="true">
          <img src={directoryLogoUrl} alt="" width="44" height="44" />
        </div>
        <div className="brand-copy">
          <strong>Bản đồ số Cảnh sát khu vực</strong>
          <span>Công an tỉnh Lâm Đồng</span>
        </div>
        <div className="topbar-actions">
          <div className="system-status"><ShieldCheck size={16} aria-hidden="true" /> Dữ liệu công khai</div>
          <CitizenNotifications key={citizenSession?.id ?? 'guest'} sessionId={citizenSession?.id ?? null}
            onRequireLogin={() => { setCitizenSession(null); setCitizenLoginAction('xem thông báo xử lý hồ sơ'); setCitizenLoginOpen(true); }}
            onOpenCase={(notification) => {
              const url = new URL(window.location.href);
              const feature = notification.kind === 'sos' ? 'sos' : 'reports';
              url.searchParams.set('feature', feature);
              if (notification.kind === 'incident') {
                url.searchParams.set('reportTab', 'tracking'); url.searchParams.set('reportReceipt', notification.receiptCode);
              } else {
                url.searchParams.set('sosStep', 'receipt'); url.searchParams.set('sosReceipt', notification.receiptCode);
              }
              window.history.pushState({}, '', url);
              setActiveFeature(feature); setFeatureMenuOpen(false); setCaseNavigationVersion((value) => value + 1);
            }} />
          {!citizenSession && <button className="citizen-login-trigger" data-tour="account" type="button" onClick={() => { setCitizenLoginAction('sử dụng ứng dụng người dân'); setCitizenLoginOpen(true); }} aria-label="Đăng nhập VNeID" title="Đăng nhập VNeID"><img src={vneidLogoUrl} alt="" width="30" height="30" /></button>}
          {citizenSession && <button className="citizen-session-button" data-tour="account" type="button" onClick={() => navigateToFeature('account')} title="Mở tài khoản người dân"><UserRoundCheck size={17} /><span>{citizenSession.displayName}</span></button>}
          <button className="tour-help-button" type="button" onClick={startTour} aria-label="Hướng dẫn sử dụng" title="Hướng dẫn sử dụng"><HelpCircle size={19} /></button>
          <button className="police-portal-link" type="button" onClick={() => setPoliceLoginOpen(true)}>
            <LogIn size={18} aria-hidden="true" /><span>Đăng nhập CSKV</span>
          </button>
          <button
            className="feature-menu-button"
            data-tour="feature-menu"
            type="button"
            onClick={() => setFeatureMenuOpen(true)}
            aria-expanded={featureMenuOpen}
            aria-controls="feature-drawer"
          >
            <Menu size={20} aria-hidden="true" /><span>Tính năng</span>
          </button>
        </div>
      </header>

      {activeFeature === 'directory' ? (
        <main className="workspace">
          <aside ref={lookupPanelRef} className="lookup-panel" id="lookup-panel" style={panelStyle} aria-label="Danh bạ địa bàn">
            <div className="panel-intro">
              <p className="eyebrow">Tra cứu công khai theo địa bàn</p>
              <h1>Danh bạ địa bàn</h1>
            </div>

            <div className="search-block">
              <label htmlFor="area-search">Tên đơn vị, xã/phường hoặc mã địa bàn</label>
              <div className="search-field">
                <Search size={18} aria-hidden="true" />
                <input
                  id="area-search"
                  name="area-search"
                  type="search"
                  autoComplete="off"
                  value={query}
                  onChange={(event) => updateSearch(event.target.value)}
                  placeholder="Ví dụ: Phường Xuân Hương…"
                  aria-controls="area-suggestions"
                  aria-expanded={suggestions.length > 0}
                />
                {query && (
                  <button type="button" onClick={clearSearch} aria-label="Xóa nội dung tìm kiếm"><X size={17} aria-hidden="true" /></button>
                )}
              </div>
              {(suggestions.length > 0 || searching) && (
                <div className="suggestions" id="area-suggestions" role="listbox" aria-label="Kết quả tìm địa bàn">
                  {searching && suggestions.length === 0 ? (
                    <div className="suggestion-loading">Đang tìm…</div>
                  ) : suggestions.map((item) => (
                    <button key={item.code} type="button" role="option" aria-selected="false" onClick={() => void chooseArea(item)}>
                      <MapPinned size={18} aria-hidden="true" />
                      <span><strong>{item.name}</strong><small>{item.code} · {item.provinceName}</small></span>
                    </button>
                  ))}
                </div>
              )}
              {searchSettled && !searching && suggestions.length === 0 && query.trim().length >= 2 && (
                <p className="search-empty" role="status">Không tìm thấy địa bàn phù hợp. Hãy kiểm tra tên hoặc thử mã địa bàn.</p>
              )}
            </div>

            <div className="status-region" ref={statusRegionRef} aria-live="polite">
              {loading && <div className="loading-card"><span className="loader" /> Đang đối chiếu ranh giới địa bàn…</div>}
              {error && (
                <div className="error-card" role="alert">
                  <strong>Chưa thể tra cứu</strong>
                  <span>{error}</span>
                </div>
              )}
            </div>

            {area ? (
              <div className="result-anchor" ref={resultAnchorRef}>
                <DirectoryPanel area={area} isFixture={isFixture} hotlines={hotlines} />
              </div>
            ) : (
              state === 'idle' && (
                <div className="empty-state">
                  <span className="empty-state-icon"><ShieldCheck size={22} aria-hidden="true" /></span>
                  <div>
                    <strong>Dữ liệu địa bàn đã được chuẩn hóa</strong>
                    <span>Kết quả hiển thị trụ sở, một đầu mối công khai và ranh giới GIS.</span>
                  </div>
                </div>
              )
            )}
          </aside>

          {mapRequested && (
            <Suspense fallback={<section id="map-panel" className="map-pane map-loading" aria-label="Đang tải bản đồ"><span className="loader" /> Đang tải bản đồ…</section>}>
              <MapPane
                area={area}
                selectedPosition={selectedPosition}
                onCoordinateSelect={handleCoordinateSelect}
                isMobileActive={mobileView === 'map'}
                showDemoAlerts={showDemoAlerts}
                hotlines={hotlines}
                onOpenAssistant={() => navigateToFeature('assistant')}
                onOpenSos={() => navigateToFeature('sos')}
              />
            </Suspense>
          )}
        </main>
      ) : (
        <Suspense fallback={<main className="feature-workspace"><div className="queue-loading"><span className="loader" /> Đang tải tính năng…</div></main>}>
          <FeaturePage
            key={caseNavigationVersion}
            feature={activeFeature}
            areaCode={area?.code ?? null}
            selectedPosition={selectedPosition}
            isAuthenticated={Boolean(citizenSession)}
            onRequireLogin={(action) => { setCitizenLoginAction(action); setCitizenLoginOpen(true); }}
            onBack={() => { navigateToFeature('directory'); setMobileView('map'); }}
            onShowAlertsOnMap={showAlertsOnMap}
            citizenSession={citizenSession}
            onCitizenLogout={() => void handleCitizenLogout()}
            onNavigate={navigateToFeature}
            onStartTour={startTour}
          />
        </Suspense>
      )}

      <nav className="mobile-tabs" aria-label="Điều hướng chính">
        <button
          type="button"
          className={activeFeature === 'directory' && mobileView === 'map' ? 'active' : ''}
          aria-pressed={activeFeature === 'directory' && mobileView === 'map'}
          aria-controls={mapRequested ? 'map-panel' : undefined}
          onClick={() => {
            navigateToFeature('directory');
            setMapRequested(true);
            setMobileView('map');
          }}
        >
          <Map size={23} aria-hidden="true" />
          <span>Bản đồ</span>
        </button>
        <button
          type="button"
          className={activeFeature === 'directory' && mobileView === 'directory' ? 'active' : ''}
          aria-pressed={activeFeature === 'directory' && mobileView === 'directory'}
          aria-controls="lookup-panel"
          onClick={() => { navigateToFeature('directory'); setMobileView('directory'); }}
        >
          <ContactRound size={23} aria-hidden="true" />
          <span>Danh bạ</span>
        </button>
        <button
          type="button"
          className={activeFeature === 'reports' ? 'active' : ''}
          aria-pressed={activeFeature === 'reports'}
          onClick={() => navigateToFeature('reports')}
        >
          <FileWarning size={23} aria-hidden="true" />
          <span>Phản ánh</span>
        </button>
        <button
          type="button"
          data-tour="account"
          className={activeFeature === 'account' ? 'active' : ''}
          aria-pressed={activeFeature === 'account'}
          onClick={() => navigateToFeature('account')}
        >
          <UserRound size={23} aria-hidden="true" />
          <span>Tài khoản</span>
        </button>
      </nav>

      <FeatureDrawer open={featureMenuOpen} activeFeature={activeFeature} onClose={() => setFeatureMenuOpen(false)} onSelect={navigateToFeature} />
      <PoliceLoginDialog open={policeLoginOpen} onSuccess={handlePoliceLoginSuccess} onClose={() => setPoliceLoginOpen(false)} />
      <CitizenAuthSheet open={citizenLoginOpen && !citizenSession} action={citizenLoginAction} onClose={() => setCitizenLoginOpen(false)} onSuccess={(session) => { setCitizenSession(session); setCitizenLoginOpen(false); setCitizenLoginNotice('Đăng nhập VNeID thành công.'); }} />
      {citizenLoginNotice && <div className="citizen-login-success" role="status" aria-live="polite"><ShieldCheck size={20} aria-hidden="true" /><span>{citizenLoginNotice}</span></div>}
      <CitizenOnboardingTour open={tourOpen} onClose={(completed) => { setTourOpen(false); window.localStorage.setItem(CITIZEN_TOUR_KEY, completed ? 'completed' : 'skipped'); }} />
    </div>
  );
}
