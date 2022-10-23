import { useState } from "react";

function App() {
    const [code, setCode] = useState("");
    const [hours, setHours] = useState(0);
    const [desc, setDesc] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const [challengeId, setChallengeId] = useState("53");
    const [response, setResponse] = useState("");
    const [challengeResponse, setChallengeResponse] = useState("");
    const [testCases, setTestCases] = useState([]);

    const timeControl = async () => {
        const reqOptions = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                hours
            }),
        };

        const res = await fetch("/api/admin/fastForward", reqOptions);
    };

    const createSubmission = async () => {
        console.log(code);
        const reqOptions = {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            source: code,
            problemId: challengeId,
          }),
        };

        const res = await fetch("/api/challenge", reqOptions);
        const data = await res.json();
        console.log(data);
        setResponse(JSON.stringify(data));
      };




    return (
    <div>
        <h1>Admin Dashboard</h1>
        <h2>Time Control</h2>
        Change time by x hours <br/> <br/>
        <input onChange={(e) => setHours(e.target.value)} value={hours} type="number" min="0"/> <br/> <br/>
        <button onClick={timeControl}> Go! </button>

        <h2>Create a Challenge</h2>
        Name: <input type="text" id="name" value="Two Sum" /> <br/> <br/>
        Description: <textarea type="text" id="desc" value="Given a target array find a pair of numbers which sums to target." /> <br/> <br/>
        Start Date: <input type="datetime-local" id="startDate" /> <br/> <br/>
        End Date: <input type="datetime-local" id="endDate" />  <br/> <br/>
        Test Cases <br/> <br/>
        {
            testCases.map(t => {
                return (
                    <div>
                        <p>Input: {t.input}</p>
                        <p>Expected Output: {t.output}</p>
                    </div>
                )
            })
        }
        Input: <input type="text" id="tcInput" /> Expected Output: <input type="text" id="tcOutput" /> <br/> <br/>
        <button onClick={() => {const joined = testCases.concat({})}}>Create Test Case</button> <br/> <br/>

        <button onClick={createSubmission}>Submit</button>
        <p> <strong>Response: </strong> <br/> {challengeResponse || "No response yet"}</p>

        <h2>Create a Challenge Submission</h2>
        Challenge ID: <input onChange={(e) => setChallengeId(e.target.value)} value={challengeId} /> <br/> <br/>
        Source Code: <br/> <br/>
        <textarea onChange={(e) => setCode(e.target.value)} value={code} /> <br/> <br/>
        <button onClick={createSubmission}>Submit</button>
        <p> <strong>Response: </strong> <br/> {response || "No response yet"}</p>
    </div>
  );
}

export default App;
