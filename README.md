# Contest Notifier Web App

A web application that lists upcoming programming contests from multiple platforms and allows users to subscribe for notifications. Features include:

- Home page with upcoming contests
- User login and registration
- Profile page showing selected contests
- Notifications for selected contests
- Search contests by name or platform
- Service Worker push notifications

---

## Features

1. **Home Page**: View upcoming contests with details like platform, start time, and duration.  
2. **Profile**: Login, register, view selected contests, and logout.  
3. **Notifications**: Get notified for selected contests.  
4. **Search**: Search contests by name or platform.  
5. **Push Notifications**: Subscribe to contests and receive notifications before they start.

---

## Getting Started

### Prerequisites

- Node.js & npm installed
- Local server or hosting environment (e.g., Live Server extension in VS Code)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/<your-username>/<repo-name>.git
cd <repo-name>
```

2. Install dependencies (if any, e.g., Express for backend):
```bash 
npm install
```

3. Create a .env file in the root directory and add your keys:
```bash 
env:
VAPID_PUBLIC_KEY=your_public_vapid_key
VAPID_PRIVATE_KEY=your_private_vapid_key

You can generate VAPID keys using the web-push library:
npx web-push generate-vapid-keys
```
4.Start the server:
```bash 
node server.js
Open index.html in the browser (or use a local server for proper fetch requests).
```
---

### Usage
- Open the app in the browser.

- Register or login using your email.

- Browse contests on the Home page.

- Click Notify Me on contests to subscribe.

- View notifications in the Notifications tab.

---

### Folder Structure
```
project/
│
├──public/
│   ├── index.html
│   ├── login.html
│   ├── style.css
│   ├── app.js
│   ├── sw.js
│   └── .env   # (Do NOT push this to GitHub)
│
├── package.json
└── README.md
