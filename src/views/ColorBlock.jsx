import { useRef, useState } from "react";

function ColorBlock({ initialColor, colorConfig }) {
  let config = initialColor === "red" ? colorConfig.red : colorConfig.blue;
  initialColor = config
    ? `rgb(${config[0]}, ${config[1]}, ${config[2]})`
    : initialColor;

  const [bgColor, setBgColor] = useState(initialColor);
  const colorInputRef = useRef(null);

  const handleClick = () => {
    colorInputRef.current.click();
  };

  const handleColorChange = (e) => {
    const hex = e.target.value;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    setBgColor(`rgb(${r}, ${g}, ${b})`);
  };

  return (
    <div>
      <div
        className="color-block"
        onClick={handleClick}
        style={{
          backgroundColor: bgColor,
        }}
      >
        <input
          ref={colorInputRef}
          type="color"
          style={{ opacity: 0 }}
          onChange={handleColorChange}
        />
      </div>
    </div>
  );
}

export default ColorBlock;
