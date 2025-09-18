

# 📂 File: `App.js`

### 1. Import React + Hooks

```js
import React, { useState } from "react";
```

* `React` → the React library for building UI.
* `useState` → React Hook for managing component state (variables that change when users interact).

---

### 2. Component Declaration

```js
function App() {
```

* Defines a **functional component** called `App`.
* React will render everything inside this function.

---

### 3. Define State Variables

```js
const [term, setTerm] = useState("");
const [data, setData] = useState(null);
const [error, setError] = useState(null);
const [loading, setLoading] = useState(false);
```

* `term` → stores what user types in the search box.
* `data` → stores the response from the API (term + definition).
* `error` → stores error messages (if API fails, invalid input, etc.).
* `loading` → boolean flag to show a "Loading..." indicator.

👉 Each has a corresponding setter function (`setTerm`, `setData`, etc.).

---

### 4. Search Handler

```js
const handleSearch = async () => {
```

Triggered when user clicks **Search button**.

#### (a) Validate Input

```js
if (!term) {
  setError("Please enter a term");
  return;
}
```

* If user presses Search without typing → show error.

#### (b) Reset State

```js
setError(null);
setLoading(true);
setData(null);
```

* Clear previous errors.
* Set loading state → show spinner/message.
* Clear old results.

#### (c) Build API URL

```js
const url = `${process.env.REACT_APP_API_URL}?term=${encodeURIComponent(term)}`;
console.log("Fetching from:", url);
```

* Uses **environment variable** `REACT_APP_API_URL` (your API Gateway endpoint).
* Appends the `term` as query parameter.
* `encodeURIComponent` ensures safe URL encoding (handles spaces, symbols, etc.).

#### (d) Fetch Data

```js
const res = await fetch(url);
if (!res.ok) {
  throw new Error(`HTTP error! status: ${res.status}`);
}
const json = await res.json();
setData(json);
```

* Calls your API.
* If status is not 200 → throw error.
* Otherwise, parse JSON and store it in `data`.

#### (e) Handle Errors

```js
} catch (err) {
  console.error("Fetch error:", err);
  setError(err.message);
} finally {
  setLoading(false);
}
```

* If fetch fails → store error in `error`.
* Always set `loading` to false when done (success or fail).

---

### 5. JSX (UI Rendering)

```js
return (
  <div style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
    <h1>Cloud Dictionary</h1>
```

* Top-level container with some inline styles.
* Page title: **Cloud Dictionary**.

#### (a) Input + Button

```js
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
```

* Input field → bound to `term` via `value` and `setTerm`.
* Search button → calls `handleSearch`.

#### (b) Conditional Rendering

```js
{loading && <p>Loading...</p>}
{error && <p style={{ color: "red" }}>Error: {error}</p>}
```

* If `loading === true` → shows "Loading...".
* If `error !== null` → shows red error message.

#### (c) Show Result

```js
{data && data.term && (
  <div style={{ marginTop: "1rem" }}>
    <h2>Result</h2>
    <p>
      <strong>{data.term}</strong>: {data.definition}
    </p>
  </div>
)}
```

* If API returned `data` → display **term + definition**.
* Example:

  ```
  Result
  lambda: A serverless compute service on AWS.
  ```

---

### 6. Export Component

```js
export default App;
```

* Makes `App` component available for rendering in `index.js`.

---

## ✅ In Short:

* **State Management**: Stores input, results, errors, loading.
* **API Call**: Fetches from Lambda via API Gateway.
* **Validation**: Prevents empty searches.
* **Conditional UI**: Shows loading/error/result dynamically.
* **User-Friendly**: Case-insensitive search handled by Lambda.

---
