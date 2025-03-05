import JSZip, { file } from "jszip";
import { useZip } from "../functions/ZipContext";
import ColorBlock from "./ColorBlock";
import Loading from "./Loading";
import weirdRGB from "../functions/weirdRGB";
import downloadZip from "../functions/downloadZip";
import { useRef, useState } from "react";

function Dashboard({ image, mapDetails, setIsUploaded }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const { globalZip } = useZip();
  const fileInputRef = useRef(null);
  const [newImage, setNewImage] = useState(image);
  const [imageFile, setImageFile] = useState(null);
  const [procentage, setProcentage] = useState(0);

  // Loading config
  let config = JSON.parse(localStorage.getItem("mapConfig"));

  function randomNumber(x, y) {
    return Math.floor(Math.random() * (y - x + 1)) + x;
  }

  async function generateMap() {
    setIsGenerating(true);

    const zip = new JSZip();
    let mapOrSongNameSameShit;
    let filesAsArray = Object.keys(globalZip.files);

    let index = 0;
    for (const filename of filesAsArray) {
      index++;
      setProcentage(index / filesAsArray.length);
      if (filename.endsWith(".dat")) {
        const fileData = await globalZip.files[filename].async("text");
        let dataJSON = JSON.parse(fileData);
        if (filename === "Info.dat") {
          console.log("Detected Info.dat: ", filename, dataJSON);

          // Setting up the map details
          let authorName = document.querySelector(
            "input[name=mapCreator]"
          ).value;
          dataJSON._levelAuthorName = authorName;

          let mapName = document.querySelector("input[name=mapName]").value;
          mapOrSongNameSameShit = mapName;
          dataJSON._songName = mapName;

          let artist = document.querySelector("input[name=artist]").value;
          dataJSON._songAuthorName = artist;

          // Chaning block colors
          let allBlock = document.querySelectorAll(".color-block");
          let redBlock = allBlock[0];
          let blueBlock = allBlock[1];

          dataJSON._difficultyBeatmapSets[0]._difficultyBeatmaps.forEach(
            (difficulty) => {
              if (!difficulty._customData) difficulty._customData = {};
              let isNewRed = redBlock.getAttribute("style").includes("rgb");
              let isNewBlue = blueBlock.getAttribute("style").includes("rgb");
              let colors;

              if (isNewRed) {
                colors = weirdRGB(redBlock);
                difficulty._customData._colorLeft = colors;
                difficulty._customData._envColorLeft = colors;
              }

              if (isNewBlue) {
                colors = weirdRGB(blueBlock);
                difficulty._customData._colorRight = colors;
                difficulty._customData._envColorRight = colors;
              }

              // console.log(redBlock.getAttribute("style"), isNewRed);
              // console.log(blueBlock.getAttribute("style"), isNewBlue);
              // difficulty._customData._colorLeft = { r: 0.251, g: 1, b: 0.212 };
              console.log("Difficulty ", difficulty);
            }
          );

          // Deleting AI traces
          let deleteAi = document.querySelector(
            "input[type=checkbox][gen=ai]"
          ).checked;
          let aiEditor = dataJSON._customData._editors.beatsage ? true : false;
          let aiEdited =
            dataJSON._customData._editors._lastEditedBy === "beatsage"
              ? true
              : false;
          if ((aiEditor || aiEdited) && deleteAi) {
            console.log("Editor is AI or the last edit was made by AI");
            dataJSON._customData._editors = {};
            // console.log(dataJSON._customData._editors.beatsage); => Should return undefined
          }
        } else {
          console.log("Detected difficulty: ", filename);
          let notes = dataJSON._notes;
          let events = dataJSON._events;

          // Generating the lights
          notes.forEach((note) => {
            let time = note._time;
            let value = note._type === 0 ? 7 : 3;
            let type = randomNumber(1, 4); // randomNumber(0, 1) === 1 ? 3 : 2;

            events.push({
              _time: time,
              _type: type,
              _value: value,
              _floatValue: 1,
            });
          });

          dataJSON._events = events;

          //console.log(events);
        }
        zip.file(filename, JSON.stringify(dataJSON, null, 2));
      } else if (filename.includes("cover.")) {
        // Handling image
        let fileData;
        if (imageFile) {
          fileData = imageFile;
        } else {
          // Keep the image that was before
          fileData = await globalZip.files[filename].async("blob");
        }
        zip.file(filename, fileData);
      } else {
        zip.file(filename, await globalZip.files[filename].async("blob"));
      }
    }
    await downloadZip(zip, mapOrSongNameSameShit);
    return;
  }

  const handleClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const newImageUrl = URL.createObjectURL(file);
      setNewImage(newImageUrl);
      setImageFile(file);
      // const zip = new JSZip();
      // zip.file("cover.png", file);
    }
  };

  function saveConfig() {
    let lights = document.querySelector(
      "input[type=checkbox][gen=lights]"
    ).checked;
    let aiRemoval = document.querySelector(
      "input[type=checkbox][gen=ai]"
    ).checked;

    let redBlock = document.querySelectorAll(".color-block")[0];
    let blueBlock = document.querySelectorAll(".color-block")[1];

    let isNewRed = redBlock.getAttribute("style").includes("rgb");
    let isNewBlue = blueBlock.getAttribute("style").includes("rgb");

    let colors = {};

    function normalRGB(element) {
      return element
        .getAttribute("style")
        .split("rgb(")[1]
        .replace(");", "")
        .split(", ");
    }

    if (isNewRed) {
      colors.red = normalRGB(redBlock);
    }
    if (isNewBlue) {
      colors.blue = normalRGB(blueBlock);
    }
    let config = {
      lights: lights,
      aiRemoval: aiRemoval,
      colors: colors,
    };
    localStorage.setItem("mapConfig", JSON.stringify(config));
  }

  if (localStorage.getItem("config")) {
  }
  return (
    <div>
      {isGenerating ? (
        <Loading procentage={procentage} setIsUploaded={setIsUploaded} />
      ) : (
        <div></div>
      )}
      <div className="map-info">
        <img
          src={newImage} // Use newImage state as the source
          alt="Cover"
          onClick={handleClick}
          className="cover box"
        />
        <input
          ref={fileInputRef}
          type="file"
          accept=".png, .jpg, .jpeg"
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
        <div className="song-details">
          <form>
            <div>
              <label>
                Map name
                <input
                  type="text"
                  name="mapName"
                  defaultValue={mapDetails.mapName}
                  spellCheck="false"
                />
              </label>
            </div>
            <div className="authors">
              <label>
                Artist
                <input
                  type="text"
                  name="artist"
                  defaultValue={mapDetails.artist}
                  spellCheck="false"
                />
              </label>

              <label>
                Map Creator
                <input
                  type="text"
                  name="mapCreator"
                  defaultValue={mapDetails.mapCreator}
                  spellCheck="false"
                />
              </label>
            </div>
          </form>
        </div>
      </div>
      <div className="lower-settings">
        <div className="colors box">
          <p className="text-large">Colors</p>
          <div className="blocks">
            <ColorBlock initialColor="red" colorConfig={config.colors} />
            <ColorBlock initialColor="blue" colorConfig={config.colors} />
          </div>
        </div>
        <div className="config box">
          <h1 className="text-large">Config</h1>
          <label>
            <input type="checkbox" gen="ai" defaultChecked={config.aiRemoval} />{" "}
            Remove AI traces
          </label>
          <label>
            <input
              type="checkbox"
              gen="lights"
              defaultChecked={config.lights}
            />{" "}
            Generate lights
          </label>
          <button
            onClick={saveConfig}
            className="text-normal box config-button"
          >
            Save
          </button>
        </div>
      </div>
      <div className="generate">
        <button onClick={generateMap} className="text-large gradient-button">
          Generate
        </button>
      </div>
    </div>
  );
}

export default Dashboard;
