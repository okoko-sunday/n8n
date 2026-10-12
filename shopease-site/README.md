# ShopEase website

The customer-facing website for **ShopEase**, a fictional small Nigerian online shop. It is the front end for **The Operations Autopilot**, an n8n automation that:

1. receives customer requests from this website,
2. classifies them with AI (Sales, Payment or Delivery),
3. routes them to the right team, or to a human when the AI isn't confident,
4. logs them in Google Sheets, and
5. emails the customer a confirmation.

The site is plain HTML, CSS and JavaScript. There is no build step, no npm and no framework, so you can upload the folder as it is.

## Pages

| File | What it is |
| --- | --- |
| `index.html` | Home page: hero, what we help with, how it works teaser |
| `request.html` | **The request form.** Sends requests to the n8n webhook |
| `how-it-works.html` | Plain-language explanation of the automation |
| `team.html` | The project team (generated from `js/team.js`) |

```
shopease-site/
├── index.html
├── request.html
├── how-it-works.html
├── team.html
├── css/styles.css        ← all styling (one shared file)
├── js/config.js          ← THE ONLY FILE YOU NEED TO EDIT FOR SETUP
├── js/main.js            ← menu, active link, footer year
├── js/request.js         ← form validation and sending
├── js/team.js            ← team list and rendering
├── images/logo.svg
├── images/team/          ← team photos (see README.txt inside)
└── README.md
```

---

## 1. Run it on your computer

You need Python 3, which is already installed on most Mac and Linux machines. Open a terminal in the folder that contains `shopease-site`:

```bash
cd shopease-site && python3 -m http.server 8000
```

Then open **http://localhost:8000** in your browser. Press `Ctrl + C` in the terminal to stop the server.

> Opening the files with a double-click (`file://…`) mostly works, but always test the form through the local server. Browsers treat `file://` pages differently when they send requests.

Until you add your webhook URL, the request page shows a yellow banner saying **"Webhook URL not configured — see js/config.js"** and doesn't send anything. This is expected.

---

## 2. Connect the form to n8n

### In n8n

1. Open your workflow and add a **Webhook** node as the trigger, or open the existing one.
2. Set it up like this:
   - **HTTP Method:** `POST`
   - **Path:** `support-request`
   - **Respond:** `Immediately`
   - **Options → Add option → Allowed Origins (CORS):** `*`, or your site's address, e.g. `https://shopease-demo.netlify.app`
3. **Save**, then **activate / publish** the workflow using the toggle at the top right. The production URL only works while the workflow is active.
4. In the Webhook node, open the **Production URL** tab and copy the URL.
   ⚠️ Use the **Production URL**, not the **Test URL**. The Test URL only works while you are clicking "Listen for test event".

### On the website

Open `js/config.js` and paste the URL:

```js
const CONFIG = {
  WEBHOOK_URL: "https://your-name.app.n8n.cloud/webhook/support-request",
  DEMO_EMAIL: "",
  RESPONSE_TIME: "within 24 hours",
  SHOP_NAME: "ShopEase"
};
```

Save the file and reload the page. The yellow banner should be gone.

### What n8n receives

The website sends a `POST` request with `Content-Type: application/json` and exactly this body:

```json
{
  "name": "Chidi Okafor",
  "email": "chidi@example.com",
  "message": "Do you have a laptop available for ₦300,000?",
  "submitted_at": "2026-10-12T09:30:00.000Z",
  "source": "shopease_website"
}
```

In n8n expressions the fields are available as:

- `{{ $json.body.name }}`
- `{{ $json.body.email }}`
- `{{ $json.body.message }}`
- `{{ $json.body.submitted_at }}`
- `{{ $json.body.source }}`

Before anything is sent, the website trims spaces from every field and lowercases the email. n8n should still validate the data itself, because anyone can call the webhook directly (see section 7).

> Everything in `js/config.js` is visible to anyone who opens the site. Never put passwords, API keys or tokens in it. The webhook URL is fine there.

---

## 3. Add team members and photos

1. Put each photo in `images/team/`. Use square images, at least 400×400, JPG/PNG/WebP, under 300 KB.
2. Open `js/team.js` and edit the `TEAM` list at the top:

```js
const TEAM = [
  { name: "Sunday Okoko", title: "Workflow Engineer", bio: "Built the n8n automation and AI routing.",
    photo: "images/team/sunday.jpg",
    linkedin: "https://www.linkedin.com/in/your-profile",
    github: "https://github.com/your-username" },
  // add, remove or reorder people here
];
```

- Leave `bio`, `linkedin` or `github` as `""` to hide them.
- If a photo is missing, or the path is wrong, the card shows a coloured circle with the person's initials instead.
- You don't need to edit `team.html`.

---

## 4. Deploy (put it online)

### Option A: Netlify Drop (easiest, no account setup needed to try)

