// import React, { useState, useEffect, useCallback } from "react";
// import axios from "axios";

// function OrderHistory({ token }) {
//   const [orders, setOrders] = useState([]);
//   const [status, setStatus] = useState("");
//   const [startDate, setStartDate] = useState("");
//   const [endDate, setEndDate] = useState("");
//   const [error, setError] = useState("");
//   const [expandedRow, setExpandedRow] = useState(null);
//   const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
//   const [pin, setPin] = useState("");
//   const [pinError, setPinError] = useState("");
//   const [newPin, setNewPin] = useState("");
//   const [pinUpdateError, setPinUpdateError] = useState("");
//   const [pinUpdateSuccess, setPinUpdateSuccess] = useState("");
//   const [userRole, setUserRole] = useState("");

//   const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

//   // Fetch user role to determine if user is admin
//   const fetchUserRole = useCallback(async () => {
//     try {
//       const res = await axios.get(`${API_URL}/api/auth/me`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setUserRole(res.data.role);
//     } catch (err) {
//       console.error("Error fetching user role:", err);
//     }
//   }, [token, API_URL]);

//   const fetchOrders = useCallback(async () => {
//     try {
//       const params = {};
//       if (startDate) params.startDate = startDate;
//       if (endDate) params.endDate = endDate;
//       if (status) params.status = status;
//       const res = await axios.get(`${API_URL}/api/orders/history`, {
//         params,
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setOrders(res.data);
//       setError("");
//     } catch (err) {
//       console.error("Error fetching orders:", err.response?.data || err.message);
//       setError(err.response?.data?.error || "Failed to load orders");
//     }
//   }, [startDate, endDate, status, token, API_URL]);

//   useEffect(() => {
//     fetchOrders();
//     fetchUserRole();
//   }, [fetchOrders, fetchUserRole]);

//   const handleFilter = (e) => {
//     e.preventDefault();
//     fetchOrders();
//   };

//   const handleClear = () => {
//     setStartDate("");
//     setEndDate("");
//     fetchOrders(); // Refetch with default (no date filters)
//   };

//   const toggleRow = (orderId) => {
//     setExpandedRow(expandedRow === orderId ? null : orderId);
//   };

//   const handleVerifyPin = async (orderId) => {
//     try {
//       await axios.post(
//         `${API_URL}/api/pin/verify`,
//         { pin },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       await handleDeleteOrder(orderId);
//     } catch (err) {
//       console.error("Error verifying PIN:", err.response?.data || err.message);
//       setPinError(err.response?.data?.error || "Invalid PIN");
//     }
//   };

//   const handleDeleteOrder = async (orderId) => {
//     try {
//       await axios.delete(`${API_URL}/api/orders/${orderId}`, {
//         headers: { Authorization: `Bearer ${token}` },
//         data: { pin }, // Send PIN with delete request
//       });
//       setOrders(orders.filter((order) => order.id !== orderId));
//       setShowDeleteConfirm(null);
//       setExpandedRow(null);
//       setPin("");
//       setPinError("");
//     } catch (err) {
//       console.error("Error deleting order:", err.response?.data || err.message);
//       setError(err.response?.data?.error || "Failed to delete order");
//     }
//   };

//   const handleUpdatePin = async (e) => {
//     e.preventDefault();
//     try {
//       await axios.put(
//         `${API_URL}/api/pin/update`,
//         { newPin },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       setPinUpdateSuccess("PIN updated successfully");
//       setPinUpdateError("");
//       setNewPin("");
//     } catch (err) {
//       console.error("Error updating PIN:", err.response?.data || err.message);
//       setPinUpdateError(err.response?.data?.error || "Failed to update PIN");
//       setPinUpdateSuccess("");
//     }
//   };

//   const calculateTotalPrice = (foodItems) => {
//     if (!foodItems || !Array.isArray(foodItems)) return "0.00";
//     return foodItems
//       .reduce((total, item) => {
//         const price = parseFloat(item.price) || 0;
//         const quantity = item.OrderItem?.quantity || 0;
//         return total + price * quantity;
//       }, 0)
//       .toFixed(2);
//   };

//   const toggleMenu = () => {
//     setIsMenuOpen(!isMenuOpen);
//   };

