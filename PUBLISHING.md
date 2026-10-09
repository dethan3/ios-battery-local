# GitHub Pages deployment

Source is uploaded to https://github.com/dethan3/ios-battery-local on branch `main`.

Open https://github.com/dethan3/ios-battery-local/settings/pages and select:

- Source: Deploy from a branch
- Branch: main
- Folder: / (root)
- Save

After GitHub reports a successful deployment, open the URL reported by Pages. The expected project URL is https://dethan3.github.io/ios-battery-local/; it has not yet been verified live.

On your iPhone, select a real Analytics .ips file in Safari. It is parsed on-device, without uploading. Wait for the offline-ready message, use Share → Add to Home Screen, then disconnect and reopen to verify offline use on your actual device. Missing fields should be reported rather than inferred; do not post entire private Analytics files to issues or chat.

The source upload was completed through the connected GitHub tool. No GitHub credentials are bundled. Enabling Pages could not be completed by the agent because the available connector has no Pages settings action and the GitHub settings page was inaccessible.