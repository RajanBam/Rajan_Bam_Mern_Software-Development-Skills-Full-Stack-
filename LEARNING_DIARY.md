LUT University, Lappeenranta (School of Engineering Science)

Software Development Skills — Fullstack module, Online course

Rajan Bam, 002295635

# LEARNING DIARY — FULLSTACK MODULE

> My goal for this module was to understand how to combine MongoDB, Express and
> Node.js with React into one working MERN application. I started by reading the
> general course information, then coded along with every video, and finally built
> my own project — **Inkboard**, a hand-drawn collaborative whiteboard. Below is
> what I did and learned, day by day.

---

Date : 2.6.2026
Activity : Read the general course information and the environment-setup page. Installed Node.js and set up the project on GitHub.
Learning outcome: I understood that the point of this module is not just to follow tutorials but to end up with a project I can actually show to an employer. I set up a fresh git repository, wrote a first README and made my first commit. I already had git from an earlier module, but I re-watched the intro to remind myself of `git add` / `commit` / `push`. I decided to keep the repo organised from the start with separate `backend/`, `frontend/` and `coursework/` folders so it wouldn't turn into a mess later.

Date : 3.6.2026
Activity : Node.js crash course — the `path` and `url` modules. Coded along in `coursework/node-fundamentals/01-path-and-url.js`.
Learning outcome: I learned that Node has a big standard library and that I should use `path.join` instead of gluing strings with slashes, because it handles the differences between operating systems. The new `URL` class with `searchParams` is a clean way to read query strings — I noted this because I knew I'd need it when handling requests later.

Date : 4.6.2026
Activity : Node.js crash course — the `fs` and `events` modules (`02-fs.js`, `03-events.js`).
Learning outcome: The callback style of `fs` got confusing fast with nested callbacks, so I switched to `fs/promises` with `async/await` and it read much better. The `events` module was the big lesson of the day: once I understood `EventEmitter` with `.on()` and `.emit()`, a lot of things clicked — I could see that this same pattern is what Express requests and, later, Socket.IO are built on.

Date : 6.6.2026
Activity : Node.js crash course — built an HTTP server from scratch with **no** Express (`04-http-server.js`).
Learning outcome: This was the most useful exercise so far. Writing routing by hand with `if (method === 'GET' && url === '/')`, and collecting the POST body chunk by chunk with `req.on('data')`, showed me exactly what Express does for me. Everything I later took for granted — routing, body parsing, `res.json()` — I first had to do manually here, so I appreciate the framework a lot more now.

Date : 8.6.2026
Activity : MongoDB crash course. Installed MongoDB **as a service** (following the module note) and practised CRUD in `mongosh`. Notes in `coursework/mongodb-notes/crud-cheatsheet.md`.
Learning outcome: Installing it as a service means the database starts automatically, which saved me the trouble of starting it every time. I learned the basic shape of MongoDB: databases → collections → documents, and the four operations `insertOne/find/updateOne/deleteOne`. The query operators (`$gt`, `$in`, `$set`, `$push`) took a little getting used to coming from SQL, but the JSON-like syntax felt natural with JavaScript.

Date : 10.6.2026
Activity : MongoDB — the same CRUD but from Node with the native `mongodb` driver (`crud-with-driver.js`), plus a look at indexes.
Learning outcome: I connected to MongoDB from a Node script and ran the operations in code rather than the shell. Adding an index with `createIndex({ shareId: 1 }, { unique: true })` and seeing that `unique` enforces no-duplicates was a good moment — later I realised Mongoose's `unique: true` in a schema is exactly this. This is the bridge between "MongoDB the database" and "MongoDB in my app".

Date : 12.6.2026
Activity : Express crash course — built a small tasks API (`coursework/express-notes/mini-app`) covering routing and middleware.
Learning outcome: I finally understood middleware: functions that run in order and call `next()`. I wrote a request logger as custom middleware and used the built-in `express.json()` to parse bodies. Splitting routes into a `Router` (`routes/tasks.js`) kept `server.js` clean — I copied this structure straight into my real backend later.

Date : 14.6.2026
Activity : Express crash course — request validation with `express-validator`.
Learning outcome: The module page told me to use `app.use(expressValidator());`, but when I installed the package it didn't work. After some searching on the docs and Stack Overflow, I found that this global-middleware style was from version 5 and was removed in version 6+. The current way is to attach `body()` / `param()` checks per route and read `validationResult(req)`. Working that difference out myself was a small but real lesson — tutorials get out of date, and reading the official docs is often faster than fighting the old syntax. I left a comment about it in the code.

Date : 16.6.2026
Activity : React crash course — components, state and hooks. Practised in `coursework/react-notes`.
Learning outcome: Components are just functions that return JSX, and props flow down from parent to child. The key idea was `useState`: calling the setter re-renders the component. `useEffect` for side effects (and its cleanup function) took a couple of tries to understand, especially the dependency array. I made a small `useFetch` custom hook, which showed me how reusable logic gets extracted — something I leaned on heavily in my project.

Date : 18.6.2026
Activity : React crash course — events, routing and JSON Server.
Learning outcome: I learned controlled inputs (`value` + `onChange`) and how routing works with `react-router-dom` (`Routes`, `Route path`, `Link`, `useParams`, `useNavigate`). JSON Server was a nice surprise — it gives you a fake REST API from a single JSON file, so you can build the frontend before the backend exists. I used that idea to sketch my UI before wiring up the real Express API.

