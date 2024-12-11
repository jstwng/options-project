import "./App.css";
import Latex from "react-latex";
import NewVariable from "./newVariable";
import { useState } from "react";
import Plot from "react-plotly.js";

function App() {
  type VariableSymbol = "S" | "T" | "t" | "K" | "r" | "σ";
  const [variables, setVariables] = useState({
    S: 50, // Asset price
    T: 50, // Time to expiry
    t: 0, // Current time
    K: 50, // Strike price
    r: 0.05, // Risk-free rate
    σ: 0.2, // Volatility
  });

  function erf(x: number) {
    // Constants for the approximation
    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const p = 0.3275911;

    // Save the sign of x
    const sign = x >= 0 ? 1 : -1;
    x = Math.abs(x);

    // Approximation formula
    const t = 1 / (1 + p * x);
    const y =
      1 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

    return sign * y;
  }

  const handleChange = (symbol: VariableSymbol, value: number) => {
    setVariables((prev) => ({ ...prev, [symbol]: value }));
  };

  const calculateDPlus = () => {
    const { S, K, r, σ, T, t } = variables;
    const timeToMaturity = T - t;
    return (
      (1 / (σ * Math.sqrt(timeToMaturity))) *
      (Math.log(S / K) + (r + σ ** 2 / 2) * timeToMaturity)
    );
  };

  const calculateDMinus = (dPlus: number) => {
    const { σ, T, t } = variables;
    const timeToMaturity = T - t;
    return dPlus - σ * Math.sqrt(timeToMaturity);
  };

  // Cumulative normal distribution function, N()
  const normalCDF = (x: number) => {
    return (1.0 + erf(x / Math.sqrt(2.0))) / 2.0;
  };

  // N'()
  const normalPDF = (x: number) => {
    return (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * x * x);
  };

  const calculateOptionPrice = () => {
    const { S, K, r, T, t } = variables;
    const dPlus = calculateDPlus();
    const dMinus = calculateDMinus(dPlus);
    const timeToMaturity = T - t;

    return (
      normalCDF(dPlus) * S -
      normalCDF(dMinus) * K * Math.exp(-r * timeToMaturity)
    );
  };

  const calculateGamma = () => {
    const { S, σ, T, t } = variables;
    const dPlus = calculateDPlus();
    const timeToMaturity = T - t;

    return normalPDF(dPlus) / (S * σ * Math.sqrt(timeToMaturity));
  };

  const calculateVega = () => {
    const { S, T, t } = variables;
    const dPlus = calculateDPlus();
    const timeToMaturity = T - t;

    return S * normalPDF(dPlus) * Math.sqrt(timeToMaturity);
  };

  const calculateTheta = () => {
    const { S, σ, T, t, r, K } = variables;
    const dPlus = calculateDPlus();
    const dMinus = calculateDMinus(dPlus);
    const timeToMaturity = T - t;

    return (
      -(S * normalPDF(dPlus) * σ) / (2 * Math.sqrt(timeToMaturity)) -
      r * K * (Math.E ^ (-r * timeToMaturity)) * normalCDF(dMinus)
    );
  };

  const generateData = () => {
    const { S, K, T, t, r } = variables;
    const timeToMaturity = T - t;

    let xCoordinates = []; // Time values
    let yCoordinates = []; // Asset price values
    let zCoordinates = []; // Surface heights (e.g., option price)
    let allData = [];

    for (let i = 0; i < 20; i++) {
      let xRow = [];
      let yRow = [];
      let zRow = [];
      for (let j = 0; j < 20; j++) {
        let workingS = 0.5 * S + 0.05 * j * S;
        let workingTime = 0.5 * timeToMaturity + 0.05 * i * timeToMaturity;

        xRow.push(workingTime);
        yRow.push(workingS);
        zRow.push(
          normalCDF(calculateDPlus()) * workingS -
            normalCDF(calculateDMinus(calculateDPlus())) *
              K *
              Math.exp(-r * workingTime)
        );
      }
      xCoordinates.push(xRow);
      yCoordinates.push(yRow);
      zCoordinates.push(zRow);
    }
    allData.push(xCoordinates);
    allData.push(yCoordinates);
    allData.push(zCoordinates);
    return allData;
  };

  const calculateRho = () => {
    const { K, T, t, r } = variables;
    const dMinus = calculateDMinus(calculateDPlus());
    const timeToMaturity = T - t;

    return (
      K * timeToMaturity * (Math.E ^ (-r * timeToMaturity)) * normalCDF(dMinus)
    );
  };

  var f = function () {
    return (1.0 + erf(calculateDPlus() / Math.sqrt(2.0))) / 2.0;
  };
  const optionPrice = calculateOptionPrice();
  const delta = normalCDF(calculateDPlus());
  const gamma = calculateGamma();
  const vega = calculateVega();
  const theta = calculateTheta();
  const rho = calculateRho();

  var blackScholes = "$$C(S_t, t)=N(d_{+})S_t-N(d\\_)Ke^{-r(T-t)}$$";
  var dPlus =
    "$$d_{+}=\\frac{1}{\\sigma\\sqrt{T-t}}[\\ln(\\frac{S_t}{K})+(r+\\frac{\\sigma^2}{2})(T-t)]$$";
  var dMinus = "$$d\\_=d_{+}-\\sigma\\sqrt{T-t}$$";

  return (
    <>
      <h1>
        European-style call option, priced with Black-Scholes and Merton (BSM)
      </h1>
      <div style={{ display: "inline" }}>
        <Latex>{blackScholes}</Latex>
      </div>
      <h3 style={{ display: "inline" }}>= {optionPrice.toFixed(2)}</h3>
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
      <br></br>
      <div style={{ marginBottom: "10px" }}></div>
      <div>
        <div className="sliderdiv">
          <NewVariable
            label="Varying Asset Price"
            symbol="S"
            min={0}
            max={100}
            defaultValue={50}
            step={0.01}
            onChange={(newValue) => handleChange("S", newValue)}
          />
          <NewVariable
            label="Time-to-expiry"
            symbol="T"
            min={0}
            max={100}
            defaultValue={50}
            step={0.01}
            onChange={(newValue) => handleChange("T", newValue)}
          />
          <NewVariable
            label="Current time in years"
            symbol="t"
            min={0}
            max={variables.T}
            defaultValue={0}
            step={0.01}
            onChange={(newValue) => handleChange("t", newValue)}
          />
          <NewVariable
            label="Strike price"
            symbol="K"
            min={0}
            max={100}
            step={0.01}
            defaultValue={50}
            onChange={(newValue) => handleChange("K", newValue)}
          />
          <NewVariable
            label="Risk-free interest rate"
            symbol="r"
            min={0}
            max={0.2}
            step={0.002}
            defaultValue={0.05}
            onChange={(newValue) => handleChange("r", newValue)}
          />
          <NewVariable
            label="Underlying volatility"
            symbol="σ"
            min={0}
            max={2}
            defaultValue={0.2}
            step={0.02}
            onChange={(newValue) => handleChange("σ", newValue)}
          />
        </div>
        <div className="greeks">
          <h3>
            <b>The Greeks</b>
          </h3>
          <h3>Delta (Δ): {delta.toFixed(3)}</h3>
          <h3>Gamma (Γ): {gamma.toFixed(3)}</h3>
          <h3>Vega (ν): {vega.toFixed(3)}</h3>
          <h3>Theta (θ): {theta.toFixed(3)}</h3>
          <h3>Rho (ρ): {rho.toFixed(3)}</h3>
        </div>
      </div>
      <div className="plot">
        <Plot
          data={[
            {
              type: "surface",
              x: generateData()[0],
              y: generateData()[1],
              z: generateData()[2],
            },
          ]}
          layout={{
            width: 800,
            height: 700,
            title: {
              text: "Theoretical European-style call option price evolution with Black-Scholes and Merton",
            },
          }}
        />
      </div>
    </>
  );
}

export default App;
