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
  const [keySwitch, setKeySwitch] = useState(1);
  const keyMap = [["x", "y"], ["w", "h"]];

  // Calculate director from gradient and last point
  const getDirection = (gradient, range, firstPoint, lastPoint, keySwitch) => {
    if (!gradient)
      return "??"

    let check;
    if (gradient && gradient >= (-1 * range) && gradient <= range)
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
      if (!keySwitch && firstPoint.y > lastPoint.y)
        return "down" 
      else if (!keySwitch)
        return "up"
      else if (keySwitch && firstPoint.y > lastPoint.y)
        return "up"
      else
        return "down"
    }
  }

  useEffect(() => {
    // console.log("chart useEffect getting called")
    // When new data comes, push to array
    if (props.centre) {
      setData(prevData => {
        return [...prevData, props.centre];
      })
    }

    // If there are multiple of the same guess, pin to map
    if (data.length >= selectedValue && lastXPredsAreTheSame(data, selectedValue)) {
      // console.log(data[data.length - 2].pred, " equals ", data[data.length - 1].pred)
      console.log(data[data.length - 1].pred)
      props.setPredData(data[data.length - 1].pred)
      console.log("setPredData called!!!!")
    }
  }, [props.centre]);

  // Calculate the line of best fit only when data changes
  // Use this to determine direction
  function calculateLine() {
    if (data.length >= 2) {
      // Map your data to an array of arrays, where the inner arrays are pairs of numbers
      const dataPairs = data.map(point => [point[keyMap[keySwitch][0]], point[keyMap[keySwitch][1]]]);

      // Calculate the line of best fit
      const { m, b } = linearRegression(dataPairs);

      console.log("Gradient is: ", m);

      // Create a function for the line of best fit
      const lineOfBestFit = linearRegressionLine({ m, b });

      const firstPoint = lineOfBestFit(data[0][keyMap[keySwitch][0]]);
      const lastPoint = lineOfBestFit(data[data.length - 1][keyMap[keySwitch][0]])

      // Set direction of ERV
      const newDirection = getDirection(m, 0.1,
        { x: data[0][keyMap[keySwitch][0]], y: firstPoint },
        { x: data[data.length - 1][keyMap[keySwitch][0]], y: lastPoint },
        keySwitch
      );

      if (newDirection !== direction) {
        setDirection(newDirection);
      }
      const newLineData = data.map(point => (
        keySwitch === 0
          ? {
            x: point.x,
            y: lineOfBestFit ? lineOfBestFit(point.x) : null,
          }
          : {
            w: point.w,
            h: lineOfBestFit ? lineOfBestFit(point.w) : null,
          }
      ));

      setLineData(newLineData);
    }
  }


  useEffect(() => {
    calculateLine();
  }, [data]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      calculateLine();
    }, 1000);

    // Cleanup function
    return () => clearTimeout(timeoutId);
  }, [keySwitch]);



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
          <XAxis dataKey={keyMap[keySwitch][0]} type="number" name='stature' domain={[0, 1]} />
          <YAxis dataKey={keyMap[keySwitch][1]} type="number" name='weight' domain={[0, 1]} />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} />
          <Scatter name='A school' data={data} fill='#8884d8' shape={renderCustomizedShape} />
          <Line type="monotone" dataKey={keyMap[keySwitch][1]} data={lineData} stroke="#00C49F" index={1} dot={false} />
        </ComposedChart>
      </div>
      <div className="buttonsContainer">
        <button onClick={clearChart}>
          Clear Chart
        </button>
        <button onClick={() => setKeySwitch(keySwitch === 0 ? 1 : 0)}>
          Toggle Chart
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