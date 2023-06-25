import { useEffect, useState } from 'react';
import { ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Scatter } from 'recharts';
import { linearRegression, linearRegressionLine } from 'simple-statistics';
import "./Chart.css"

const COLORS = ['#fc0b03', '#fc7d3d', '#f553ef', '#e2adf7', '#2043f5', '#20a7f5'];





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
  // mix and max x values for arrow head
  const [minIndex, setMinIndex] = useState(0);
  const [maxIndex, setMaxIndex] = useState(0);
  // Maps to help switch keys and labels
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
      const newDirection = getDirection(m, 0.27,
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
      // console.log(newLineData)
      // console.log(newLineData[[newLineData.length - 1]][keyMap[keySwitch][0]])

      // Check if there is a new min or new max for x
      if (newLineData[[newLineData.length - 1]][keyMap[keySwitch][0]] < newLineData[minIndex][keyMap[keySwitch][0]]) {
        console.log("Min: ", newLineData[[newLineData.length - 1]][keyMap[keySwitch][0]], newLineData[minIndex][keyMap[keySwitch][0]]);
        setMinIndex(newLineData.length - 1)
      }
      else if (newLineData[[newLineData.length - 1]][keyMap[keySwitch][0]] > newLineData[maxIndex][keyMap[keySwitch][0]]) {
        console.log("Max: ", newLineData[[newLineData.length - 1]][keyMap[keySwitch][0]], newLineData[maxIndex][keyMap[keySwitch][0]]);
        setMaxIndex(newLineData.length - 1)
      }

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
    setMaxIndex(0);
    setMinIndex(0);
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

  // Returns min or max index
  const getMinMaxDirection = (direction) => {
    if (direction === "right" || direction === "down")
      return maxIndex
    else
      return minIndex
  }

  // Custom triangle marker that rotates based on gradient
  const CustomTriangle = (props) => {

    if (!gradient || lineData.length === 0)
      return <polygon />

    const { cx, cy } = props;
    // // Fetching the last two points of the line
    // const pointA = lineData[lineData.length - 1];
    // const pointB = lineData[0];

    // console.log(pointA, pointB)

    // // Calculating the angle (in degrees) using the inverse tangent (atan2)
    // let angle = Math.atan2(pointB[keyMap[keySwitch][1]] - pointA[keyMap[keySwitch][1]], pointB[keyMap[keySwitch][0]] - pointA[keyMap[keySwitch][0]]) * 180 / Math.PI;
    // if (pointB[keyMap[keySwitch][0]] < pointA[keyMap[keySwitch][0]]) {
    //   angle += 180;
    // }

    let angle;
    if (direction === "up")
      angle = 0;
    else if (direction === "right")
      angle = 90;
    else if (direction === "down")
      angle = 180;
    else
      angle = 270;

    const rotateTransform = `rotate(${angle}, ${cx}, ${cy})`;
    // console.log(gradient)
    // points = cx ? `${cx},${cy - 6} ${cx - 6},${cy + 6} ${cx + 6},${cy + 6}` : null, null, null, null
    return (
      cx ?
        <polygon
          points={`${cx},${cy - 6} ${cx - 6},${cy + 6} ${cx + 6},${cy + 6}`}
          transform={rotateTransform}
          fill="#00C49F" />
        :
        <polygon />
    );
  }

  const renderCustomizedShape = (props) => {
    // console.log(props)
    const { cx, cy, key } = props;
    const index = props.payload.pred;
    const size = 5;  // You can adjust the size of the 'X'
    let last = `symbol-${lineData.length - 1}`
    // console.log(lineData)
    // console.log(keyMap[keySwitch])
    if (lineData.length > 2 && key === "symbol-0") {
      return (
        <circle
          cx={cx}
          cy={cy}
          r={5}
          fill={"white"}
          stroke={COLORS[index % COLORS.length]}
          strokeWidth={2} // You can adjust this value to change the border thickness
        />
      );
    } else if (lineData.length > 2 && key === `symbol-${lineData.length - 1}`) {
      return (
        <g>
          <line 
            x1={cx - size} 
            y1={cy - size} 
            x2={cx + size} 
            y2={cy + size} 
            stroke={COLORS[index % COLORS.length]} 
            strokeWidth={2} 
          />
          <line 
            x1={cx - size} 
            y1={cy + size} 
            x2={cx + size} 
            y2={cy - size} 
            stroke={COLORS[index % COLORS.length]} 
            strokeWidth={2} 
          />
        </g>
      );
    }

    // console.log(cx, cy, index)
    return <circle cx={cx} cy={cy} r={5} fill={COLORS[index % COLORS.length]} />;
  }

  return (
    <div className="chartContainer">
      <div className="textContainer">
        <p>
          Gradient: <span style={{ color: 'purple' }}>{gradient}</span>
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
            label={{ value: labelMap[keySwitch][0], dy: 12 }}
          />
          <YAxis dataKey={keyMap[keySwitch][1]} type="number" name='yaxis' domain={[0, 1]}
            label={{ value: labelMap[keySwitch][1], angle: -90, dx: -12 }}
          />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} />
          <Scatter name='Line of BF' data={data} fill='#8884d8' shape={renderCustomizedShape} />
          <Line type="monotone" dataKey={keyMap[keySwitch][1]} data={lineData} stroke="#00C49F" index={1} dot={false} />
          <Scatter name='Line arrow' data={[lineData[getMinMaxDirection(direction)]]} fill='#00C49F' shape={CustomTriangle} />
        </ComposedChart>
      </div>
      <div className="buttonsContainer">
        <button onClick={clearChart} style={{ marginLeft: 70 }}>
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