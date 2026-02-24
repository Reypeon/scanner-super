// import { useEffect, useRef, useState } from "react";
// import { Cart } from "./src/cart.js";
// import PriceScanner from "./src/scanner.jsx";
// import styles from "./app.module.css";

// const App = () => {
//   const cartRef = useRef(null);

//   const [items, setItems] = useState([]);
//   const [total, setTotal] = useState(0);

//   useEffect(() => {
//     cartRef.current = new Cart((updatedItems, updatedTotal) => {
//       setItems([...updatedItems]);
//       setTotal(updatedTotal);
//     });
//   }, []);

//   const handleDetected = (price) => {
//     cartRef.current?.addPrice(price);
//   };

//   const handleImageUpload = (id, file) => {
//     const reader = new FileReader();
//     reader.onload = () => {
//       cartRef.current.setImage(id, reader.result);
//     };
//     reader.readAsDataURL(file);
//   };

//   return (
//     <div className={styles.app}>
//       <h1>Scanner de Supermercado</h1>
//       <PriceScanner onDetected={handleDetected} />
//       <div className={styles.cart}>
//         <h2>Total: ${total.toFixed(2)}</h2>

//         {items
//           .slice()
//           .reverse()
//           .map((item) => (
//             <div key={item.id} className={styles.item}>
//               <div className={styles.productImg}>
//                 <label>
//                   {item.image ? (
//                     <img src={item.image} alt="producto" />
//                   ) : (
//                     <div className={styles.placeholder}>
//                       📷
//                     </div>
//                   )}
//                   <input
//                     type="file"
//                     accept="image/*"
//                     hidden
//                     onChange={(e) =>
//                       handleImageUpload(item.id, e.target.files[0])
//                     }
//                   />
//                 </label>
//               </div>

//               <div className={styles.itemInfo}>
//                 <span>${item.price.toFixed(2)}</span>

//                 <div className={styles.qtyControls}>
//                   <button onClick={() => cartRef.current.updateQty(item.id, -1)}>
//                     -
//                   </button>
//                   <span>{item.qty}</span>
//                   <button onClick={() => cartRef.current.updateQty(item.id, 1)}>
//                     +
//                   </button>
//                 </div>
//               </div>
//             </div>
//           ))}
//       </div>
//     </div>
//   );
// };

// export default App;

import { useState } from "react";
import Scanner from "./src/scanner.jsx";

function App() {
  const [price, setPrice] = useState(null);

  const handleDetected = (value) => {
    console.log("Precio detectado:", value);
    setPrice(value);
  };

  return (
    <div style={{ padding: "20px" }}>
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