1. Go to **https://app.netlify.com/drop**.
2. Drag the whole `shopease-site` folder onto the page.
3. Netlify gives you a live link like `https://random-name.netlify.app`. Sign in to keep the site and rename it.
4. To update the site later, drag the folder again in **Site → Deploys**.

### Option B: GitHub Pages

1. Create a new repository on GitHub, e.g. `shopease-site`.
2. Upload the **contents** of the `shopease-site` folder, so `index.html` is at the top level of the repo. Use **Add file → Upload files**, or git.
3. Go to **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**, branch `main`, folder `/ (root)`, and click **Save**.
5. After a minute your site is live at `https://YOUR-USERNAME.github.io/shopease-site/`.

All links in the site are relative, so it works from a subfolder like this.

After deploying, set **Allowed Origins (CORS)** in the n8n Webhook node to your live address, or keep `*`.

---

## 5. Demo mode (for the live presentation)

Open the request page with `?demo=1` at the end of the address:

```
http://localhost:8000/request.html?demo=1
https://your-site.netlify.app/request.html?demo=1
```

A **Demo samples** panel appears above the form with five buttons:

| Button | Message |
| --- | --- |
| Clear – Sales | Do you have a laptop available for ₦300,000? |
| Clear – Payment | I paid ₦45,000 for order #4521 yesterday but I haven't received a payment confirmation. |
| Clear – Delivery | My parcel for order #3310 was supposed to arrive on Friday. Can you give me the tracking update? |
| Ambiguous | There is a problem with what happened yesterday. Please sort it out. |
| Ambiguous – overlapping | I was charged twice and the item still hasn't come. Should I cancel? |

Each button fills in a name and the message. Type an email address, then press **Send request**.
To skip typing the email every time, set `DEMO_EMAIL` in `js/config.js` to an inbox you can show on screen.

Without `?demo=1` the panel is completely hidden.

---

## 6. Troubleshooting

| Problem | What to check |
| --- | --- |
| **Yellow "Webhook URL not configured" banner** | `WEBHOOK_URL` in `js/config.js` still contains `YOUR-N8N-INSTANCE`. Paste your real Production URL. |
| **Error message after pressing Send, console shows 404** | You probably pasted the **Test URL** (it contains `/webhook-test/`). Use the **Production URL** (`/webhook/`). Also check that the workflow is **active**. The production URL returns 404 when it isn't. |
| **Console shows a CORS error** ("blocked by CORS policy", "No 'Access-Control-Allow-Origin' header") | In the n8n Webhook node, go to **Options → Allowed Origins (CORS)** and set it to `*` or your site's exact address (no trailing slash). Save and re-activate the workflow. |
| **Success message shows, but nothing appears in n8n** | Open **Executions** in n8n and look for failed runs. Make sure you are looking at the right workflow and that it is active. Check that the URL in `config.js` matches the Production URL exactly. |
| **Request times out after 15 seconds** | Set the Webhook node to **Respond: Immediately** so n8n replies before the AI steps run. |
| **Team photos not showing (initials instead)** | The path in `js/team.js` must match the file name exactly, including upper/lower case (`Sunday.JPG` ≠ `sunday.jpg`). Check the file is really in `images/team/`. |
| **Changes not showing after an edit** | Hard-refresh the page (`Ctrl + Shift + R`, or `Cmd + Shift + R` on Mac). |

To see error details, open the browser's developer tools (`F12`, or right-click → **Inspect**) and look at the **Console** tab. The site logs submission errors there.

---

## 7. Test n8n's own validation with curl

The website blocks bad input, but anyone can call the webhook directly. This command sends a deliberately broken request (blank name, invalid email, blank message) so you can check that your n8n workflow rejects it before calling the AI:

```bash
curl -X POST "YOUR_PRODUCTION_URL" -H "Content-Type: application/json" -d '{"name":"   ","email":"bad","message":"   "}'
```

Replace `YOUR_PRODUCTION_URL` with your webhook URL, then check **Executions** in n8n to confirm it took the validation/rejection path.

A valid test request for comparison:

```bash
curl -X POST "YOUR_PRODUCTION_URL" -H "Content-Type: application/json" -d '{"name":"Test User","email":"test@example.com","message":"Do you have a laptop available for ₦300,000?","submitted_at":"2026-10-12T09:30:00.000Z","source":"shopease_website"}'
```

---

## Built-in protections

- **Validation:** name (required, ≤100 characters), email (required, valid format, ≤150), request (optional, up to 2000 characters).
- **Spam honeypot:** a hidden `website` field. If a bot fills it in, nothing is sent but the bot sees a normal success message.
- **15-second timeout:** if n8n doesn't answer in time, the user sees a friendly "try again" message and keeps what they typed.
- **No secrets in the code:** the only setting is the public webhook URL.
