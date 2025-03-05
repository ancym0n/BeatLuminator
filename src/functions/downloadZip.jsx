async function downloadZip(zip, name) {
  const blob = await zip.generateAsync({ type: "blob" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "BL-" + name + ".zip";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export default downloadZip;
