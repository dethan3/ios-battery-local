# Validation · 2026-10-10 · Device Atlas 2.0

18/18 Node parser/archive tests passed on the final streaming implementation: synced JSON framing, separate device groups, duplicate prevention, hardware context, serial masking, opaque identifiers, XML scalars, TAR whitelist/path safety, GZIP checksums/truncation, ZIP stored/deflate CRC/encryption, PAX names, Jetsam/crash exclusion, chunk boundaries, oversized records and bounded evidence.

Desktop Chromium and Playwright WebKit passed at 390×844 using the real file picker, under `/ios-battery-local/`:

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

