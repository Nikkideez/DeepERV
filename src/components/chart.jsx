import { useEffect, useState } from 'react';
import { ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Scatter } from 'recharts';
import { linearRegression, linearRegressionLine } from 'simple-statistics';
import "./Chart.css"

const COLORS = ['#fc0b03', '#fc5203', '#f553ef', '#e2adf7', '#2043f5', '#20a7f5'];

const renderCustomizedShape = (props) => {
  // console.log(props)
  const { cx, cy } = props;
  const index = props.payload.pred;
  // console.log(cx, cy, index)
  return <circle cx={cx} cy={cy} r={5} fill={COLORS[index % COLORS.length]} />;
}

function lastXPredsAreTheSame(data, x) {
  if (!Array.isArray(data) || data.length < x) {
    return false;
  }

  // Get the last x elements
  const lastX = data.slice(-x);

  // Get the pred value of the first object in lastX
  const firstPred = lastX[0].pred;

  // Check if all pred values are the same
  return lastX.every(obj => obj.pred === firstPred);
}


export default function MyChart(props) {
  const [data, setData] = useState([]);
  // const [thresholdValue, setThresholdValue] = useState(1);
  // const [inputValue, setInputValue] = useState();
  const [selectedValue, setSelectedNumber] = useState(1);
  const [direction, setDirection] = useState("");
  const [lineData, setLineData] = useState([])

  // Calculate director from gradient and last point
  const getDirection = (gradient, range, firstPoint, lastPoint) => {
    let check;
    if (gradient >= (-1 * range) && gradient <= range)
      check = true;
    else
      check = false;

    // if(firstPoint.x > lastPoint.x)
    if (check) {
      if (firstPoint.x > lastPoint.x)
        return "left"
      else
        return "right"
    } else {
      if (firstPoint.y > lastPoint.y)
        return "down" // Change this to look at left and right bottom corners
      else
        return "up" // Change this to check if prevous ones are around the same x and y
    }
  }

  useEffect(() => {
    // console.log("chart useEffect getting called")
    if (props.centre) {
      setData(prevData => {
        return [...prevData, props.centre];
      })
    }
    // console.log(data)
    if (data.length >= selectedValue && lastXPredsAreTheSame(data, selectedValue)) {
      // console.log(data[data.length - 2].pred, " equals ", data[data.length - 1].pred)

      props.setPredData(data[data.length - 1].pred)
      // console.log("setPredData called!!!!")
    }
  }, [props.centre]);

  // // Calculate the line of best fit only when data changes
  // let lineOfBestFit;
  // if (data.length >= 2) {
  //   // Map your data to an array of arrays, where the inner arrays are pairs of numbers
  //   const dataPairs = data.map(point => [point.x, point.y]);

  //   // Calculate the line of best fit
  //   const { m, b } = linearRegression(dataPairs);

  //   console.log("Gradient is: ", m);

  //   // Create a function for the line of best fit
  //   lineOfBestFit = linearRegressionLine({ m, b });

  //   const firstPoint = lineOfBestFit(data[0]["x"]);
  //   const lastPoint = lineOfBestFit(data[data.length-1]["x"])

  //   // Set direction of ERV
  //   setDirection(getDirection(m, 1, 
  //     {x: data[0]["x"], y: firstPoint},
  //     {x: data[data.length-1]["x"], y: lastPoint},
  //     ))
  // }

  useEffect(() => {
    if (data.length >= 2) {
      // Map your data to an array of arrays, where the inner arrays are pairs of numbers
      const dataPairs = data.map(point => [point.x, point.y]);

      // Calculate the line of best fit
      const { m, b } = linearRegression(dataPairs);

      console.log("Gradient is: ", m);

      // Create a function for the line of best fit
      const lineOfBestFit = linearRegressionLine({ m, b });

      const firstPoint = lineOfBestFit(data[0]["x"]);
      const lastPoint = lineOfBestFit(data[data.length - 1]["x"])

      // Set direction of ERV
      const newDirection = getDirection(m, 0.1,
        { x: data[0]["x"], y: firstPoint },
        { x: data[data.length - 1]["x"], y: lastPoint },
      );

      if (newDirection !== direction) {
        setDirection(newDirection);
      }
      const newLineData = data.map(point => ({
        x: point.x,
        y: lineOfBestFit ? lineOfBestFit(point.x) : null,
      }));

      setLineData(newLineData);
    }
  }, [data]);


  // let lineData = [];

  function clearChart() {
    console.log("clearChart called!!!!")
    setData([]);
    setLineData([]);
    props.setPredData(undefined)

  }

  // let inputValue;
  // const handleInput = (event) => {
  //   inputValue = event.target.value;
  //   console.log(inputValue)
  // }

  const handleSelect = (event) => {
    setSelectedNumber(event.target.value);
  }

  return (
    <div className="chartContainer">
      <div className="textContainer">
        <p>
          Direction is: <span className='directionText'>{direction}</span>
        </p>
        <p>
          Threshold Value: {selectedValue}
        </p>
      </div>
      <div>
        <ComposedChart width={500} height={window.innerHeight * 0.3}>
          <CartesianGrid />
          <XAxis dataKey="x" type="number" name='stature' domain={[0, 1]} />
          <YAxis dataKey="y" type="number" name='weight' domain={[0, 1]} />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} />
          <Scatter name='A school' data={data} fill='#8884d8' shape={renderCustomizedShape} />
          <Line type="monotone" dataKey="y" data={lineData} stroke="#00C49F" index={1} dot={false} />
        </ComposedChart>
      </div>
      <div className="buttonsContainer">
        <button onClick={clearChart}>
          Clear Chart
        </button>
        {/* <button onClick={() => setThresholdValue(inputValue)}>
          Set Threshold
          </button>
        <input type="text" value={inputValue} onChange={handleInput} /> */}
        <p className="thresholdP">
          {"Set Threshold: "}
        </p>
        <select value={selectedValue} onChange={handleSelect}>
          {/* <option value="">Select a number</option> */}
          {[1, 2, 3, 4, 5].map((number) => (
            <option key={number} value={number}>
              {number}
            </option>
          ))}
        </select>
      </div>
      {/* } */}
    </div>
  );
}