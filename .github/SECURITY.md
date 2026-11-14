# Security policy

## Supported versions

Only the latest release receives security fixes. Mools is a static website, so the live site at https://maling-it.github.io/tools/ always runs the newest version.

| Version | Supported |
| --- | --- |
| Latest 1.x release | Yes |
| Older releases | No, please update |

## Reporting a vulnerability

**Please do not open a public issue for a security problem.** Report it privately instead:

1. Go to the [Security tab](https://github.com/maling-it/tools/security/advisories/new) of this repository.
2. Choose **Report a vulnerability** and describe the problem.

Only the maintainers can read the report. Please include:

- what the problem is and which page, tool or file it affects,
- steps to reproduce it, or a small example,
- the impact you expect (for example "a crafted input runs a script on the page"),
- your browser and operating system, if it matters.

## What to expect

This is a small, volunteer-run project, so these are goals rather than guarantees:

- You will get a first reply within about a week.
- We will confirm whether we can reproduce the problem and keep you updated.
- Fixes are released as soon as they are ready, and the reporter is credited in the advisory unless they prefer to stay anonymous.
- Please give us a reasonable time to fix the problem before you share it publicly.

## What counts as a vulnerability

Most tools run entirely in your browser and Mools has no accounts and no server of its own, which keeps the attack surface small. Examples we care about:

- cross-site scripting (a tool or page that runs script from user input),
- a tool that sends user input to another site without saying so,
- problems in the MCP server (`mcp/server.js`) such as running arbitrary commands or reading files it should not,
- a weakness in how tools handle secrets, for example logging passwords or tokens,
- a dependency with a known vulnerability that is reachable in Mools.

Things that are usually **not** vulnerabilities: results that are only an estimate (such as the token counter or the password strength meter), the JWT decoder not verifying signatures (documented behavior), and denial of service from pasting huge input into your own browser tab. Reports about those are still welcome as normal issues.

## Good-faith research

If you make a good-faith effort to follow this policy, we will not take action against you. Please do not access other people's data, degrade the service for others or test against systems that are not yours.
