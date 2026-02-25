import { useState } from "react";
import Scanner from "./src/scanner.jsx";

function App() {
  const [price, setPrice] = useState(null);

  const handleDetected = (value) => {
    console.log("Precio detectado:", value);
    setPrice(value);
  };

  return (
    <div style={{ padding: "20px", backgroundColor: "#333",  }}>
      <h1>Scanner</h1>

      <Scanner onDetected={handleDetected} />

      {price && (
        <h2>
          Precio detectado: ${price}
        </h2>
      )}
    </div>
  );
}

export default App;