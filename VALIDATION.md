# Validation · 2026-10-10 · iOS 硬件检测 2.0

18/18 Node parser/archive tests passed on the final streaming implementation: synced JSON framing, separate device groups, duplicate prevention, hardware context, serial masking, opaque identifiers, XML scalars, TAR whitelist/path safety, GZIP checksums/truncation, ZIP stored/deflate CRC/encryption, PAX names, Jetsam/crash exclusion, chunk boundaries, oversized records and bounded evidence.

Desktop Chromium and Playwright WebKit passed at 390×844 using the real file picker, under `/ios-battery-local/` (the Pages path before the repository was renamed to `ios-hardware-check`):

- Unrestricted `.ips.ca.synced` selection, multi-file processing and strongest-report recommendation.
- GZIP TAR parsed inside worker; eight hardware rows; missing fields remain unknown.
- Community mapping toggle and masked serials; no horizontal overflow.
- Battery view, export excluding raw IDs and original filename.
- No implicit saved report; explicit save, reopen and delete through IndexedDB.
- Pure-color screen open/switch/close; corrupted archive error display.
- Offline reload followed by new worker parsing. Chromium used offline emulation; WebKit used a stopped HTTP server.
- No page JavaScript exceptions. Requests were same-origin application GETs or local Blob download URLs; no uploads or third-party requests.

Screenshots inspected. Automated data is clearly synthetic and does not establish coverage of private Apple schemas.

A 335546880-byte synthetic TAR (320 MiB irrelevant member plus a small hardware tree) was read using a disk-backed Blob in Node: 1 selected member, 1 skipped, correct hardware extraction. Observed process RSS 42 MiB initially / 60 MiB peak, approximately 0.4 s on this desktop. This checks streaming skipped data, not Safari performance or compressed archive speed. Temporary input removed after the check.

Not verified: physical iPhone Safari, actual user sysdiagnose/Analytics contents, every supplier code, camera access and individual lens selection, Home Screen installation, OS eviction, very large selected JSON records and real production archive diversity. No claim of functional equivalence with the reference App. Capacity units and community mappings retain explicit uncertainty.

Tests do not upload user diagnostics. Production fixtures, screenshots and stress data are not embedded in the UI.

Update 2.0.1: removed manual update entry, versioned initial assets and worker URL, automatic service worker activation, network-first known app assets with offline fallback. Browser import/offline suite rerun.

Update 2.0.2: visible product name is iOS 硬件检测. IndexedDB database name remains `device-atlas-reports` so previously saved reports still open.

Update 2.0.6: removed B02/B03 as BOE screen prefixes. Those codes only appear in conflicting secondary writeups. J5V stays as an unverified community prefix. Industry reports still describe BOE as a partial iPhone OLED supplier, not the panel in every phone.

Update 2.0.5: `vendors.js` maps prepared screen prefixes (G9N/G9P/G9Q, GH3/GVC, J5V, B02/B03) and battery prefixes (F5D, F8Y, FG9/F9Y) to vendor names. English names already written in the log display in Chinese. TLC and unknown prefixes stay unmapped. No quality grades. 23/23 Node tests passed. Desktop Chromium at 390×844 read a synthetic device tree: G9N showed 三星显示, F8Y showed 欣旺达, TLC stayed TLC, and turning 厂商代码对照 off returned the raw codes. Serials stayed masked.

