# Publishing

Existing repository: https://github.com/dethan3/ios-battery-local

Display name: 机芯档案 / Device Atlas. Repository URL stays the same.

The user reports Pages is already enabled. This static application needs no build: deploy main, repository root. The parser workflow runs Node tests; it is not the Pages deployment workflow. GitHub Pages branch deployment should publish source commits automatically under the existing configuration.

All URLs are relative, including manifest and service worker. Cache v5 installs automatically and activates without an update button. Online resource requests prefer the network, with a four-second timeout and offline cache fallback. Existing open pages are not forcibly reloaded.

The site is public; code and rules are public. Selected diagnostic files stay on the device. Keep real diagnostics out of Git, issues and test fixtures. Browser/Node checks and remaining limitations are recorded in VALIDATION.md.

