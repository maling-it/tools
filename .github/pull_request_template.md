## Summary

<!-- What does this change and why? Link the issue it closes, e.g. "Closes #12". -->

## Type of change

- [ ] New tool
- [ ] Improvement or fix to an existing tool
- [ ] UI or UX change
- [ ] Agent support (`agentTools`, prompts, MCP server)
- [ ] Documentation
- [ ] Tooling, dependencies or CI

## Checklist

- [ ] `bun run test` passes
- [ ] `bun run build` passes
- [ ] `bun run test:e2e` passes (run `bun run build` first)
- [ ] New logic lives in `src/lib` and has a Vitest test
- [ ] For a new tool: it is registered in `src/lib/tools.js` and has a page in `src/routes/<category>/<slug>/`
- [ ] For a new tool that suits agents: it is added to `src/lib/agentTools.js`
- [ ] The change works in light and dark mode and on a phone-sized screen
- [ ] Commits are signed off (`git commit -s`)

## Screenshots

<!-- For UI changes, add before and after screenshots. -->