Date : 20.6.2026
Activity : Watched the "Learn the MERN Stack" example project (videos 1–4) and studied how the pieces fit together.
Learning outcome: This tied everything together: React talks to an Express API over `fetch`, Express talks to MongoDB through Mongoose, and JWT is used to keep the user logged in. Seeing the full request go from a button click in React all the way to a document in MongoDB and back was the moment the "stack" made sense as one thing rather than four separate tools. I now felt ready to design my own project.

Date : 22.6.2026
Activity : Decided on my project and scaffolded the backend. I chose **Inkboard**, a hand-drawn collaborative whiteboard, because I wanted something genuinely useful and visually distinctive rather than another to-do list. Set up `backend/` with Express, a `.env`, and the MongoDB connection.
Learning outcome: I spent real time choosing the idea — I wanted a project with an actual "engine" behind it (a canvas renderer and live collaboration), not just forms saving to a database. On the code side I learned to keep configuration in `.env` with `dotenv`, and to separate the Express `app` from the server that starts it, which makes the code tidier and easier to test.

Date : 24.6.2026
Activity : Built authentication — the `User` model, password hashing with bcrypt, and JWT login/register.
Learning outcome: I learned to hash passwords with `bcryptjs` and never store them in plain text, and to set `select: false` on the hash so it isn't accidentally sent to the client. JWTs were new to me: the server signs a token on login, the client sends it back in the `Authorization: Bearer` header, and a `protect` middleware verifies it on each request. Getting the middleware to attach `req.user` and then reusing it across routes felt like a real "aha" for how auth works.

Date : 26.6.2026
Activity : Built the `Board` model and the boards CRUD API (create, list, read, update, delete) plus a public read-only share endpoint.
Learning outcome: A design decision I'm happy with: I store the whole drawing as one `elements` array on the board document instead of a separate collection per shape, so loading a board is a single read. I also learned to check ownership in every controller (return 403 if the board isn't yours) — security has to be on the server, not just hidden in the UI. The `shareId` with a `unique` index powers the public link.

Date : 28.6.2026
Activity : Added real-time collaboration with Socket.IO.
Learning outcome: This was the hardest and most rewarding part. I learned about Socket.IO "rooms" — each board is a room, and changes are broadcast only to people in that room. I authenticated the socket connection using the same JWT as the API. To avoid hammering the database, I persist the scene on a 1-second debounce instead of on every change. Seeing two browser windows update each other live for the first time was easily the best moment of the module.

Date : 30.6.2026
Activity : Started the React frontend — Vite setup, auth context, and the login/register pages.
Learning outcome: I set up Vite and used its dev-server proxy so the frontend can call `/api` without CORS headaches. I built an `AuthContext` with `useContext` so any component can read the current user, and a small `fetch` wrapper that attaches the token automatically. This is where all the React practice paid off — context, hooks and controlled forms all came together.

Date : 1.7.2026
Activity : Built the Apple-inspired landing page and the light/dark theme.
Learning outcome: I wanted the marketing page to look clean and professional (I took inspiration from apple.com), even though the app itself is playful and hand-drawn. I learned to drive a whole theme from CSS custom properties and switch it by setting a `data-theme` attribute, and to do scroll-reveal animations with `IntersectionObserver` instead of a heavy library. Keeping the animations in plain CSS kept the page fast.

Date : 2.7.2026
Activity : Built the core canvas engine — the geometry helpers and the hand-drawn renderer using rough.js.
Learning outcome: This was the most algorithm-heavy day. I learned how the HTML5 canvas works with a transform for pan and zoom, and I had to write my own geometry: bounding boxes, hit-testing a point against each shape type, and converting between screen and "world" coordinates. rough.js gives the sketchy look; I learned to give each shape a fixed random `seed` so it doesn't re-wobble on every repaint — a subtle bug that confused me until I understood why.

Date : 3.7.2026
Activity : Made the canvas interactive — freehand pen, selecting/moving/resizing shapes, undo/redo, and the toolbar.
Learning outcome: I learned to handle pointer events (down/move/up) as a small state machine, and to keep live drawing separate from the undo history so that dragging a shape doesn't create hundreds of undo steps. `useRef` was essential here for holding values that shouldn't trigger re-renders. The freehand pen uses perfect-freehand to turn raw points into a smooth outline.

Date : 4.7.2026
Activity : Wired multiplayer into the editor and added the extra features — laser pointer, stickers, PNG export, the boards dashboard and the public shared-board view.
Learning outcome: I connected the canvas to the Socket.IO hook so local changes broadcast and remote changes merge in, and rendered other people's cursors and laser trails. Exporting to PNG taught me to render the scene to an off-screen canvas cropped to the content. Bringing the dashboard, editor and share page together under React Router made it feel like a finished product rather than a demo.

Date : 5.7.2026
Activity : Wrote the README with run instructions, prepared the demo-video file, tidied the coursework, and finished this learning diary. Final testing.
Learning outcome: Writing clear setup instructions made me double-check that the project really runs from a fresh clone (install, `.env`, seed, run). Looking back over the month, the biggest thing I learned is how the four MERN technologies connect into a single flow — a click in React travels through Express, into MongoDB, and back — and, with Socket.IO, out to everyone else in real time. I'm proud that I ended up with a project I'd genuinely be happy to show in a job application.

---

## Summary — what I can now do
- Build a REST API with Express (routing, middleware, validation, error handling).
- Model data with MongoDB/Mongoose and reason about queries and indexes.
- Handle authentication properly with hashed passwords and JWT.
- Add real-time features with Socket.IO (rooms, presence, broadcasting).
- Build a React single-page app with hooks, context, custom hooks and routing.
- Tie it all together into one deployable MERN project — and make it look good.
