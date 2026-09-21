import { useState } from "react";

import "./App.css";

export default function App() {
  const [items, setItems] = useState<string[]>([]);

  return (
    <>
      <button
        type="button"
        className="counter"
        onClick={() => setItems((prev) => [...prev, `item ${prev.length + 1}`])}
      >
        Add item ({items.length})
      </button>

      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </>
  );
}
