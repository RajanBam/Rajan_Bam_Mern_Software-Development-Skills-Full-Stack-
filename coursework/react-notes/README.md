# React (coding along)

Notes and snippets from the React crash course. The full React app I built is the
Inkboard `frontend/` — these are the smaller pieces I practised first. The `.jsx`
files here are illustrative snippets (the runnable React app is in `frontend/`).

## 1. Components
- Function components that return JSX.
- Props are read-only inputs passed from a parent (`<Counter start={5} />`).
- Lists need a stable `key`.

## 2. State & Hooks
- `useState` — local state; setting it re-renders. See `snippets/Counter.jsx`.
- `useEffect` — run side effects (fetching, subscriptions) after render; the
  dependency array controls when. Return a cleanup function. See `snippets/useFetch.js`.
- `useRef` — a mutable value that survives renders without causing one (I used this
  a lot in the whiteboard for pointer state and the canvas element).
- Custom hooks — extract reusable logic into a `useSomething()` function.

## 3. Events
- `onClick`, `onChange`, `onSubmit` with camelCase and a function handler.
- Controlled inputs: `value={x}` + `onChange={e => setX(e.target.value)}`.

## 4. JSON Server (fake REST API)
```bash
npm install -g json-server
json-server --watch db.json --port 5000
# gives GET/POST/PUT/DELETE on http://localhost:5000/<resource> instantly
```
Great for building the front-end before the real backend exists — I used this idea
before wiring Inkboard's React app to the real Express API.

## 5. Routing
- `react-router-dom`: `<BrowserRouter>`, `<Routes>`, `<Route path>`, `<Link>`,
  `useNavigate()`, `useParams()`. See `snippets/routing.jsx`.
- In Inkboard this is how `/board/:id` and the read-only `/shared/:shareId` work.

## How this fed into the project
Everything here shows up in `frontend/`: `AuthContext` is `useState` + `useEffect` +
a custom `useAuth()` hook; `useBoardSocket` and `useHistory` are custom hooks;
`useParams()` reads the board id; controlled inputs power the login form.
