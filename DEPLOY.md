# Deploying Farm Wars to Cloudflare

Farm Wars is not a plain web page. It runs a small server so that four teams on
four devices can share one room code, and it stores each room in a database.
That is why it needs a host that can run code, not just serve files.

Cloudflare's free plan covers a classroom comfortably. The whole setup below is
a one-time job of about fifteen minutes. After that, publishing an update is a
single command.

You need Node.js 22 or newer installed. Check with `node --version`.

---

## Step 1 — Create a free Cloudflare account

Sign up at <https://dash.cloudflare.com/sign-up> and verify your email address.
You do not need to buy a domain and you do not need to enter a card.

## Step 2 — Open a terminal in the project folder

Open the `farm-wars-classroom` folder, then open a terminal there. On Windows,
type `cmd` into the folder's address bar and press Enter.

## Step 3 — Install the project's dependencies

```
npm install
```

This downloads the libraries the game needs. It takes a few minutes the first
time and creates a `node_modules` folder you never need to touch.

## Step 4 — Log in to Cloudflare from the terminal

```
npx wrangler login
```

Your browser opens and asks you to authorise Wrangler, Cloudflare's command
line tool. Click **Allow**, then return to the terminal.

## Step 5 — Create the database

```
npx wrangler d1 create site-creator-d1
```

This creates the database that stores the game rooms. The command prints a
block of text containing a `database_id` — a long code that looks like
`a1b2c3d4-5e6f-7890-abcd-ef1234567890`.

**Copy that `database_id`. You need it in the next step.**

## Step 6 — Put the database ID into the project

Open `vite.config.ts` in any text editor. Near the top you will find this line:

```ts
const SITE_CREATOR_PLACEHOLDER_DATABASE_ID =
  '00000000-0000-4000-8000-000000000000';
```

Replace the zeros with your own `database_id`, keeping the quote marks:

```ts
const SITE_CREATOR_PLACEHOLDER_DATABASE_ID =
  'a1b2c3d4-5e6f-7890-abcd-ef1234567890';
```

Save the file.

## Step 7 — Build the game

```
npm run build
```

This produces a `dist` folder containing the version of the game that
Cloudflare will run.

## Step 8 — Publish it

```
npx wrangler deploy --config dist/server/wrangler.json
```

When it finishes, the terminal prints your live address — something like
`https://farm-wars-classroom.your-name.workers.dev`.

Open it in a browser. The game is live. The database creates its own table the
first time a room is made, so there is nothing else to configure.

---

## Using it in class

Share the address with students however you normally share links: on the board,
in Google Classroom, or as a QR code.

One pair presses **Start multiplayer room**, then **Create server room**, and
reads out the four-letter code. The other pairs open the same address on their
own devices, press **Start multiplayer room**, and join with that code. Play
begins when every team has joined and finished setup.

If the school Wi-Fi fails, the title screen has a **one-device pass and play**
option that needs no internet connection at all once the page has loaded.

## Publishing an update later

After changing anything in the game, run these two commands again:

```
npm run build
npx wrangler deploy --config dist/server/wrangler.json
```

The address stays the same, so any link you have already shared keeps working.

## Testing on your own machine first

```
npm run dev
```

Then open <http://localhost:3000>. This runs the complete game, multiplayer
included, without publishing anything. Press `Ctrl + C` in the terminal to stop.

To try a multiplayer room by yourself, open the address in several browser tabs
and treat each tab as a different team.

## Checking the game logic still works

```
npm run verify:game
```

This replays whole seasons and checks the science model: that pesticide only
helps when there actually are locusts, that a low-impact strategy beats a
polluting one overall, and so on. It prints `all passed` when the game is
behaving.

---

## If something goes wrong

**`npx wrangler login` never returns to the terminal.** Close the browser tab
it opened, press `Ctrl + C`, and run the command again.

**The deploy command says it cannot find the config file.** Run `npm run build`
first — `dist/server/wrangler.json` only exists after a build.

**The site loads but joining a room fails.** The `database_id` in
`vite.config.ts` probably does not match the database you created. Run
`npx wrangler d1 list` to see your databases and their IDs, correct the file,
then build and deploy again.

**You want to start over.** Deleting the Worker and the database from the
Cloudflare dashboard removes everything; repeating steps 5 to 8 recreates it.
