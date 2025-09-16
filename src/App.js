import React, { useState } from "react";

function App() {
  const [term, setTerm] = useState("");
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!term) {
      setError("Please enter a term");
      return;
    }

    setError(null);
    setLoading(true);
    setData(null);

    try {
      const url = `${process.env.REACT_APP_API_URL}?term=${encodeURIComponent(
        term
      )}`;
      console.log("Fetching from:", url);

      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      <h1>Cloud Dictionary</h1>

      <div style={{ marginBottom: "1rem" }}>
        <input
          type="text"
          placeholder="Enter a term (e.g. lambda)"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          style={{ padding: "0.5rem", fontSize: "1rem", marginRight: "0.5rem" }}
        />
        <button
          onClick={handleSearch}
          style={{
            padding: "0.5rem 1rem",
            fontSize: "1rem",
            cursor: "pointer",
          }}
        >
          Search
        </button>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>Error: {error}</p>}

      {data && data.term && (
        <div style={{ marginTop: "1rem" }}>
          <h2>Result</h2>
          <p>
            <strong>{data.term}</strong>: {data.definition}
          </p>
        </div>
      )}
    </div>
  );
}

export default App;
