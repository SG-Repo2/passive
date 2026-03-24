# chiwebdev.com MVP

Production-ready MVP for a zero-maintenance lead-gen website that audits a public website, checks a handful of tracking and SEO basics, generates plain-English recommendations, and emails the full report.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Serverless route handlers
- Resend for email delivery with a mock fallback
- OpenAI Responses API for the LLM enhancement with a rules-based fallback

## File Structure

```text
.
├── .env.example
├── .gitignore
├── README.md
├── app
│   ├── api
│   │   └── audit
│   │       └── route.ts
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components
│   ├── audit-form.tsx
│   ├── results-panel.tsx
│   └── status-pill.tsx
├── lib
│   ├── audit.ts
│   ├── email.ts
│   ├── llm.ts
│   ├── report.ts
│   ├── types.ts
│   └── validators.ts
├── next-env.d.ts
├── next.config.ts
├── package.json
├── postcss.config.mjs
└── tsconfig.json
```

## Features

- Landing page with website URL and email capture
- Single `/api/audit` route that:
  - validates input
  - blocks local/private targets for basic SSRF protection
  - fetches public HTML
  - detects GTM, GA4, and Meta Pixel
  - checks title tag and meta description
  - generates a summary
- LLM enhancement step that turns raw findings into:
  - a simple explanation
  - 3 to 5 recommended fixes
  - a business impact explanation
- Results UI with pass/fail indicators and a teaser preview
- Full report delivery by email through Resend, or mock delivery in local development
- CTA button that opens a mail draft

## Environment Variables

Copy `.env.example` to `.env.local` and fill in the values you want to use.

```bash
cp .env.example .env.local
```

Required for the best production setup:

- `OPENAI_API_KEY`: enables AI-enhanced summaries and recommendations
- `OPENAI_MODEL`: optional override, defaults to `gpt-4.1-mini`
- `RESEND_API_KEY`: enables real email delivery
- `AUDIT_REPORT_FROM_EMAIL`: verified sender identity in Resend, for example `Chi Web Dev <audits@yourdomain.com>`
- `NEXT_PUBLIC_CONTACT_EMAIL`: used for the CTA mailto link

Fallback behavior:

- If `OPENAI_API_KEY` is missing, the app uses a rules-based explanation and action plan.
- If `RESEND_API_KEY` or `AUDIT_REPORT_FROM_EMAIL` is missing, the app runs email delivery in mock mode and logs the full report on the server.

## Local Setup

1. Install Node.js 20 or newer.
2. Install dependencies:

   ```bash
   npm install
   ```

3. Copy `.env.example` to `.env.local` and add your environment variables.
4. Start the app:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000).

## Deploying on Vercel

1. Create a new Vercel project and import this repository.
2. Add the same environment variables from `.env.local` to the Vercel project.
3. Deploy. No database, migrations, cron jobs, or background workers are required.

## API Contract

`POST /api/audit`

Request body:

```json
{
  "url": "https://example.com",
  "email": "owner@example.com"
}
```

Response body:

```json
{
  "auditedUrl": "https://example.com/",
  "finalUrl": "https://example.com/",
  "httpStatus": 200,
  "contentType": "text/html; charset=utf-8",
  "tracking": {
    "gtm": {
      "label": "Google Tag Manager",
      "detected": true,
      "details": "Found GTM-XXXXXXX."
    },
    "ga4": {
      "label": "GA4",
      "detected": true,
      "details": "Found gtag script."
    },
    "metaPixel": {
      "label": "Meta Pixel",
      "detected": false,
      "details": "No Meta Pixel script or fbq() call was detected in the HTML."
    }
  },
  "seo": {
    "titleTag": {
      "label": "Title tag",
      "passed": true,
      "details": "Title detected: Example Title"
    },
    "metaDescription": {
      "label": "Meta description",
      "passed": false,
      "details": "No meta description tag was found."
    }
  },
  "summary": "We detected 2 of 3 tracking essentials in the page HTML. One of the two basic SEO checks is missing. The page responded normally and was audited from public HTML.",
  "teaser": {
    "simpleExplanation": "This audit found a few tracking and SEO gaps in the public HTML.",
    "actionableFixes": [
      "Install Meta Pixel for remarketing and conversion visibility.",
      "Write a stronger meta description to improve search click-through rate."
    ],
    "businessImpact": "Missing tracking and metadata usually lowers visibility and makes lead attribution harder."
  },
  "delivery": {
    "mode": "resend",
    "sent": true,
    "message": "Full report sent to owner@example.com."
  }
}
```

## Notes

- This MVP intentionally audits the fetched HTML only. Some sites inject tags after load, so a browser-based audit would catch more edge cases.
- The route includes basic SSRF protection by rejecting localhost, local TLDs, and private/reserved IP ranges.
- The default design is intentionally polished but dependency-light so it deploys cleanly on Vercel.
