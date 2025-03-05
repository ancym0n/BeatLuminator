import homePage from "../functions/homePage";

function Loading({ procentage, setIsUploaded }) {
  procentage = procentage * 100;

  return (
    <div className="loading">
      <h1 className="text-large">
        {procentage === 100 ? "Generated" : "Generating..."}
      </h1>
      <div className="loadbar box">
        <div className="loaded" style={{ width: procentage + "%" }}></div>
      </div>
      <button
        onClick={() => {
          homePage(setIsUploaded);
        }}
        className="text-normal box config-button not-config-button"
      >
        Return
      </button>
    </div>
  );
}

export default Loading;
