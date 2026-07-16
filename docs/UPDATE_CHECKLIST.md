# Update checklist

When markdown-link-check changes:

1. Review its documented configuration keys and CLI flags.
2. Run all local-server success and failure fixtures.
3. Confirm every raw preset is present in `npm pack --dry-run` output.
4. Test one packed consumer using an explicit `--config` path.
5. Update the peer range only after the current presets pass against that range.
