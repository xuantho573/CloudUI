import { useState } from "react";

import reactLogo from "@cloud-ui/shared/assets/react.svg";
import "./App.css";

interface AppProps {
  label?: string;
}

function App({ label }: AppProps) {
  const [count, setCount] = useState(0);

  return (
    <section className="remote-card">
      <header>
        <img src={reactLogo} className="framework" alt="" width="48" height="48" />
        <div>
          <h2>React remote</h2>
          <p className="origin">{label ?? "running standalone"}</p>
        </div>
      </header>

      <p>
        Edit <code>apps/react-remote/src/App.tsx</code> and save to test <code>HMR</code>.
      </p>

      <button type="button" className="counter" onClick={() => setCount((c) => c + 1)}>
        Count is {count}
      </button>
    </section>
  );
}

export default App;
