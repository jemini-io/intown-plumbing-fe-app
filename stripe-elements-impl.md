🚧 GOAL:
I'm embedding a Stripe-powered payment form in an iframe on a 3rd-party website (that I do NOT control). My frontend is a single Next.js app hosted on Render, and I will point a custom domain (e.g., https://intownplumbingtx.app.com) to that Render app.

🛠️ TASK:
Audit the codebase and make the changes necessary to:
1. Create a secure, iframe-compatible page at `/video-consultation-form` that:
   - Uses Stripe Elements (Payment Element or Card Element)
   - Talks to an internal API route that creates a PaymentIntent and returns the `client_secret`
   - Confirms the payment client-side via Stripe.js

2. Ensure iframe security compatibility:
   - Page is embeddable via iframe from a known third-party origin (e.g., https://clientwebsite.com)
   - Adjust CSP and headers to allow this (prefer CSP over `X-Frame-Options`)
   - Recommend how to lock down origin validation (server-side origin check or token-based auth)

3. Add optional postMessage logic to send messages from iframe to parent after:
   - Payment success
   - Payment error
   - (Optional) Validation failure

✅ Current stack:
- Next.js (App Router or Pages — auto-detect)
- Hosted on Render (currently using default `.onrender.com` domain, will later switch to custom domain)
- Stripe SDK is available

## Current State Analysis

✅ **Already Implemented:**
- Multi-step form flow at `/video-consultation-form`
- API route for creating PaymentIntents (`/api/create-checkout-session`)
- Test iframe file (`test/test-embed.html`)
- Basic form validation and error handling
- Stripe SDK dependencies installed

❌ **Needs Conversion to Stripe Elements:**
- Replace `EmbeddedCheckoutStep.tsx` with custom Stripe Elements implementation
- Update API route to create PaymentIntents instead of Checkout Sessions
- Add client-side payment confirmation logic
- Implement iframe security and postMessage communication

## High-Level Design Pattern

### File Structure
```
app/
├── (routes)/video-consultation-form/
│   ├── page.tsx (modify: use StripeElementsStep)
│   └── components/
│       ├── StripeElementsStep.tsx (new: replace EmbeddedCheckoutStep)
│       ├── ServiceSelectionStep.tsx (existing)
│       ├── AppointmentDateStep.tsx (existing)
│       ├── ContactStep.tsx (existing)
│       └── ConfirmationStep.tsx (existing)
├── api/
│   └── create-payment-intent/
│       └── route.ts (new: create PaymentIntent)
└── middleware.ts (new: origin validation)

lib/
├── middleware/
│   └── iframe-security.ts (new: validate origins)
└── utils/
    └── postMessage.ts (new: communicate with parent)

components/
└── IframeLayout.tsx (new: iframe-specific styling)

test/
└── test-embed.html (modify: add postMessage listeners)
```

### Key Methods & Components

**API Layer:**
- `POST /api/create-payment-intent` - Creates PaymentIntent, returns client_secret
- `validateIframeOrigin()` - Middleware function to check allowed origins

**Frontend Components:**
- `StripeElementsStep` - Main payment component using PaymentElement
- `PaymentForm` - Inner component handling form submission
- `IframeLayout` - Wrapper for iframe-specific styling and height adjustment

**Utilities:**
- `sendToParent()` - Send postMessage to parent window
- `listenToParent()` - Listen for messages from parent window
- `resizeIframe()` - Adjust iframe height based on content

**Security:**
- `iframeSecurityMiddleware()` - Validate origin headers
- CSP headers in `next.config.js` - Allow iframe embedding

## Suggested Implementation Plan

### Phase 1: Convert to Stripe Elements
- Create `app/api/create-payment-intent/route.ts` - PaymentIntent creation endpoint
- Replace `EmbeddedCheckoutStep.tsx` with `StripeElementsStep.tsx` using PaymentElement
- Update form flow in `page.tsx` to use new component
- Test payment flow with Stripe test cards

### Phase 2: Iframe Security
- Add CSP headers in `next.config.js` for frame-ancestors directive
- Create `lib/middleware/iframe-security.ts` for origin validation
- Implement `middleware.ts` to apply security checks
- Test iframe embedding from allowed domains

### Phase 3: Parent Communication
- Create `lib/utils/postMessage.ts` utilities
- Add postMessage calls in `StripeElementsStep` for payment events
- Create `components/IframeLayout.tsx` for iframe-specific styling
- Update `test/test-embed.html` with message listeners

### Phase 4: Testing & Deployment
- Test iframe embedding scenarios
- Validate CSP headers and origin validation
- Test payment flow end-to-end
- Deploy to Render and test with client domains

## Security Considerations

**Origin Validation:**
- Server-side origin check using middleware
- Whitelist of allowed domains in environment variables
- CSP frame-ancestors directive

**Communication:**
- postMessage for iframe-to-parent communication
- Validate message origins in parent window
- Secure token-based authentication (optional)

## Testing Strategy

**Unit Tests:**
- Origin validation logic
- postMessage utilities
- Payment flow components

**Integration Tests:**
- Iframe embedding scenarios
- Payment confirmation flow
- Parent window communication

**Manual Testing:**
- Embed from various client domains
- Test responsive design in different iframe sizes
- Payment flow with test cards
- Error scenarios (declined cards, network issues)

## Deployment Checklist

- [ ] Stripe Elements implementation complete
- [ ] PaymentIntent API route created
- [ ] CSP headers configured
- [ ] Origin validation middleware implemented
- [ ] postMessage communication added
- [ ] Iframe-specific styling applied
- [ ] Environment variables configured
- [ ] Test suite passing
- [ ] Manual testing completed
- [ ] Client domains whitelisted
- [ ] Production deployment tested
