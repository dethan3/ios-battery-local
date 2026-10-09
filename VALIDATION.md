# Validation · 2026-10-09

Passed: 9 Node.js parser tests, including consecutive JSON, BOM, nested aliases, numeric strings, conflicts, zero versus missing, range checks, same-object ratio provenance, escaped strings, truncated records, invalid files, hardware-field allowlist, and crash-report recognition.

Passed in desktop Chromium and Playwright WebKit 26.5 at a 390 × 844 viewport:

- File import and clear controls. The redesigned production UI has no demo entry; browser tests select fictional .ips fixtures through the actual file input.
- Narrow layout without horizontal overflow.
- Literal rendering of potentially malicious hardware text; no injected image elements.
- Invalid file error display.
- Service worker readiness and online reload.
- Offline reload and worker parsing. Chromium used network emulation. WebKit used a stopped local HTTP server; its network-emulation mode produced an internal browser error, so that method was not accepted as verification.
- No page JavaScript errors; observed application requests were same-origin GET requests, with no uploads.

Visual screenshot inspected. No actual user Analytics files were available. Real-file schema compatibility, physical iPhone Safari, Add to Home Screen, OS cache eviction, and a hosted GitHub Pages repository subpath have not been verified. These are remaining acceptance checks, not claimed successes.

GitHub profile connection resolved to dethan3. User provided public repository https://github.com/dethan3/ios-battery-local with confirmed push/admin permission. Source upload and Pages status are tracked separately from these local tests.

UI revision: compact file-first home screen, collapsed help, inline metric units, prominent cycle/percentage cards, optional capacities only when available, and missing-field explanation in evidence. Chromium and WebKit checks rerun successfully after the revision.
