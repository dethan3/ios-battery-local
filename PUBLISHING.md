# GitHub publishing

Suggested repository: `dEthan3/ios-battery-local`. Create an empty repository in your GitHub account, then supply its URL to the assistant. Public source simplifies GitHub Pages availability; the project contains only application code and fictional fixtures, with no personal Analytics logs.

If publishing yourself with an authenticated GitHub CLI, run from this project directory:

```sh
gh repo create dEthan3/ios-battery-local --public --source=. --remote=origin --push
gh api --method POST repos/dEthan3/ios-battery-local/pages -f 'source[branch]=main' -f 'source[path]=/'
```

Alternatively, push this existing local Git repository to a new empty remote, then select Settings → Pages → Deploy from a branch → main → / (root) → Save. GitHub account permissions and plan determine availability. No publishing credentials are bundled.

After the Pages build succeeds, verify the URL reported by GitHub; do not assume a URL is live before checking. On an iPhone, visit it in Safari, select a local file, wait for the offline-ready message, add it to the home screen, then disconnect and reopen. Check a representative real Analytics file without uploading it to any issue or chat.
