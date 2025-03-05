import { useRef, useState } from "react";
import { useZip } from "./functions/ZipContext";
import JSZip, { file } from "jszip";
import "./App.css";
import Dashboard from "./views/Dashboard";
import Upload from "./views/Upload";
import homePage from "./functions/homePage";

function App() {
  const fileInputRef = useRef(null);
  const [isUploaded, setIsUploaded] = useState(false);
  const [coverURL, setCoverURL] = useState(null);
  const [mapDetails, setMapDetails] = useState(null);

  const { setGlobalZip } = useZip();

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (event) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    const file = selectedFiles[0];
    if (!file.name.endsWith(".zip")) {
      console.error("Not a .zip file:", file.name);
      return;
    }

    try {
      const zip = new JSZip();
      const zipFile = await zip.loadAsync(file);
      setGlobalZip(zipFile);
      let mapInfo = false;
      for (const filename of Object.keys(zipFile.files)) {
        if (
          filename.toLowerCase().endsWith(".jpg") ||
          filename.toLowerCase().endsWith(".png")
        ) {
          const blobData = await zipFile.files[filename].async("blob");
          const imgUrl = URL.createObjectURL(blobData);
          setCoverURL(imgUrl);
        } else if (filename.toLowerCase().endsWith(".dat")) {
          const fileData = await zipFile.files[filename].async("text");

          if (filename.toLowerCase() === "info.dat") {
            let infoAsJSON = JSON.parse(fileData);
            setMapDetails({
              artist: infoAsJSON._songAuthorName,
              mapCreator: infoAsJSON._levelAuthorName,
              mapName: infoAsJSON._songName,
            });
            mapInfo = true;
          }
          // console.log(`Extracted file: ${filename}`, fileData);
        }
      }

      if (mapInfo) setIsUploaded(true);
    } catch (error) {
      console.error("Error reading ZIP file:", error);
    }
  };

  return (
    <div>
      {isUploaded ? (
        <img
          id="go-back"
          className="box"
          onClick={() => {
            homePage(setIsUploaded);
          }}
          src="home.svg"
          alt=""
        />
      ) : (
        ""
      )}
      <div
        id="logo"
        onClick={() =>
          window.open("https://github.com/ancym0n/BeatLuminator", "_blank")
        }
      >
        <img src="logo.svg" alt="" />
        <h1 className="text-huge gradient">BeatLuminator</h1>
      </div>

      {/* Hidden file input to accept only .zip */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".zip"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />

      {/* Conditionally render UI based on state */}
      <div id="canvas">
        {isUploaded ? (
          <Dashboard
            image={coverURL}
            mapDetails={mapDetails}
            setIsUploaded={setIsUploaded}
          />
        ) : (
          <Upload onUploadClick={handleButtonClick} />
        )}
      </div>
    </div>
  );
}

export default App;
