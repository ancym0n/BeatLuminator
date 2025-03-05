function Upload({ onUploadClick }) {
  return (
    <div className="box upload-box">
      <h1 className="text-large">Upload your map</h1>
      <button onClick={onUploadClick} className="text-large gradient-button">
        Browse files
      </button>
    </div>
  );
}

export default Upload;
