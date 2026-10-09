# 电池日志 · 本地分析

Mobile-first, dependency-free PWA for iPhone Safari. Select an iOS Analytics `.ips` file; parsing runs inside a local Web Worker. No backend, uploads, analytics, CDN, or third-party code. Chinese UI. Install through Safari → Share → Add to Home Screen.

## Run and test

Requires Node.js 18+. Run `npm test`, then `npm start` and open http://127.0.0.1:4173. HTTPS or localhost is required for service workers. Serve the project directory as static files; all asset URLs are relative for GitHub Pages repository subpaths. Enable Pages under repository Settings → Pages → Deploy from a branch → main / root.

## Interpretation

Supported formats: JSON objects/arrays, consecutive JSON objects (IPS header + body), and newline-delimited JSON. BOM accepted. Only exact known aliases, optionally prefixed by dotted namespaces or `last_value_`, are read. Aliases are heuristic and not an Apple-supported schema. Displayed capacity units are deliberately left as raw units. Multiple values remain visible; file ordering is not treated as chronological evidence. No supplier decoding tables or authenticity claims. Optional nominal/design ratio uses one unambiguous pair within the same record and object, with explicit unit uncertainty.

Some `.ips` files are crash reports and contain no battery data. Plaintext legacy logs, compressed files and new unknown schemas may not be supported. File size is capped at 50 MB; traversal limits are reported. Malformed/truncated records are marked as partial. No real user logs are included. Tests use fictional values. The production interface has no demo mode.

## Privacy

File text and results exist only in current-page/worker memory. Clear terminates the worker and removes results. No browser storage stores logs. Service worker cache contains only the explicit app asset list. Hosting providers may collect access metadata (such as IP); initial load/update requests are not private from the host. This tool does not change Apple's own Analytics sharing setting. Content Security Policy restricts resources to same origin and prohibits forms and embedded objects. Rendered log fields use textContent, never HTML.

## Offline and updates

Wait for the offline-ready message on the first online visit. Test by disabling network and reloading within the same scope. Safari may evict website data. A changed worker installs in the background and becomes active after old app windows close; bump the cache version when changing app assets. Cache cleanup is limited to this app's prefix within its scope.

## References

- [Apple: IPS crash-report JSON](https://developer.apple.com/documentation/xcode/interpreting-the-json-format-of-a-crash-report) documents the crash format, not a battery Analytics schema.
- [Apple: battery information](https://support.apple.com/en-mo/106348)
- [GitHub: creating a Pages site](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site)

This independent tool is not affiliated with Apple. Automated tests do not substitute for testing on a physical iPhone; unsupported fields and OS-specific behavior remain possible.
