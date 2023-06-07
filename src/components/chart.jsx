import { useEffect, useState } from 'react';
import { ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Scatter } from 'recharts';
import { linearRegression, linearRegressionLine } from 'simple-statistics';
import "./Chart.css"

const COLORS = ['#fc0b03', '#fc7d3d', '#f553ef', '#e2adf7', '#2043f5', '#20a7f5'];

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
  const [direction, setDirection] = useState("");
  const [lineData, setLineData] = useState([])
  const [keySwitch, setKeySwitch] = useState(1);
  const [gradient, setGradient] = useState();
  const keyMap = [["x", "y"], ["w", "h"]];
  const labelMap = [["centre (x)", "centre (y)"], ["width", "height"]];

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
    if (data.length >= props.threshold && lastXPredsAreTheSame(data, props.threshold)) {
      // console.log(data[data.length - 2].pred, " equals ", data[data.length - 1].pred)
      // console.log(data[data.length - 1].pred)
      props.setPredData(data[data.length - 1].pred)
      // console.log("setPredData called!!!!")
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

      // console.log("Gradient is: ", m);


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
      setGradient(m.toFixed(2));

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
    }, 550);

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

  // const handleSelect = (event) => {
  //   setSelectedNumber(event.target.value);
  // }

  return (
    <div className="chartContainer">
      <div className="textContainer">
        <p>
          Gradient: <span style={{color: 'purple'}}>{gradient}</span>
        </p>
        <p>
          Direction: <span className='directionText'>{direction}</span>
        </p>
        {/* <p>
          Threshold Value: {props.threshold}
        </p> */}
      </div>
      <div>
        <ComposedChart width={500} height={window.innerHeight * 0.3}>
          <CartesianGrid />
          <XAxis dataKey={keyMap[keySwitch][0]} type="number" name='xaxis' domain={[0, 1]} 
            label={{value: labelMap[keySwitch][0], dy: 12}}
          />
          <YAxis dataKey={keyMap[keySwitch][1]} type="number" name='yaxis' domain={[0, 1]}
            label={{value: labelMap[keySwitch][1], angle: -90, dx: -12}}
          />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} />
          <Scatter name='Line of BF' data={data} fill='#8884d8' shape={renderCustomizedShape} />
          <Line type="monotone" dataKey={keyMap[keySwitch][1]} data={lineData} stroke="#00C49F" index={1} dot={false} />
        </ComposedChart>
      </div>
      <div className="buttonsContainer">
        <button onClick={clearChart} style={{marginLeft: 70}}>
          Clear Chart
        </button>
        <button onClick={() => setKeySwitch(keySwitch === 0 ? 1 : 0)}>
          Toggle Chart
        </button>
      </div>
    </div>
  );
}
        // <select value={selectedValue} onChange={handleSelect}>
        //   {/* <option value="">Select a number</option> */}
        //   {[1, 2, 3, 4, 5].map((number) => (
        //     <option key={number} value={number}>
        //       {number}
        //     </option>
        //   ))}
        // </select>