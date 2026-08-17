# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e\rider-registration.spec.ts >> Rider registration flow >> submits rider onboarding form
- Location: e2e\rider-registration.spec.ts:7:3

# Error details

```
TimeoutError: page.waitForSelector: Timeout 10000ms exceeded.
Call log:
  - waiting for locator('text=My M & M Hub') to be visible

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - banner [ref=e4]:
    - generic [ref=e5]:
      - generic [ref=e6]:
        - generic [ref=e7]: M
        - generic [ref=e8]:
          - heading "Match & Market" [level=1] [ref=e9]
          - paragraph [ref=e10]: Rongai's Virtual Business Hub
      - textbox "Fresh meals, Soko, or culinary LPG refills..." [ref=e15]
      - generic [ref=e16]:
        - button "Sign In" [ref=e17]
        - button "Admin Portal Login" [ref=e18]
  - main [ref=e22]:
    - generic [ref=e23]:
      - generic [ref=e24]: Sponsor Ad banner
      - heading "Featured Local Offerings" [level=3] [ref=e29]
      - generic [ref=e30]:
        - generic [ref=e31]:
          - generic [ref=e32]:
            - text: Yusuf Dishes (Rongai Stage)
            - heading "Beef Pilau Royal" [level=4] [ref=e33]
            - paragraph [ref=e34]: Ksh 250
          - button [ref=e35]
        - generic [ref=e37]:
          - generic [ref=e38]:
            - text: Kisero Nairobi (Soko Plaza)
            - heading "Red Onion Net (2KG)" [level=4] [ref=e39]
            - paragraph [ref=e40]: Ksh 180
          - button [ref=e41]
        - generic [ref=e43]:
          - generic [ref=e44]:
            - text: Fun Zone Liquor Store
            - heading "Scotch Whisky Blend 750ml" [level=4] [ref=e45]
            - paragraph [ref=e46]: Ksh 1800
          - button [ref=e47]
    - generic [ref=e49]:
      - generic [ref=e50]:
        - generic [ref=e51]: Match and Market Business Hub
        - heading "Shop, Order, Secure." [level=2] [ref=e56]
        - paragraph [ref=e57]: The ultimate platform that gives businesses the tools they need to thrive in the digital economy at affordable rates and Customers easy, fast and secure transactions on orders.
      - generic [ref=e58]:
        - button "Merchant SaaS/Vendor Hub" [ref=e59]
        - button "Rider Delivery Jobs" [ref=e60]
    - generic [ref=e61]:
      - generic [ref=e62]:
        - generic [ref=e63]:
          - heading "Market Categories" [level=3] [ref=e64]
          - generic [ref=e65]:
            - button "Food & Beverages" [ref=e66]
            - button "M & M Soko" [ref=e70]
            - button "M & M Services" [ref=e74]
            - button "M & M Fun Zone" [ref=e78]
        - generic [ref=e82]:
          - heading "Gas-O-Meter Refill" [level=4] [ref=e83]
          - paragraph [ref=e87]: Enter your household information to predict LPG cylinder depletion date.
          - generic [ref=e88]:
            - generic [ref=e89]:
              - combobox [ref=e90]:
                - option "6KG Cylinder" [selected]
                - option "13KG Cylinder"
              - combobox [ref=e91]:
                - option "1 Person"
                - option "2 People" [selected]
                - option "4 People"
                - option "6+ People"
            - button "Calculate Prediction Date" [ref=e92]
        - generic [ref=e93]:
          - heading "Wholesale Chama Pools" [level=4] [ref=e94]
          - paragraph [ref=e101]: Get together and buy bulk agricultural products directly from farmers at absolute low costs.
          - generic [ref=e102]:
            - generic [ref=e103]:
              - paragraph [ref=e104]: 50KG Sack Red Onions (Soko Bulk Group Buy)
              - generic [ref=e105]:
                - generic [ref=e106]: "Total Price: Ksh 4000"
                - generic [ref=e107]: "Pay per Person: Ksh 400"
              - generic [ref=e110]:
                - generic [ref=e111]: 5/10 Portions
                - button "Join Pool?" [ref=e112]
            - generic [ref=e113]:
              - paragraph [ref=e114]: 50KG Sack Red Onions (Soko Bulk Group Buy)
              - generic [ref=e115]:
                - generic [ref=e116]: "Total Price: Ksh 4000"
                - generic [ref=e117]: "Pay per Person: Ksh 400"
              - generic [ref=e120]:
                - generic [ref=e121]: 5/10 Portions
                - button "Join Pool?" [ref=e122]
      - generic [ref=e123]:
        - generic [ref=e124]:
          - generic [ref=e125]:
            - heading "Trusted Local Merchants" [level=3] [ref=e126]
            - generic [ref=e127]: "Status: SECURE"
          - generic [ref=e129] [cursor=pointer]:
            - generic [ref=e130]:
              - img "Sugar Sugar" [ref=e131]
              - generic [ref=e132]: Merchant Verified
            - generic [ref=e133]:
              - heading "Sugar Sugar" [level=4] [ref=e134]
              - paragraph [ref=e135]: Independent Local Merchant Partner
              - generic [ref=e136]:
                - generic [ref=e137]: "Min order: Ksh 150"
                - generic [ref=e138]: 20-35 mins
        - generic [ref=e139]:
          - heading "Available Offers! (2)" [level=3] [ref=e141]
          - generic [ref=e147]:
            - generic [ref=e148]:
              - generic [ref=e149]:
                - generic [ref=e150]:
                  - generic [ref=e151]: Yusuf Dishes (Rongai Stage)
                  - generic [ref=e152]: Ksh 250
                - heading "Beef Pilau Royal" [level=4] [ref=e153]
                - paragraph [ref=e154]: Fragrant beef pilau served with spicy kachumbari.
              - button "Add to Basket" [ref=e156]
            - generic [ref=e159]:
              - generic [ref=e160]:
                - generic [ref=e161]:
                  - generic [ref=e162]: Yusuf Dishes (Rongai Stage)
                  - generic [ref=e163]: Ksh 350
                - heading "Swahili Chicken Biryani" [level=4] [ref=e164]
                - paragraph [ref=e165]: Spiced rice layering tender simmered chicken sauce.
              - button "Add to Basket" [ref=e167]
  - contentinfo [ref=e170]:
    - generic [ref=e171]:
      - generic [ref=e172]:
        - heading "M&M Help Desk" [level=4] [ref=e173]
        - paragraph [ref=e174]: Facing Payment, Order Issues, Delivery Delays or Any Other Concerns? Fill in for a Help Desk Ticket.
      - generic [ref=e176]:
        - textbox "Your Name" [ref=e177]
        - textbox "Mobile Number" [ref=e178]
        - combobox [ref=e179]:
          - option "Payment Dispute" [selected]
          - option "Merchant SaaS Billing"
          - option "Rider Routing Issue"
          - option "Other SLA Delay"
        - textbox "Describe your issue in detail..." [ref=e180]
        - button "File For Help Desk Ticket" [ref=e181]
  - generic [ref=e183]:
    - paragraph [ref=e184]: We leverage cookies to enhance your browsing experience and provide personalized content.
    - generic [ref=e185]:
      - button "Reject" [ref=e186]
      - button "Accept All" [ref=e187]
  - generic [ref=e189]:
    - button [ref=e190]
    - generic [ref=e194]:
      - generic [ref=e195]:
        - heading "Register Account" [level=3] [ref=e196]
        - paragraph [ref=e197]: Create your profile inside our local marketplace.
      - generic [ref=e198]:
        - generic [ref=e199]: Full Name / Merchant Username
        - textbox "e.g. Jane Wanjiku" [ref=e200]: PlaywrightUser
      - generic [ref=e201]:
        - generic [ref=e202]: M-Pesa Mobile Number
        - textbox "e.g. 0712345678" [ref=e203]: "0711200100"
      - generic [ref=e204]:
        - generic [ref=e205]: Email Address
        - textbox "e.g. jane@matchmarket.com" [ref=e206]: playwright-signup-1786957263508@example.com
      - generic [ref=e207]:
        - generic [ref=e208]:
          - generic [ref=e209]: Password
          - textbox "Create password" [ref=e210]: testpassword
        - generic [ref=e211]:
          - generic [ref=e212]: Confirm Password
          - textbox "Confirm password" [ref=e213]: testpassword
      - generic [ref=e214]:
        - generic [ref=e215]: Profile Picture URL
        - textbox "Optional image link" [ref=e216]
      - generic [ref=e217]:
        - generic [ref=e218]: Home / Pickup Address
        - textbox "e.g. 12 Mavazi Lane, Rongai" [ref=e219]
      - generic [ref=e220]:
        - generic [ref=e221]: Delivery Point
        - textbox "e.g. Maasai Lodge Route" [ref=e222]
      - generic [ref=e223]:
        - generic [ref=e224]: Profile Bio
        - textbox "Tell us more about yourself" [ref=e225]
      - generic [ref=e226]:
        - generic [ref=e227]: Pickup Notes
        - textbox "Any extra delivery or pickup instructions" [ref=e228]
      - generic [ref=e229]:
        - generic [ref=e230]: Profile Category
        - combobox [ref=e231]:
          - option "Customer/User" [selected]
          - option "Merchant Shop Owner (SaaS)"
          - option "Boda Delivery Rider"
      - button "Create Profile" [active] [ref=e232]
      - paragraph [ref=e233]: Already registered? Login here
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | // Minimal scaffold: run against local dev server (http://localhost:5173 by default for Vite)
  4  | // Ensure Playwright is installed and configured to run this test.
  5  | 
  6  | test.describe('Rider registration flow', () => {
  7  |   test('submits rider onboarding form', async ({ page }) => {
  8  |     const base = process.env.DEV_SERVER_URL || 'http://localhost:5174/';
  9  |     // Create a fresh account through the UI (customer) so we can apply to be a rider
  10 |     const ts = Date.now();
  11 |     const signupEmail = `playwright-signup-${ts}@example.com`;
  12 |     const signupPhone = `0711${Math.floor(Math.random() * 900000 + 100000)}`;
  13 | 
  14 |     // Force the app to show the rider enrollment UI during tests
  15 |     await page.addInitScript(() => {
  16 |       localStorage.setItem('MM_TEST_FORCE_RIDER_ENROLL', '1');
  17 |     });
  18 |     await page.goto(base);
  19 |     await page.click('text=Sign In');
  20 |     await page.click('text=Register New Account');
  21 | 
  22 |     await page.fill('input[placeholder="e.g. Jane Wanjiku"]', 'PlaywrightUser');
  23 |     await page.fill('input[placeholder="e.g. 0712345678"]', signupPhone);
  24 |     await page.fill('input[placeholder="e.g. jane@matchmarket.com"]', signupEmail);
  25 |     await page.fill('input[placeholder="Create password"]', 'testpassword');
  26 |     await page.fill('input[placeholder="Confirm password"]', 'testpassword');
  27 |     // Scope the select to the registration form and choose the visible label
  28 |     const regForm = page.locator('form:has-text("Register Account")');
  29 |     await regForm.waitFor({ state: 'visible', timeout: 5000 });
  30 |     await regForm.locator('select').first().selectOption({ label: 'Customer/User' });
  31 |     await page.click('button:has-text("Create Profile")');
  32 | 
  33 |     // After signup, wait for hub button and open dashboard
> 34 |     await page.waitForSelector('text=My M & M Hub', { timeout: 10000 });
     |                ^ TimeoutError: page.waitForSelector: Timeout 10000ms exceeded.
  35 |     await page.click('text=My M & M Hub');
  36 | 
  37 |     // Ensure dashboard loaded, then click the Rider tab
  38 |     await page.waitForSelector('text=M&M Control Center', { timeout: 10000 });
  39 |     const riderTab = page.locator('button', { hasText: '3. M&M Delivery' });
  40 |     await riderTab.scrollIntoViewIfNeeded();
  41 |     await riderTab.click();
  42 | 
  43 |     // Try to find Rider enrollment; if visible, submit it. Otherwise assume user already has rider profile view.
  44 |     const enrollment = page.locator('[data-testid="rider-enrollment"]');
  45 |     if (await enrollment.isVisible().catch(() => false)) {
  46 |       await page.fill('input[placeholder="e.g. Alex Njuguna"]', 'Playwright Rider');
  47 |       await page.fill('input[placeholder="e.g. KMCE 224Y"]', 'TEST 123X');
  48 |       await page.fill('input[placeholder="e.g. 0799887766"]', '0711000000');
  49 |       await page.fill('input[placeholder="Create password"]', 'testpassword');
  50 |       await page.fill('input[placeholder="Confirm password"]', 'testpassword');
  51 |       await page.click('button:has-text("Complete")');
  52 |       await expect(page.locator('text=Application Received').or(page.locator('text=Application submitted'))).toBeVisible({ timeout: 10000 });
  53 |     } else {
  54 |       // Enrollment not present — assert profile view present instead
  55 |       await expect(page.locator('text=My Profile Settings')).toBeVisible({ timeout: 5000 });
  56 |     }
  57 |   });
  58 | });
  59 | 
```