LUT University, Lappeenranta (School of Engineering Science)

Software Development Skills — Fullstack module, Online course

Rajan Bam, 002295635

# LEARNING DIARY — FULLSTACK MODULE

> My goal for this module is to understand how to combine MongoDB, Express and
> Node.js with React into one working MERN application. I'm starting by reading the
> general course information and coding along with every video, and will then build
> my own project. This diary is updated as I go.

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
Learning outcome: I finally understood middleware: functions that run in order and call `next()`. I wrote a request logger as custom middleware and used the built-in `express.json()` to parse bodies. Splitting routes into a `Router` (`routes/tasks.js`) kept `server.js` clean — I plan to copy this structure into my real backend.

Date : 14.6.2026
Activity : Express crash course — request validation with `express-validator`.
Learning outcome: The module page told me to use `app.use(expressValidator());`, but when I installed the package it didn't work. After some searching on the docs and Stack Overflow, I found that this global-middleware style was from version 5 and was removed in version 6+. The current way is to attach `body()` / `param()` checks per route and read `validationResult(req)`. Working that difference out myself was a small but real lesson — tutorials get out of date, and reading the official docs is often faster than fighting the old syntax. I left a comment about it in the code.

Date : 16.6.2026
Activity : React crash course — components, state and hooks. Practised in `coursework/react-notes`.
Learning outcome: Components are just functions that return JSX, and props flow down from parent to child. The key idea was `useState`: calling the setter re-renders the component. `useEffect` for side effects (and its cleanup function) took a couple of tries to understand, especially the dependency array. I made a small `useFetch` custom hook, which showed me how reusable logic gets extracted.

Date : 18.6.2026
Activity : React crash course — events, routing and JSON Server.
Learning outcome: I learned controlled inputs (`value` + `onChange`) and how routing works with `react-router-dom` (`Routes`, `Route path`, `Link`, `useParams`, `useNavigate`). JSON Server was a nice surprise — it gives you a fake REST API from a single JSON file, so you can build the frontend before the backend exists. I used that idea to sketch my UI before wiring up the real Express API.

Date : 20.6.2026
Activity : Watched the "Learn the MERN Stack" example project (videos 1–4) and studied how the pieces fit together.
Learning outcome: This tied everything together: React talks to an Express API over `fetch`, Express talks to MongoDB through Mongoose, and JWT is used to keep the user logged in. Seeing the full request go from a button click in React all the way to a document in MongoDB and back was the moment the "stack" made sense as one thing rather than four separate tools. I now feel ready to design my own project.

_(Project build entries continue below as I work on them.)_
