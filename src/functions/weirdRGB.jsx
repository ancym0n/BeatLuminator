function weirdRGB(element) {
  let rgb = element
    .getAttribute("style")
    .split("rgb(")[1]
    .replace(");", "")
    .split(", ");
  let newColor = rgb.map((value) => {
    let normalized = parseFloat(value) / 255;
    return Math.round(normalized * 1000) / 1000;
  });
  let colors = { r: newColor[0], g: newColor[1], b: newColor[2] };
  return colors;
}

export default weirdRGB;
