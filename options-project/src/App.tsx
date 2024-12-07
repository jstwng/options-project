import "./App.css";
import Latex from "react-latex";
import { useState } from "react";

function App() {
  const blackScholes = "$$C(S_t, t)=N(d_{+})S_t-N(d\\_)Ke^{-r(T-t)}$$";
  const dPlus =
    "$$d_{+}=\\frac{1}{\\sigma\\sqrt{T-t}}[\\ln(\\frac{S_t}{K})+(r+\\frac{\\sigma^2}{2})(T-t)]$$";
  const dMinus = "$$d\\_=d_{+}-\\sigma\\sqrt{T-t}$$";

  const [value, setValue] = useState("");
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setValue(e.target.value);
  }

  return (
    <>
      <h1>This is the Black-Scholes Formula</h1>
      <Latex>{blackScholes}</Latex>
      <br></br>
      <h3>Where: </h3>
      <Latex>{dPlus}</Latex>
      <br></br>
      <Latex>{dMinus}</Latex>
      <br></br>
      <input
        className="slider"
        type="range"
        value={value}
        onInput={handleChange}
        min="0"
        max="40"
      />
      <br></br>
      <h3>{value}</h3>
    </>
  );
}

export default App;
