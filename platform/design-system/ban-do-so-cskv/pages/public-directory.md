# Public directory page override

## Design brief

- **Subject:** danh bạ và bản đồ địa bàn Công an tỉnh Lâm Đồng.
- **Audience:** người dân tra cứu nhanh trên điện thoại, cán bộ/người trực bàn dùng
  trên màn hình lớn.
- **Single job:** xác định địa bàn và gọi đúng đầu mối công khai với ít thao tác.
- **Tone:** hành chính tin cậy, rõ ràng, gần với ứng dụng gốc nhưng không mô phỏng
  thanh trạng thái hệ điều hành.

## Tokens

- Lâm Đồng red: `#D71935` — header, primary action, active navigation.
- Deep burgundy: `#8E1426` — pressed state and critical text.
- Đông Sơn gold: `#C8872F` — cultural accent and focus complement.
- Porcelain: `#FFFDFC` — primary surfaces.
- Warm mist: `#F7F2EE` — page background.
- Ink: `#17191F` — high-contrast foreground.
- Map blue: `#216B86` — location/GIS semantics only.
- Display: `Be Vietnam Pro`; body: `Noto Sans`; data: system tabular figures.
- Radius scale: `10 / 16 / 24px`; shadow scale remains restrained and warm.

## Layout

Desktop:

```text
┌──────────────────── red institutional header ─────────────────────┐
├──────── directory / search / result (watermark) ─┬──── GIS map ───┤
│                                                  │                 │
└──────────────────────────────────────────────────┴─────────────────┘
```

Mobile:

```text
┌──────────── red header ────────────┐
│ directory OR map (one view active) │
│                                    │
├──── Danh bạ ──────── Bản đồ ──────┤
└────────────────────────────────────┘
```

## Signature

The Đông Sơn drum is a large, low-opacity watermark anchored behind the directory
surface. It connects the supplied mobile reference to the web product without
competing with content or reducing text contrast.

The emergency action is a labelled red `SOS / Mở quy trình` pill beside the AI
assistant on the map, on every viewport. It is not repeated in the mobile bottom
navigation, feature drawer or on feature pages, so the emergency affordance stays
prominent without being mistaken for ordinary navigation. Secondary capabilities
live in a right-side feature drawer; map layers live behind one standard layers control.

Public map, directory and workflow preparation remain visible before authentication.
Submitting a report, activating SOS, viewing private tracking data and sending a
rating require the VNeID-labelled local sign-in sheet. The sheet is a bottom drawer
on phones and a right drawer on larger screens, keeping the map/form context mounted.

## Deliberate restraint

- Do not reproduce a fake iOS status bar.
- Do not use red for GIS/location status; reserve map blue for spatial actions.
- Do not add ornamental gradients, glass blur or floating decorative badges.
- Motion is limited to view switching, hover/focus and accordion disclosure.
- Use Lucide outline icons only; emergency state uses `Siren`, never a camera-like
  circle or an unlabeled floating icon.
- Demo, sandbox, pending and real-data states must always be stated in text and
  never communicated by color alone.
- All mobile controls are at least 48px high and the bottom navigation reserves
  safe-area padding.

## Responsive matrix

- `320–359px`: small phone, 64px institutional header, 68px bottom navigation,
  12–15px fluid gutters, compact labels and full 44px minimum touch targets.
- `360–479px`: standard phone, single view, one-column recovery actions and compact
  contact actions.
- `480–767px`: large phone, single view with comfortable 18–24px gutters.
- `768–1023px`: tablet, single directory/map view with centered 680px content.
- `1024–1199px`: compact desktop split, 420px directory plus flexible map.
- `1200–1599px`: standard desktop split, 510px directory plus flexible map.
- `1600px+`: large desktop split, 540px directory with wider reading gutters.
- Phone landscape below 520px height uses a shorter header/navigation and a
  two-column composition: context on the left, primary search/form content on the
  right. The map remains full width and keeps controls clear of the bottom nav.
- `safe-area-inset-top/right/bottom/left` is reserved for notches, rounded corners
  and the iOS home indicator in both portrait and landscape.
- When an input, select or textarea receives focus on a compact viewport, the
  bottom navigation moves out of the visual viewport and the scroll workspace
  expands. Input text remains at least 16px to prevent iOS auto zoom.
- Verification device classes: `320×568`, `360×640`, `375×667`, `390×844`,
  `412×915`, `430×932`, plus landscape `568×320`, `667×375`, `844×390` and
  `915×412`. Every class must have zero horizontal page overflow.
- MapLibre is deferred on compact layouts until the user opens the Map tab; after
  first open it remains mounted so map state is preserved when changing tabs.
