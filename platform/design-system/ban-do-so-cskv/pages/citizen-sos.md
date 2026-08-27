# Citizen SOS page override

## Single job

Help an authenticated citizen send one location-bound emergency request with a
deliberate three-second hold. The page must never turn a normal tap into a request.

## Layout order

1. Short emergency instruction.
2. Large circular SOS hold control with visible progress and live status.
3. VNeID sign-in prompt when no citizen session exists.
4. Current-location map and GPS recovery action.
5. Optional incident category, note and callback phone.
6. Legal truthfulness notice.

The existing application header and bottom navigation remain unchanged.

## Interaction rules

- Pointer, touch and keyboard press-and-hold all use the same 3,000 ms threshold.
- Releasing, leaving or cancelling before the threshold resets progress and sends nothing.
- Completing the hold sends exactly once, gives vibration feedback when supported and opens the receipt view.
- Without a citizen session, pressing the SOS control opens the VNeID-labelled authentication sheet and never calls the SOS API.
- Missing/low-quality GPS produces an announced recovery message and does not start the timer.
- The progress ring is supplemental: the core label and live status communicate state without relying on color.
