# markdown-link-check-config-nick2bad4u

[![Continuous Integration](https://github.com/Nick2bad4u/markdown-link-check-config-nick2bad4u/actions/workflows/ci.yml/badge.svg)](https://github.com/Nick2bad4u/markdown-link-check-config-nick2bad4u/actions/workflows/ci.yml)

Reusable, project-neutral policies for
[markdown-link-check](https://github.com/tcort/markdown-link-check).

## Install

```sh
npm install --save-dev markdown-link-check markdown-link-check-config-nick2bad4u
```

## Presets

| Preset        | Intended use                                                    |
| ------------- | --------------------------------------------------------------- |
| `recommended` | Balanced documentation checks; ignores anchors and email links. |
| `strict`      | Accepts only successful responses and checks email links.       |
| `github`      | Adds explicit GitHub API/media headers and longer retry policy. |
| `lenient`     | Also accepts HTTP redirect statuses for legacy documentation.   |

The package deliberately has no project URL, changelog ignore, localhost
exception, or application-specific branch pattern. Add those in the consumer.

## CLI usage

Use the raw JSON subpath directly:

```json
{
 "scripts": {
  "lint:links": "markdown-link-check --config node_modules/markdown-link-check-config-nick2bad4u/presets/recommended.json README.md docs"
 }
}
```

The compatibility path `recommended.json` points to the same policy:

```sh
markdown-link-check --config node_modules/markdown-link-check-config-nick2bad4u/recommended.json README.md
```

markdown-link-check does not discover or extend installed packages
automatically; omitting `--config` means this package is not being used.

## JavaScript API

```js
import {
 createMarkdownLinkCheckConfig,
 getMarkdownLinkCheckConfigPath,
 loadMarkdownLinkCheckConfig,
} from "markdown-link-check-config-nick2bad4u";

const configPath = getMarkdownLinkCheckConfigPath("github");
const config = await loadMarkdownLinkCheckConfig("strict");
const customized = createMarkdownLinkCheckConfig("recommended", {
 ignorePatterns: [{ pattern: "^https://status.example.com/" }],
 projectBaseUrl: "https://docs.example.com/",
});
```

Arrays replace the preset arrays rather than concatenating them. This makes an
empty array a reliable way to remove a shared ignore or status allowlist.

## GitHub Actions

```yaml
- name: Check Markdown links
  run: npm run lint:links
```

Do not put authentication tokens in a committed config. Supply sensitive
headers only through a runtime wrapper or secret-aware CI step.

## Requirements

- Node.js `^22.22.3`, `^24.16.0`, or `>=26.3.0`
- markdown-link-check `^3.14.2`

## License

[MIT](LICENSE)
