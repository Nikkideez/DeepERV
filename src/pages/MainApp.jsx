import React, { useState, useEffect, useRef } from "react";
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-backend-webgl"; // set backend to webgl
import Loader from "../components/loader";
import ButtonHandler from "../components/btn-handler";
import { detectImage, detectVideo } from "../utils/detect";
import "../style/App.css";
import Map from "../components/map-home";
import MyChart from '../components/chart';

const MainApp = () => {
  const [loading, setLoading] = useState({ loading: true, progress: 0 }); // loading state
  const [data, setData] = useState(); // Holds detection data
  const [centre, setCentre] = useState(); // Holds data using centre points
  const [isLocation, setIsLocation] = useState(false);
  const [threshold, setThreshold] = useState(1);
  const [classThreshold, setClassThreshold] = useState(0.75);
  const [model, setModel] = useState({
    net: null,
    inputShape: [1, 0, 0, 3],
  }); // init model & input shape

  // references
  const imageRef = useRef(null);
  const cameraRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const inputRef = useRef();

  // model configs
  const modelName = "yolov5s";
  // const classThreshold = 0.75;

  useEffect(() => {
    tf.ready().then(async () => {
      const yolov5 = await tf.loadGraphModel(
        `${'http://localhost:5173'}/${modelName}_web_model/model.json`,
        {
          onProgress: (fractions) => {
            setLoading({ loading: true, progress: fractions }); // set loading fractions
          },
        }
      ); // load model

      // warming up model
      const dummyInput = tf.ones(yolov5.inputs[0].shape);
      const warmupResult = await yolov5.executeAsync(dummyInput);
      tf.dispose(warmupResult); // cleanup memory
      tf.dispose(dummyInput); // cleanup memory

      setLoading({ loading: false, progress: 1 });
      setModel({
        net: yolov5,
        inputShape: yolov5.inputs[0].shape,
      }); // set model & input shape
    });
  }, []);

  // console.log(centre)

  const handleSelect = (event) => {
    setThreshold(event.target.value);
  }

  return (
    <div className="App">

      {loading.loading && <Loader>Loading model... {(loading.progress * 100).toFixed(2)}%</Loader>}
      <div className="header">
        {/* <h1>📷 DeepERV</h1> */}
        <p>
          YOLOv5 live ERV detection application on browser
        </p>
      </div>
      <div style={{marginTop: 30}}>
        <p className="thresholdP">
          {"Set Threshold: "}
        </p>
        <select value={threshold} onChange={handleSelect}>
          {/* <option value="">Select a number</option> */}
          {[1, 2, 3, 4, 5].map((number) => (
            <option key={number} value={number}>
              {number}
            </option>
          ))}
        </select>
      </div>
      <div>
        <p className="thresholdP">
          {"Set Conf: "}
        </p>
        <input
          ref={inputRef}
          placeholder={classThreshold}
          style={{ width: 50 }}
        />
        <button className="button-inverted" onClick={() => setClassThreshold(inputRef.current.value)}>
          Enter
        </button>
      </div>
      <div className="outputContainer">
        <Map data={data} setIsLocation={setIsLocation} />
        <MyChart centre={centre} setPredData={setData} threshold={threshold} />
        {/* <MyChart centre={centre} setPredData={setData} /> */}
      </div>
      <p>
        Serving : <code className="code">{modelName}</code>
      </p>
      <div>
        <p className="thresholdP" style={{marginLeft: 10, marginRight: 10}}>
          Conf : <code style={{color: "red"}}>{classThreshold}</code>
        </p>
        <p className="thresholdP" style={{marginLeft: 10, marginRight: 10}}>
          Threshold : <code style={{color: "red"}}>{threshold}</code>
        </p>
      </div>

      <div className="content">
        <img
          src="#"
          ref={imageRef}
          onLoad={() => detectImage(imageRef.current, model, classThreshold, canvasRef.current, setCentre)}
        />
        <video
          autoPlay
          muted
          ref={cameraRef}
          onPlay={() => detectVideo(cameraRef.current, model, classThreshold, canvasRef.current, setCentre)}
        />
        <video
          autoPlay
          muted
          ref={videoRef}
          onPlay={() => detectVideo(videoRef.current, model, classThreshold, canvasRef.current, setCentre)}
        />
        <canvas width={model.inputShape[1]} height={model.inputShape[2]} ref={canvasRef} />
      </div>

      {!isLocation ?
        <p style={{ color: 'red' }}>
          Set a location to enable inference buttons
        </p>
        :
        <p style={{ color: 'magenta' }}>
          Select input source
        </p>
      }
      <ButtonHandler imageRef={imageRef} cameraRef={cameraRef} videoRef={videoRef} isDisabled={!isLocation} />
    </div>
  );
};

export default MainApp;