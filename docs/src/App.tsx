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
    t: 45, // Current time
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

    const sign = x >= 0 ? 1 : -1;
    x = Math.abs(x);

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
    const { K, σ, r } = variables;
    const gridSize = 20;

    let xCoordinates = [];
    let yCoordinates = [];
    let zCoordinates = [];
    let allData = [];

    for (let i = 0; i < gridSize; i++) {
      let xRow = [];
      let yRow = [];
      let zRow = [];
      for (let j = 0; j < gridSize; j++) {
        const workingS = 0.5 * variables.S + 0.05 * j * variables.S;
        const workingTime =
          0.5 * (variables.T - variables.t) +
          0.05 * i * (variables.T - variables.t);

        const dPlus =
          (1 / (σ * Math.sqrt(workingTime))) *
          (Math.log(workingS / K) + (r + σ ** 2 / 2) * workingTime);
        const dMinus = dPlus - σ * Math.sqrt(workingTime);

        const optionPrice =
          normalCDF(dPlus) * workingS -
          normalCDF(dMinus) * K * Math.exp(-r * workingTime);

        xRow.push(workingTime);
        yRow.push(workingS);
        zRow.push(optionPrice);
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
      <h3 style={{ display: "inline" }}>Theoretical call option price </h3>
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
            defaultValue={8.04}
            step={0.01}
            onChange={(newValue) => handleChange("S", newValue)}
          />
          <NewVariable
            label="Time-to-expiry"
            symbol="T"
            min={variables.t + 0.01}
            max={100}
            defaultValue={50}
            step={0.01}
            onChange={(newValue) => handleChange("T", newValue)}
          />
          <NewVariable
            label="Current time in years"
            symbol="t"
            min={0}
            max={variables.T - 0.01}
            defaultValue={45}
            step={0.01}
            onChange={(newValue) => handleChange("t", newValue)}
          />
          <NewVariable
            label="Strike price"
            symbol="K"
            min={0}
            max={100}
            step={0.01}
            defaultValue={31.74}
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
              colorbar: {
                len: 0.6, // Adjust the height of the color bar (relative to the plot height)
                thickness: 20, // Adjust the width of the color bar
              },
            },
          ]}
          layout={{
            width: 600,
            height: 800,
            title: {
              text: "Theoretical European-style call option price evolution with BSM",
            },
            scene: {
              xaxis: { title: { text: "Expiry time" } },
              yaxis: { title: { text: "Asset price" } },
              zaxis: { title: { text: "Call option price" } },
              camera: {
                eye: { x: 2.1, y: -2.1, z: 1.7 },
              },
            },
          }}
        />
      </div>
    </>
  );
}

export default App;
