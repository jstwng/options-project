import "./App.css";
import Latex from "react-latex";
import { useState } from "react";

function App() {
  var blackScholes = "$$C(S_t, t)=N(d_{+})S_t-N(d\\_)Ke^{-r(T-t)}$$";
  var dPlus =
    "$$d_{+}=\\frac{1}{\\sigma\\sqrt{T-t}}[\\ln(\\frac{S_t}{K})+(r+\\frac{\\sigma^2}{2})(T-t)]$$";
  var dMinus = "$$d\\_=d_{+}-\\sigma\\sqrt{T-t}$$";

  const [value, setValue] = useState("20");
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setValue(e.target.value);
  }

  const calcValue = parseFloat(value) * 2;

  return (
    <>
      <h1>Black-Scholes Formula</h1>
      <div style={{ display: "inline" }}>
        <Latex>{blackScholes}</Latex>
      </div>
      <h3 style={{ display: "inline" }}>= {calcValue}</h3>
      <br></br>
      <h3 style={{ display: "inline" }}>Where: </h3>
      <div style={{ display: "inline" }}>
        <Latex>{dPlus}</Latex>
      </div>
      <h3 style={{ display: "inline", marginLeft: "2px", marginRight: "2px" }}>
        and
      </h3>
      <div style={{ display: "inline" }}>
        <Latex>{dMinus}</Latex>
      </div>
      <div style={{ display: "flex" }}>
        <h3 style={{ display: "inline", marginRight: "20px" }}>
          <em>S = </em>{" "}
          <input
            className="textbox"
            type="text"
            id="username"
            name="username"
            value={value}
            onInput={handleChange}
          />
        </h3>
        <input
          className="slider"
          style={{ display: "block", marginTop: "16px" }}
          type="range"
          value={value}
          onInput={handleChange}
          min="0"
          max="40"
        />
      </div>
    </>
  );
}

export default App;