//   return (
//     <div className="flex flex-col min-h-screen bg-[#FFFCF1] md:flex-row">
//       {/* Hamburger Menu Icon for Mobile */}
//       <div className="md:hidden flex items-center justify-between p-4 z-20">
//         <i
//           className="bi bi-list text-3xl cursor-pointer"
//           onClick={toggleMenu}
//         ></i>
//         <img
//           src="https://res.cloudinary.com/dnoitugnb/image/upload/v1747419279/Component_4_vdovyj.svg"
//           alt="backarrow"
//           className="cursor-pointer w-8 h-8"
//           onClick={() => window.history.back()}
//         />
//       </div>

//       {/* Overlay for Mobile */}
//       {isMenuOpen && (
//         <div
//           className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden"
//           onClick={toggleMenu}
//         ></div>
//       )}

//       {/* Sidebar - Slides in/out on mobile */}
//       <div
//         className={`fixed top-0 left-0 w-64 md:w-[145.5px] h-screen bg-[#FFFCF1] border-r-2 border-black z-20 transform transition-transform duration-300 ease-in-out ${
//           isMenuOpen ? "translate-x-0" : "-translate-x-full"
//         } md:translate-x-0`}
//       >
//         <div className="flex justify-end p-4 md:hidden">
//           <i
//             className="bi bi-x text-3xl cursor-pointer"
//             onClick={toggleMenu}
//           ></i>
//         </div>
//         <img
//           src="https://res.cloudinary.com/dnoitugnb/image/upload/v1746340828/tmylogo.png"
//           alt="Logo"
//           className="w-full max-w-[200px] sm:max-w-[250px] md:max-w-[300px] mx-auto mt-8 sm:mt-12 md:mt-16 mb-8 sm:mb-12 md:mb-16"
//           onClick={() => (window.location.href = "/")}
//         />
//       </div>

