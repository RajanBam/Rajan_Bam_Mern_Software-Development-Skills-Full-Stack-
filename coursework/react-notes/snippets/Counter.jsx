// useState + events, from the crash course. A component that owns a bit of state
// and updates it in response to clicks.
import { useState } from 'react';

export default function Counter({ start = 0, step = 1 }) {
  const [count, setCount] = useState(start);

  return (
    <div>
      <p>Count: {count}</p>
      {/* pass a function to onClick — not the result of calling one */}
      <button onClick={() => setCount((c) => c + step)}>+{step}</button>
      <button onClick={() => setCount((c) => c - step)}>-{step}</button>
      <button onClick={() => setCount(start)}>reset</button>
    </div>
  );
}
