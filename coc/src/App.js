import { useState } from "react";

function App() {
  const [code, setCode] = useState("");
  const [response, setResponse] = useState("");

  const onClick = async () => {
    console.log(code);
    const reqOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source: code,
        problemId: 53,
      }),
    };

    const res = await fetch("/api/challenge", reqOptions);
    const data = await res.json();
    console.log(data);
    setResponse(JSON.stringify(data));
  };

  return (
    <div>
      <textarea onChange={(e) => setCode(e.target.value)} value={code} />
      <button onClick={onClick}>Submit</button>
      <p>{response}</p>
    </div>
  );
}

export default App;