//       {/* Main Content */}
//       <div className="flex-1 flex flex-col items-center p-4 md:ml-[145.5px] md:p-6 lg:p-8">
//         <img
//           src="https://res.cloudinary.com/dnoitugnb/image/upload/v1747419279/Component_4_vdovyj.svg"
//           alt="backarrow"
//           className="cursor-pointer hidden md:block absolute top-10 right-10 w-8 h-8 md:w-24 md:h-24"
//           onClick={() => window.history.back()}
//         />
//         <div className="flex justify-center items-center w-full mb-4 sm:mb-6 mt-8 sm:mt-12 md:mt-16">
//           <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-center uppercase underline mb-2">
//             Order History
//           </h3>
//         </div>
//         {error && <p className="text-red-500 text-center mb-2.5">{error}</p>}
//         {userRole === "admin" && (
//           <div className="w-full max-w-5xl mb-5">
//             <h4 className="text-xl font-semibold mb-2">Update Admin PIN</h4>
//             <form onSubmit={handleUpdatePin} className="flex flex-wrap gap-3">
//               <input
//                 type="password"
//                 value={newPin}
//                 onChange={(e) => setNewPin(e.target.value)}
//                 placeholder="Enter new PIN"
//                 className="h-10 rounded-[20px] border border-black/30 bg-gray-200/50 p-2 text-lg"
//               />
//               <button
//                 type="submit"
//                 className="w-[120px] h-10 rounded-[20px] border border-gray-500 bg-gray-200/50 text-black font-semibold text-lg hover:bg-gray-300 active:bg-gray-300 active:text-white active:border-none"
//               >
//                 Update PIN
//               </button>
//             </form>
//             {pinUpdateError && (
//               <p className="text-red-500 text-center mt-2">{pinUpdateError}</p>
//             )}
//             {pinUpdateSuccess && (
//               <p className="text-green-500 text-center mt-2">{pinUpdateSuccess}</p>
//             )}
//           </div>
//         )}
//         <div className="flex flex-row items-center w-full gap-4 mb-5 justify-end mr-96">
//           <select
//             value={status}
//             onChange={(e) => {
//               setStatus(e.target.value);
//               fetchOrders();
//             }}
//             className="h-10 rounded-[20px] border border-black/30 bg-gray-200/50 p-2 text-lg"
//           >
//             <option value="">All Statuses</option>
//             <option value="In Process">In Process</option>
//             <option value="Completed">Completed</option>
//           </select>
//           <form onSubmit={handleFilter} className="flex flex-wrap gap-3">
//             <input
//               type="date"
//               value={startDate}
//               onChange={(e) => setStartDate(e.target.value)}
//               className="h-10 rounded-[20px] border border-black/30 bg-gray-200/50 p-2 text-lg"
//             />
//             <input
//               type="date"
//               value={endDate}
//               onChange={(e) => setEndDate(e.target.value)}
//               className="h-10 rounded-[20px] border border-black/30 bg-gray-200/50 p-2 text-lg"
//             />
//             <button
//               type="submit"
//               className="w-full sm:w-32 h-10 rounded-[20px] border border-gray-500 bg-gray-200/50 text-black font-semibold text-sm sm:text-base hover:bg-gray-300 active:bg-gray-300 active:text-white active:border-none mt-[26px]"
//             >
//               Filter
//             </button>
//             <button
//               type="button"
//               onClick={handleClear}
//               className="w-full sm:w-32 h-10 rounded-[20px] border border-gray-500 bg-gray-200/50 text-black font-semibold text-sm sm:text-base hover:bg-gray-300 active:bg-gray-300 active:text-white active:border-none mt-[26px]"
//             >
//               Clear
//             </button>
//           </form>
//         </div>
//         <div className="overflow-x-auto w-full max-w-4xl sm:max-w-5xl">
//           <table className="w-full border-collapse text-sm sm:text-base">
//             <thead>
//               <tr className="bg-gray-200/50">
//                 <th className="border border-black/30 p-2 sm:p-3 text-center">
//                   ID
//                 </th>
//                 <th className="border border-black/30 p-2 sm:p-3 text-center">
//                   Type
//                 </th>
//                 <th className="border border-black/30 p-2 sm:p-3 text-center">
//                   Table/Building
//                 </th>
//                 <th className="border border-black/30 p-2 sm:p-3 text-center">
//                   Date
//                 </th>
//                 <th className="border border-black/30 p-2 sm:p-3 text-center">
//                   Status
//                 </th>
//               </tr>
//             </thead>
//             <tbody>
//               {orders.map((order) => (
//                 <React.Fragment key={order.id}>
//                   <tr
//                     className="bg-[#F5E8C7] hover:bg-[#F0E0B7] cursor-pointer"
//                     onClick={() => toggleRow(order.id)}
//                   >
//                     <td className="border border-black/30 p-2 sm:p-3 text-center">
//                       {order.id}
//                     </td>
//                     <td className="border border-black/30 p-2 sm:p-3 text-center">
//                       {order.orderType}
//                     </td>
//                     <td className="border border-black/30 p-2 sm:p-3 text-center">
//                       {order.tableNumber || order.buildingName || "N/A"}
//                     </td>
//                     <td className="border border-black/30 p-2 sm:p-3 text-center">
//                       {new Date(order.createdAt).toLocaleString("en-US", {
//                         day: "numeric",
//                         month: "numeric",
//                         year: "numeric",
//                         hour: "2-digit",
//                         minute: "2-digit",
//                       })}
//                     </td>
//                     <td className="border border-black/30 p-2 sm:p-3 text-center">
//                       {order.status}
//                       <span className="ml-2 text-black">▼</span>
//                     </td>
//                   </tr>
//                   {expandedRow === order.id && (
//                     <tr>
//                       <td
//                         colSpan="5"
//                         className="border border-black/30 p-4 sm:p-6 bg-[#FFF9E5]"
//                       >
//                         <div className="flex flex-col space-y-2 text-sm sm:text-base">
//                           <div>
//                             <strong>Order ID:</strong> {order.id}
//                           </div>
//                           <div>
//                             <strong>Order Type:</strong> {order.orderType}
//                           </div>
//                           <div>
//                             <strong>Table Number:</strong>{" "}
//                             {order.tableNumber || order.buildingName || "N/A"}
//                           </div>
//                           <div>
//                             <strong>Payment Method:</strong>{" "}
//                             {order.paymentMethod || "N/A"}
//                           </div>
//                           <div>
//                             <strong>Payment Price:</strong> ฿
//                             {calculateTotalPrice(order.FoodItems)}
//                           </div>
//                           <div>
//                             <strong>Date & Time:</strong>{" "}
//                             {new Date(order.createdAt).toLocaleString("en-US", {
//                               day: "numeric",
//                               month: "numeric",
//                               year: "numeric",
//                               hour: "2-digit",
//                               minute: "2-digit",
//                             })}
//                           </div>
//                           <div>
//                             <strong>Ordered Items:</strong>
//                             <ul className="list-disc pl-5">
//                               {(order.FoodItems || []).map((item) => (
//                                 <li key={item.id}>
//                                   {item.name} - ฿
//                                   {(parseFloat(item.price) || 0).toFixed(2)} x{" "}
//                                   {item.OrderItem?.quantity || "N/A"}
//                                 </li>
//                               ))}
//                             </ul>
//                           </div>
//                           <button
//                             className="mt-2 px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm sm:text-base"
//                             onClick={(e) => {
//                               e.stopPropagation();
//                               setShowDeleteConfirm(order.id);
//                             }}
//                           >
//                             Delete
//                           </button>
//                           {showDeleteConfirm === order.id && (
//                             <div className="mt-2 p-2 bg-gray-100 rounded">
//                               <p>Enter PIN to delete this order:</p>
//                               <input
//                                 type="password"
//                                 value={pin}
//                                 onChange={(e) => setPin(e.target.value)}
//                                 placeholder="Enter PIN"
//                                 className="h-10 rounded-[20px] border border-black/30 bg-gray-200/50 p-2 text-lg mt-2"
//                               />
//                               {pinError && (
//                                 <p className="text-red-500 text-center mt-2">
//                                   {pinError}
//                                 </p>
//                               )}
//                               <div className="flex gap-2 mt-2">
//                                 <button
//                                   className="px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm sm:text-base"
//                                   onClick={(e) => {
//                                     e.stopPropagation();
//                                     handleVerifyPin(order.id);
//                                   }}
//                                 >
//                                   Confirm
//                                 </button>
//                                 <button
//                                   className="px-4 py-1 bg-gray-300 rounded hover:bg-gray-400 text-sm sm:text-base"
//                                   onClick={(e) => {
//                                     e.stopPropagation();
//                                     setShowDeleteConfirm(null);
//                                     setPin("");
//                                     setPinError("");
//                                   }}
//                                 >
//                                   Cancel
//                                 </button>
//                               </div>
//                             </div>
//                           )}
//                         </div>
//                       </td>
//                     </tr>
//                   )}
//                 </React.Fragment>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default OrderHistory;
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";

