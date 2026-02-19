# P4-02 Fallback UI Runtime Failure Verification

- Date (UTC): 2026-02-19
- Scope: Frontend error boundary fallback quality
- Environment: local dev server (`http://127.0.0.1:4173`)
- Tester: Cascade (assisted)

## Verification approach

A development-only QA crash route was added at `/__qa/runtime-crash` to force a render-time exception and validate boundary behavior in a deterministic way.

## Checks executed

### 1) Fallback UI renders with expected recovery controls

Command:

```powershell
node -e "import('playwright').then(async ({ chromium }) => { const browser = await chromium.launch({ headless: true }); const page = await browser.newPage(); const pageErrors = []; page.on('pageerror', (err) => pageErrors.push(err.message)); await page.goto('http://127.0.0.1:4173/__qa/runtime-crash', { waitUntil: 'domcontentloaded', timeout: 20000 }); await page.waitForSelector('text=Something went wrong', { timeout: 15000 }); const titleCount = await page.getByText('Something went wrong', { exact: true }).count(); const tryAgainCount = await page.getByRole('button', { name: 'Try Again' }).count(); const goDashboardCount = await page.getByRole('button', { name: 'Go to Dashboard' }).count(); const bodyText = await page.textContent('body'); const hasSupportCopy = bodyText?.includes('has been logged and our team will investigate.') ?? false; console.log(JSON.stringify({ titleCount, tryAgainCount, goDashboardCount, hasSupportCopy, pageErrorCount: pageErrors.length, firstPageError: pageErrors[0] ?? null })); await browser.close(); if (titleCount < 1 || tryAgainCount < 1 || goDashboardCount < 1 || !hasSupportCopy) { process.exit(1); } }).catch((error) => { console.error(error); process.exit(1); });"
```

Observed output:

```json
{"titleCount":1,"tryAgainCount":1,"goDashboardCount":1,"hasSupportCopy":true,"pageErrorCount":2,"firstPageError":"Intentional runtime crash for error boundary QA verification"}
```

Result: PASS

### 2) Recovery navigation exits fallback state

Command:

```powershell
node -e "import('playwright').then(async ({ chromium }) => { const browser = await chromium.launch({ headless: true }); const page = await browser.newPage(); await page.goto('http://127.0.0.1:4173/__qa/runtime-crash', { waitUntil: 'domcontentloaded', timeout: 20000 }); await page.waitForSelector('text=Something went wrong', { timeout: 15000 }); await page.getByRole('button', { name: 'Go to Dashboard' }).click(); await page.waitForURL(/\/(dashboard|login)/, { timeout: 15000 }); const fallbackVisible = (await page.getByText('Something went wrong', { exact: true }).count()) > 0; console.log(JSON.stringify({ postNavUrl: page.url(), fallbackVisibleAfterNav: fallbackVisible })); await browser.close(); if (fallbackVisible) { process.exit(1); } }).catch((error) => { console.error(error); process.exit(1); });"
```

Observed output:

```json
{"postNavUrl":"http://127.0.0.1:4173/dashboard","fallbackVisibleAfterNav":false}
```

Result: PASS

## Conclusion

Fallback UI quality for runtime failures is verified for P4-02:

- Fallback view renders clear copy and action buttons.
- Runtime failures are caught by the boundary and presented safely.
- Recovery navigation exits fallback state as expected.
