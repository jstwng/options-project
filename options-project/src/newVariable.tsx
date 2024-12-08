import React from "react";

interface VariableProps {
  label: string; // Label for the slider
  symbol: string;
  min: number; // Minimum value for the slider
  max: number; // Maximum value for the slider
  defaultValue: number; // Default value for the slider
  onChange: (value: number) => void; // Callback when value changes
  step: number;
}

interface VariableState {
  value: number; // Current value of the slider
}

export default class NewVariable extends React.Component<
  VariableProps,
  VariableState
> {
  constructor(props: VariableProps) {
    super(props);
    this.state = {
      value: props.defaultValue, // Initialize state with the default value
    };
  }

  handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    this.setState({ value: newValue });
    this.props.onChange(newValue); // Call the parent callback
  };

  render() {
    const { label, symbol, min, max, step } = this.props;
    const { value } = this.state;
    return (
      <div style={{ width: "500px" }}>
        <div style={{ float: "left" }}>
          <h3 style={{ display: "inline", marginRight: "5px" }}>
            {label}, <em>{symbol}</em> =
          </h3>
          <input
            className="textbox"
            type="text"
            id="username"
            name="username"
            value={value}
            onInput={this.handleChange}
          />
        </div>
        <div style={{ float: "right", height: "23px" }}>
          <input
            className="slider"
            style={{ display: "block", marginTop: "3px" }}
            type="range"
            value={value}
            onInput={this.handleChange}
            min={min}
            max={max}
            step={step}
          />
        </div>
      </div>
    );
  }
}