function OrderHistory({ token }) {
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState("");
  const [expandedRow, setExpandedRow] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [newPin, setNewPin] = useState("");
  const [pinUpdateError, setPinUpdateError] = useState("");
  const [pinUpdateSuccess, setPinUpdateSuccess] = useState("");
  const [userRole, setUserRole] = useState("");

  const API_URL = process.env.REACT_APP_API_URL;

  // Fetch user role to determine if user is admin
  const fetchUserRole = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserRole(res.data.role);
    } catch (err) {
      console.error("Error fetching user role:", err);
    }
  }, [token, API_URL]);

  const fetchOrders = useCallback(async () => {
    try {
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (status) params.status = status;
      const res = await axios.get(`${API_URL}/api/orders/history`, {
        params,
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data);
      setError("");
    } catch (err) {
      console.error(
        "Error fetching orders:",
        err.response?.data || err.message
      );
      setError(err.response?.data?.error || "Failed to load orders");
    }
  }, [startDate, endDate, status, token, API_URL]);

  useEffect(() => {
    fetchOrders();
    fetchUserRole();
  }, [fetchOrders, fetchUserRole]);

  const handleFilter = (e) => {
    e.preventDefault();
    fetchOrders();
  };

  const toggleRow = (orderId) => {
    setExpandedRow(expandedRow === orderId ? null : orderId);
  };

  const handleVerifyPin = async (orderId) => {
    try {
      await axios.post(
        `${API_URL}/api/pin/verify`,
        { pin },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await handleDeleteOrder(orderId);
    } catch (err) {
      console.error("Error verifying PIN:", err.response?.data || err.message);
      setPinError(err.response?.data?.error || "Invalid PIN");
    }
  };

  const handleDeleteOrder = async (orderId) => {
    try {
      await axios.delete(`${API_URL}/api/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { pin }, // Send PIN with delete request
      });
      setOrders(orders.filter((order) => order.id !== orderId));
      setShowDeleteConfirm(null);
      setExpandedRow(null);
      setPin("");
      setPinError("");
    } catch (err) {
      console.error("Error deleting order:", err.response?.data || err.message);
      setError(err.response?.data?.error || "Failed to delete order");
    }
  };

  const handleUpdatePin = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `${API_URL}/api/pin/update`,
        { newPin },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPinUpdateSuccess("PIN updated successfully");
      setPinUpdateError("");
      setNewPin("");
    } catch (err) {
      console.error("Error updating PIN:", err.response?.data || err.message);
      setPinUpdateError(err.response?.data?.error || "Failed to update PIN");
      setPinUpdateSuccess("");
    }
  };

  const calculateTotalPrice = (foodItems) => {
    if (!foodItems || !Array.isArray(foodItems)) return "0.00";
    return foodItems
      .reduce((total, item) => {
        const price = parseFloat(item.price) || 0;
        const quantity = item.OrderItem?.quantity || 0;
        return total + price * quantity;
      }, 0)
      .toFixed(2);
  };

  return (
    <div className="flex flex-row items-center">
      <div className="w-[145.5px] h-screen fixed top-0 bg-[#FFFCF1] border-r-2 border-black">
        <img
          src="https://res.cloudinary.com/dnoitugnb/image/upload/v1746340828/tmylogo.png"
          alt="Logo"
          className="w-full md:max-w-[300px] mt-16 mb-16"
          onClick={() => (window.location.href = "/")}
        />
      </div>
      <div className="bg-[#FFFCF1] border border-gray-500 w-full min-h-screen flex flex-col items-center">
        <img
          src="https://res.cloudinary.com/dnoitugnb/image/upload/v1747419279/Component_4_vdovyj.svg"
          alt="backarrow"
          className="cursor-pointer absolute top-10 right-10"
          onClick={() => window.history.back()}
        />
        <div className="flex justify-center items-center w-full mb-5 px-5">
          <h3 className="text-3xl font-bold text-center uppercase underline mb-16 mt-16">
            Check Order
          </h3>
        </div>
        {error && <p className="text-red-500 text-center mb-2.5">{error}</p>}
        {userRole === "admin" && (
          <div className="w-full max-w-5xl mb-5">
            <h4 className="text-xl font-semibold mb-2">Update Admin PIN</h4>
            <form onSubmit={handleUpdatePin} className="flex flex-wrap gap-3">
              <input
                type="password"
                value={newPin}
                onChange={(e) => setNewPin(e.target.value)}
                placeholder="Enter new PIN"
                className="h-10 rounded-[20px] border border-black/30 bg-gray-200/50 p-2 text-lg"
              />
              <button
                type="submit"
                className="w-[120px] h-10 rounded-[20px] border border-gray-500 bg-gray-200/50 text-black font-semibold text-lg hover:bg-gray-300 active:bg-gray-300 active:text-white active:border-none"
              >
                Update PIN
              </button>
            </form>
            {pinUpdateError && (
              <p className="text-red-500 text-center mt-2">{pinUpdateError}</p>
            )}
            {pinUpdateSuccess && (
              <p className="text-green-500 text-center mt-2">
                {pinUpdateSuccess}
              </p>
            )}
          </div>
        )}
        <div className="flex flex-row items-center w-full gap-4 mb-5 justify-end mr-96">
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              fetchOrders();
            }}
            className="h-10 rounded-[20px] border border-black/30 bg-gray-200/50 p-2 text-lg"
          >
            <option value="">All Statuses</option>
            <option value="In Process">In Process</option>
            <option value="Completed">Completed</option>
          </select>
          <form onSubmit={handleFilter} className="flex flex-wrap gap-3">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="h-10 rounded-[20px] border border-black/30 bg-gray-200/50 p-2 text-lg"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="h-10 rounded-[20px] border border-black/30 bg-gray-200/50 p-2 text-lg"
            />
            <button
              type="submit"
              className="w-[120px] h-10 rounded-[20px] border border-gray-500 bg-gray-200/50 text-black font-semibold text-lg hover:bg-gray-300 active:bg-gray-300 active:text-white active:border-none"
            >
              Filter
            </button>
          </form>
        </div>
        <div className="overflow-x-auto w-full max-w-5xl">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200/50">
                <th className="border border-black/30 p-2 text-center">ID</th>
                <th className="border border-black/30 p-2 text-center">Type</th>
                <th className="border border-black/30 p-2 text-center">
                  Table/Building
                </th>
                <th className="border border-black/30 p-2 text-center">Date</th>
                <th className="border border-black/30 p-2 text-center">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <React.Fragment key={order.id}>
                  <tr
                    className="bg-[#F5E8C7] hover:bg-[#F0E0B7] cursor-pointer"
                    onClick={() => toggleRow(order.id)}
                  >
                    <td className="border border-black/30 p-2 text-center">
                      {order.id}
                    </td>
                    <td className="border border-black/30 p-2 text-center">
                      {order.orderType}
                    </td>
                    <td className="border border-black/30 p-2 text-center">
                      {order.tableNumber || order.buildingName || "N/A"}
                    </td>
                    <td className="border border-black/30 p-2 text-center">
                      {new Date(order.createdAt).toLocaleString("en-US", {
                        day: "numeric",
                        month: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="border border-black/30 p-2 text-center">
                      {order.status}
                      <span className="ml-2 text-black">▼</span>
                    </td>
                  </tr>
                  {expandedRow === order.id && (
                    <tr>
                      <td
                        colSpan="5"
                        className="border border-black/30 p-4 bg-[#FFF9E5]"
                      >
                        <div className="flex flex-col space-y-2">
                          <div>
                            <strong>Order ID:</strong> {order.id}
                          </div>
                          <div>
                            <strong>Order Type:</strong> {order.orderType}
                          </div>
                          <div>
                            <strong>Table Number:</strong>{" "}
                            {order.tableNumber || order.buildingName || "N/A"}
                          </div>
                          <div>
                            <strong>Payment Method:</strong>{" "}
                            {order.paymentMethod || "N/A"}
                          </div>
                          <div>
                            <strong>Payment Price:</strong> ฿
                            {calculateTotalPrice(order.FoodItems)}
                          </div>
                          <div>
                            <strong>Date & Time:</strong>{" "}
                            {new Date(order.createdAt).toLocaleString("en-US", {
                              day: "numeric",
                              month: "numeric",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                          <div>
                            <strong>Ordered Items:</strong>
                            <ul className="list-disc pl-5">
                              {(order.FoodItems || []).map((item) => (
                                <li key={item.id}>
                                  {item.name} - ฿
                                  {(parseFloat(item.price) || 0).toFixed(2)} x{" "}
                                  {item.OrderItem?.quantity || "N/A"}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <button
                            className="mt-2 px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowDeleteConfirm(order.id);
                            }}
                          >
                            Delete
                          </button>
                          {showDeleteConfirm === order.id && (
                            <div className="mt-2 p-2 bg-gray-100 rounded">
                              <p>Enter PIN to delete this order:</p>
                              <input
                                type="password"
                                value={pin}
                                onChange={(e) => setPin(e.target.value)}
                                placeholder="Enter PIN"
                                className="h-10 rounded-[20px] border border-black/30 bg-gray-200/50 p-2 text-lg mt-2"
                              />
                              {pinError && (
                                <p className="text-red-500 text-center mt-2">
                                  {pinError}
                                </p>
                              )}
                              <div className="flex gap-2 mt-2">
                                <button
                                  className="px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleVerifyPin(order.id);
                                  }}
                                >
                                  Confirm
                                </button>
                                <button
                                  className="px-4 py-1 bg-gray-300 rounded hover:bg-gray-400"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setShowDeleteConfirm(null);
                                    setPin("");
                                    setPinError("");
                                  }}
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default OrderHistory;
