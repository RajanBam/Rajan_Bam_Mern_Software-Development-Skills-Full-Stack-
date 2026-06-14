# Express.js (coding along)

`mini-app/` is a small tasks API I built while following the Express crash course.
It demonstrates the four ideas the video covers:

1. **Routing** — `express.Router()` in `routes/tasks.js`, mounted at `/api/tasks`.
2. **Middleware** — `express.json()`, a custom logger, and an error handler,
   each calling `next()` in turn.
3. **Request bodies** — reading `req.body` / `req.params`.
4. **Validation** — with `express-validator`.

## Run it
```bash
cd mini-app
npm install
npm start           # http://localhost:4000
```

Then try:
```bash
curl localhost:4000/api/tasks
curl -X POST localhost:4000/api/tasks -H "Content-Type: application/json" -d '{"title":"Learn MERN"}'
curl -X POST localhost:4000/api/tasks -H "Content-Type: application/json" -d '{"title":""}'   # -> 400 validation error
```

## A note on the validation snippet
The module page says to use `app.use(expressValidator());`. That global-middleware
style is from **express-validator v5** and was removed in v6. The current version
(v7) attaches validators per route with `body()` / `param()` and reads the result
with `validationResult()`. I used the modern approach and left a comment in
`server.js` explaining the difference — figuring that out was a small lesson in
how fast these tools move between tutorial and today.
