import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { usePrinter } from "../contexts/PrinterContext";
import PWAInstallPrompt from "./PWAInstallPrompt";
import PrintServerAdapter from "../utils/PrintServerAdapter";

function Invoice({ token }) {
  const [order, setOrder] = useState(null);
  const [foodItems, setFoodItems] = useState({});
  const [paymentMethod, setPaymentMethod] = useState("");
  const [customerNote, setCustomerNote] = useState("");
  const [error, setError] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false); // State for toggling sidebar on mobile
  
  // Print Server for iPad → Laptop → USB Printer
  const [printServer] = useState(() => new PrintServerAdapter());
  const [printServerUrl, setPrintServerUrl] = useState(localStorage.getItem('printServerUrl') || '');
  const [printServerConnected, setPrintServerConnected] = useState(false);
  const [showServerSetup, setShowServerSetup] = useState(false);
  
  // Use global printer context instead of local state
  const { 
    isConnected: isPrinterConnected, 
    connectPrinter, 
    printReceipt, 
    checkConnection,
    connectionStatus 
  } = usePrinter();
  
  const { state } = useLocation();
  const navigate = useNavigate();
  const tableNumber = state?.tableNumber || "";
  const orderType = state?.orderType || "dine-in";
  const orderId = state?.orderId;

  // Format current date and time
  const currentDateTime = new Date().toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch food items to map prices
        const itemsRes = await axios.get(
          "https://tamarmyaybackend-last.onrender.com/api/items",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const itemsMap = itemsRes.data.reduce((acc, item) => {
          acc[item.id] = {
            ...item,
            price: parseFloat(item.price) || 0,
          };
          return acc;
        }, {});
        setFoodItems(itemsMap);

        // Fetch the single "In Process" order
        const ordersRes = await axios.get(
          `https://tamarmyaybackend-last.onrender.com/api/orders?status=In Process&tableNumber=${tableNumber}&orderType=${orderType}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        let fetchedOrder = ordersRes.data[0] || null; // Take the first order (should be only one)

        if (orderId) {
          fetchedOrder = ordersRes.data.find((o) => o.id === orderId) || null;
        }

        if (fetchedOrder) {
          // Ensure prices are set
          fetchedOrder = {
            ...fetchedOrder,
            FoodItems:
              fetchedOrder.FoodItems?.map((item) => ({
                ...item,
                OrderItem: {
                  ...item.OrderItem,
                  price:
                    parseFloat(item.OrderItem?.price) ||
                    parseFloat(foodItems[item.id]?.price) ||
                    0,
                },
              })) || [],
          };
          setOrder(fetchedOrder);
        } else {
          setOrder(null);
        }
        setError("");
      } catch (err) {
        console.error(
          "Error fetching data:",
          err.response?.data || err.message
        );
        setError(err.response?.data?.error || "Failed to load order");
      }
    };
    if (tableNumber || orderId) {
      fetchData();
    }
  }, [tableNumber, orderType, orderId, token, foodItems]); // Added foodItems to dependency array

  const handleCheckout = async () => {
    if (!paymentMethod) {
      setError("Please select a payment method");
      return;
    }
    if (!order) {
      setError("No order to complete");
      return;
    }
    try {
      await axios.put(
        `https://tamarmyaybackend-last.onrender.com/api/orders/${order.id}`,
        { status: "Completed", paymentMethod, customerNote },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Order completed!");
      navigate("/checkout");
    } catch (err) {
      console.error(
        "Error completing order:",
        err.response?.data || err.message
      );
      setError(err.response?.data?.error || "Failed to complete order");
    }
  };

  // No need for separate initialization with global printer context
  // useEffect removed - printer is managed globally

  // Connect to Bluetooth printer using global context
  const connectBluetoothPrinter = async () => {
    try {
      // Check if already connected
      if (checkConnection()) {
        alert("✅ Printer is already connected!");
        return;
      }
      
      await connectPrinter();
      setError("");
      
      // Show appropriate message based on connection type
      if (connectionStatus === 'connected') {
        alert("✅ Bluetooth printer connected successfully! Connection will persist for the entire session.");
      }
    } catch (error) {
      console.error("Bluetooth connection failed:", error);
      setError("Failed to connect to Bluetooth printer. Make sure printer is on and in pairing mode.");
    }
  };

  // Test connection to laptop print server
  const testPrintServerConnection = async () => {
    if (!printServerUrl) {
      alert('⚠️  Please enter laptop IP address first!\n\nExample: http://192.168.1.100:3001');
      return;
    }

    printServer.setServerUrl(printServerUrl);
    const result = await printServer.checkConnection();

    if (result.success) {
      setPrintServerConnected(true);
      localStorage.setItem('printServerUrl', printServerUrl);
      alert(`✅ Connected to laptop print server!\n\nStatus: ${result.message}\nMode: ${result.mode}`);
      setShowServerSetup(false);
    } else {
      setPrintServerConnected(false);
      alert(`❌ Cannot connect to print server\n\n${result.message}\n\nMake sure:\n1. Laptop print server is running\n2. iPad and laptop are on same WiFi\n3. IP address is correct`);
    }
  };

  // Print via laptop print server
  const handlePrintViaServer = async () => {
    if (!order) {
      setError("No order to print");
      return;
    }

    if (!printServerConnected) {
      alert('⚠️  Not connected to print server.\n\nPlease click "Setup Laptop Printer" first.');
      return;
    }

    // Calculate total
    const total = order.FoodItems?.reduce((sum, item) => {
      const price = parseFloat(item.OrderItem?.price) || parseFloat(foodItems[item.id]?.price) || 0;
      const quantity = parseInt(item.OrderItem?.quantity) || 1;
      return sum + price * quantity;
    }, 0) || 0;

    // Prepare receipt data
    const receiptData = {
      restaurantName: "TAMARMYAY RESTAURANT",
      address1: "52/345-2 Ek Prachim Rd, Lak Hok,",
      address2: "Pathum Thani, 12000",
      orderType: orderType.charAt(0).toUpperCase() + orderType.slice(1),
      tableNumber: orderType === "dine-in" ? tableNumber : null,
      dateTime: currentDateTime,
      orderId: order.id,
      customerName: orderType === "delivery" ? order.customerName : null,
      buildingName: orderType === "delivery" ? order.buildingName : null,
      items: order.FoodItems?.map(item => ({
        name: item.name,
        quantity: item.OrderItem?.quantity || 1,
        price: (parseFloat(item.OrderItem?.price) || parseFloat(foodItems[item.id]?.price) || 0).toFixed(2)
      })) || [],
      total: total.toFixed(2),
      paymentMethod: paymentMethod || null,
      customerNote: customerNote || null,
      footerMessage: "Thank You & See You Again"
    };

    try {
      const result = await printServer.print(receiptData);
      
      if (result.success) {
        alert(`✅ Receipt sent to laptop printer!\n\nOrder ID: ${result.orderId}\nMode: ${result.mode}`);
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Print server error:', error);
      alert(`❌ Print failed: ${error.message}\n\nMake sure laptop print server is still running.`);
      setPrintServerConnected(false);
    }
  };

  // Detect if running on iOS
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  const handlePrint = async () => {
    if (!order) {
      setError("No order to print");
      return;
    }

    // Calculate total
    const total = order.FoodItems?.reduce((sum, item) => {
      const price = parseFloat(item.OrderItem?.price) || parseFloat(foodItems[item.id]?.price) || 0;
      const quantity = parseInt(item.OrderItem?.quantity) || 1;
      return sum + price * quantity;
    }, 0) || 0;

    // Prepare receipt data in your exact format
    const receiptData = {
      restaurantName: "TAMARMYAY RESTAURANT",
      address1: "52/345-2 Ek Prachim Rd, Lak Hok,",
      address2: "Pathum Thani, 12000",
      orderType: orderType.charAt(0).toUpperCase() + orderType.slice(1),
      tableNumber: orderType === "dine-in" ? tableNumber : null,
      dateTime: currentDateTime,
      orderId: order.id,
      customerName: orderType === "delivery" ? order.customerName : null,
      buildingName: orderType === "delivery" ? order.buildingName : null,
      items: order.FoodItems?.map(item => ({
        name: item.name,
        quantity: item.OrderItem?.quantity || 1,
        price: (parseFloat(item.OrderItem?.price) || parseFloat(foodItems[item.id]?.price) || 0).toFixed(2)
      })) || [],
      total: total.toFixed(2),
      paymentMethod: paymentMethod || null,
      customerNote: customerNote || null,
      footerMessage: "Thank You & See You Again"
    };

    try {
      // Use global printer context for printing (handles iOS automatically)
      await printReceipt(receiptData);
      
      if (isIOS) {
        alert('✅ Receipt sent to print queue! Check your iPad\'s print preview or AirPrint dialog.');
      } else {
        alert('✅ Receipt printed successfully!');
      }
      return;
    } catch (error) {
      console.error('Print failed:', error);
      setError(`Print failed: ${error.message}`);
      
      // iOS-specific fallback message
      if (isIOS) {
        const fallbackChoice = window.confirm(
          `Bluetooth printing failed on iPad.\n\nOptions:\n1. Use Safari's built-in print (recommended)\n2. Try connecting printer via Settings > Bluetooth first\n\nWould you like to use Safari print now?`
        );
        
        if (fallbackChoice) {
          window.print();
        }
      } else {
        // Non-iOS fallback
        const fallbackChoice = window.confirm(
          `Thermal printing failed: ${error.message}\n\nWould you like to print using browser instead?`
        );
        
        if (fallbackChoice) {
          window.print();
        }
      }
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FFFCF1] md:flex-row">
      {/* Hamburger Menu Icon for Mobile */}
      <div className="md:hidden flex items-center justify-between p-4 z-20 print:hidden">
        <i
          className="bi bi-list text-3xl cursor-pointer"
          onClick={toggleMenu}
        ></i>
        <img
          src="https://res.cloudinary.com/dnoitugnb/image/upload/v1747419279/Component_4_vdovyj.svg"
          alt="Back arrow"
          className="cursor-pointer w-8 h-8"
          onClick={() => navigate("/checkout")}
          aria-label="Go back to checkout"
        />
      </div>

      {/* Overlay for Mobile */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden print:hidden"
          onClick={toggleMenu}
        ></div>
      )}

      {/* Sidebar - Slides in/out on mobile */}
      <div
        className={`fixed top-0 left-0 w-64 md:w-[145.5px] h-screen bg-[#FFFCF1] border-r-2 border-black z-20 transform transition-transform duration-300 ease-in-out ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 print:hidden`}
      >
        <div className="flex justify-end p-4 md:hidden">
          <i
            className="bi bi-x text-3xl cursor-pointer"
            onClick={toggleMenu}
          ></i>
        </div>
        <img
          src="https://res.cloudinary.com/dnoitugnb/image/upload/v1746340828/tmylogo.png"
          alt="Logo"
          className="w-full max-w-[200px] sm:max-w-[250px] md:max-w-[300px] mx-auto mt-8 sm:mt-12 md:mt-16 mb-8 sm:mb-12 md:mb-16 cursor-pointer"
          onClick={() => (window.location.href = "/")}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center p-4 md:pl-[145.5px] lg:pl-40 print:pl-0 md:p-6 lg:p-8">
        <img
          src="https://res.cloudinary.com/dnoitugnb/image/upload/v1747419279/Component_4_vdovyj.svg"
          alt="Back arrow"
          className="cursor-pointer hidden md:block absolute top-4 right-4 md:top-6 md:right-6 w-8 h-8 print:hidden"
          onClick={() => navigate("/checkout")}
          aria-label="Go back to checkout"
        />
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center uppercase underline my-6 sm:my-8 md:my-12 print:hidden">
          Check Bills
        </h2>
        <PWAInstallPrompt />
        {error && (
          <p className="text-red-500 text-center mb-4 text-sm sm:text-base print:hidden">
            {error}
          </p>
        )}
        {!order && !error && (
          <p className="text-center mb-4 text-sm sm:text-base print:hidden">
            No orders found.
          </p>
        )}
        {order && (
          <div className="w-full max-w-[600px] sm:max-w-[800px] mb-8 flex flex-col items-center px-4 sm:px-6 lg:px-0">
            <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-4 text-left w-full underline print:hidden">
              {orderType === "dine-in"
                ? `Invoice for Table ${tableNumber}`
                : `Invoice for Delivery Order ${order.id}`}
            </h3>
            <div className="border p-4 rounded-lg shadow bg-white w-full max-w-[295px] sm:max-w-[340px] min-h-[432px] invoice-container">
              <div className="flex flex-col justify-between items-start mb-4">
                <div className="flex flex-col items-center w-full">
                  <img
                    src="https://res.cloudinary.com/dnoitugnb/image/upload/v1746340828/tmylogo.png"
                    alt="Restaurant Logo"
                    className="w-20 sm:w-24 md:w-32 mb-4 sm:mb-6 mt-4 sm:mt-6 invoice-logo"
                  />
                  <p className="text-[7px] sm:text-[8px] text-black text-center not-italic font-light">
                    52/345-2 Ek Prachim Road, Lak Hok,
                  </p>
                  <p className="text-[7px] sm:text-[8px] text-black text-center not-italic font-light mb-3 sm:mb-4">
                    Pathum Thani, 12000
                  </p>
                </div>
                <div className="text-[10px] sm:text-xs md:text-sm text-left">
                  <p className="grid grid-cols-2 gap-1 sm:gap-2 text-[10px] sm:text-xs">
                    <strong>Order Type:</strong>{" "}
                    {orderType.charAt(0).toUpperCase() + orderType.slice(1)}
                  </p>
                  {orderType === "dine-in" && (
                    <p className="grid grid-cols-2 gap-1 sm:gap-2 text-[10px] sm:text-xs">
                      <strong>Table No:</strong> {tableNumber}
                    </p>
                  )}
                  <p className="grid grid-cols-2 gap-1 sm:gap-2 text-[10px] sm:text-xs">
                    <strong>Date & Time:</strong> {currentDateTime}
                  </p>
                  <p className="grid grid-cols-2 gap-1 sm:gap-2 text-[10px] sm:text-xs">
                    <strong>Order ID:</strong> {order.id}
                  </p>
                </div>
              </div>
              {orderType === "delivery" && (
                <div className="text-[10px] sm:text-xs md:text-sm mb-3 sm:mb-4">
                  <p className="grid grid-cols-2 gap-1 sm:gap-2 text-[10px] sm:text-xs">
                    <strong>Customer:</strong> {order.customerName || "N/A"}
                  </p>
                  <p className="grid grid-cols-2 gap-1 sm:gap-2 text-[10px] sm:text-xs">
                    <strong>Building:</strong> {order.buildingName || "N/A"}
                  </p>
                </div>
              )}
              <hr className="my-3 sm:my-4 border-gray-300" />
              <div className="mb-3 sm:mb-4">
                <div className="grid grid-cols-3 gap-1 sm:gap-2 text-[10px] sm:text-xs md:text-sm font-semibold pb-1 sm:pb-2 item-grid">
                  <span>Item</span>
                  <span className="text-center">Qty</span>
                  <span className="text-right">Price</span>
                </div>
                {order.FoodItems?.map((item) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-3 gap-1 sm:gap-2 text-[10px] sm:text-xs md:text-sm py-0.5 sm:py-1 item-grid"
                  >
                    <span className="truncate">{item.name}</span>
                    <span className="text-center">
                      {item.OrderItem?.quantity || "N/A"}
                    </span>
                    <span className="text-right">
                      {(
                        parseFloat(item.OrderItem?.price) ||
                        parseFloat(foodItems[item.id]?.price) ||
                        0
                      ).toFixed(2)}{" "}
                      B
                    </span>
                  </div>
                ))}
              </div>
              <hr className="my-3 sm:my-4 border-gray-300" />
              <div className="text-right text-xs sm:text-sm md:text-base font-semibold grid grid-cols-2 total-section">
                <p className="text-left">Total: </p>
                {(
                  order.FoodItems?.reduce((sum, item) => {
                    const price =
                      parseFloat(item.OrderItem?.price) ||
                      parseFloat(foodItems[item.id]?.price) ||
                      0;
                    const quantity = parseInt(item.OrderItem?.quantity) || 1;
                    return sum + price * quantity;
                  }, 0) || 0
                ).toFixed(2)}{" "}
                B
              </div>
              <p className="text-[7px] sm:text-[8px] text-black text-center not-italic font-light mt-4 sm:mt-6 footer-text">
                Thank You & See You Again
              </p>
            </div>
            <div className="w-full mt-6 sm:mt-8 md:mt-12 lg:mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 print:hidden">
              <div className="flex flex-col">
                <label className="font-semibold text-sm sm:text-base underline mb-2 whitespace-nowrap">
                  Select Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full max-w-[230px] p-2 border rounded text-sm sm:text-base"
                  aria-label="Select payment method"
                >
                  <option value="">Select Payment Method</option>
                  <option value="Cash">Cash</option>
                  <option value="Card">Card</option>
                  <option value="Mobile">Mobile</option>
                </select>
              </div>
              <div className="flex flex-col">
                <label className="font-semibold text-sm sm:text-base underline mb-2">
                  Customer Note
                </label>
                <textarea
                  value={customerNote}
                  onChange={(e) => setCustomerNote(e.target.value)}
                  placeholder="Enter customer note"
                  className="w-full max-w-[230px] h-[43px] p-2 border rounded text-sm sm:text-base resize-none"
                  aria-label="Customer note"
                />
              </div>
              <div className="flex flex-col gap-3 sm:gap-4">
                {/* Show iPad-specific instructions */}
                {isIOS && (
                  <div className="bg-blue-100 border border-blue-300 rounded-lg p-3 text-xs sm:text-sm mb-2">
                    <p className="font-semibold text-blue-800">🍎 iPad Printing Options:</p>
                    <p className="text-blue-700">
                      • <strong>Laptop Server:</strong> Best option! Connect via WiFi<br/>
                      • <strong>Bluetooth:</strong> Direct connection (may not work)<br/>
                      • <strong>Safari Print:</strong> Backup option
                    </p>
                  </div>
                )}
                
                {/* Laptop Print Server Setup/Connect Button */}
                {isIOS && !showServerSetup && (
                  <button
                    onClick={() => setShowServerSetup(true)}
                    className={`w-full max-w-[200px] h-10 sm:h-12 rounded-[20px] font-semibold text-sm sm:text-base ${
                      printServerConnected 
                        ? 'bg-green-600 text-white' 
                        : 'bg-purple-600 text-white hover:bg-purple-700'
                    }`}
                  >
                    {printServerConnected ? '✅ Laptop Connected' : '💻 Setup Laptop Printer'}
                  </button>
                )}

                {/* Print Server Setup Dialog */}
                {isIOS && showServerSetup && (
                  <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-4 mb-3">
                    <h3 className="font-bold text-purple-900 mb-2">💻 Laptop Print Server Setup</h3>
                    <div className="text-xs text-purple-800 mb-3">
                      <p><strong>Step 1:</strong> On laptop, run: <code className="bg-purple-200 px-1">cd print-server && npm start</code></p>
                      <p><strong>Step 2:</strong> Find laptop IP: <code className="bg-purple-200 px-1">ipconfig</code></p>
                      <p><strong>Step 3:</strong> Enter laptop IP below:</p>
                    </div>
                    <input
                      type="text"
                      value={printServerUrl}
                      onChange={(e) => setPrintServerUrl(e.target.value)}
                      placeholder="http://192.168.1.100:3001"
                      className="w-full p-2 border border-purple-300 rounded text-sm mb-2"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={testPrintServerConnection}
                        className="flex-1 bg-purple-600 text-white rounded py-2 text-sm font-semibold hover:bg-purple-700"
                      >
                        Test Connection
                      </button>
                      <button
                        onClick={() => setShowServerSetup(false)}
                        className="px-4 bg-gray-300 text-black rounded py-2 text-sm font-semibold hover:bg-gray-400"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Print via Laptop Server Button (Main Print Option for iPad) */}
                {isIOS && printServerConnected && (
                  <button
                    onClick={handlePrintViaServer}
                    className="w-full max-w-[200px] h-12 sm:h-14 bg-green-600 text-white rounded-[20px] font-bold text-base sm:text-lg hover:bg-green-700 shadow-lg"
                  >
                    🖨️ Print via Laptop
                  </button>
                )}
                
                {/* Bluetooth option (kept for non-iPad or as backup) */}
                {!isIOS && (
                  <button
                    onClick={connectBluetoothPrinter}
                    className={`w-full max-w-[150px] h-10 sm:h-12 rounded-[20px] font-semibold text-sm sm:text-base ${
                      isPrinterConnected 
                        ? 'bg-green-500 text-white' 
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                    }`}
                    disabled={isPrinterConnected}
                  >
                    {isPrinterConnected ? '✅ Connected' : '📱 Connect Printer'}
                  </button>
                )}
                
                <button
                  onClick={handleCheckout}
                  className="w-full max-w-[150px] h-10 sm:h-12 bg-[#DCC99B]/70 text-black rounded-[20px] font-semibold hover:bg-[#DCC99B]/80 text-sm sm:text-base"
                >
                  Complete Order
                </button>
                
                {/* Direct Bluetooth Print (non-iPad or as fallback) */}
                {!isIOS && (
                  <button
                    onClick={handlePrint}
                    className="w-full max-w-[150px] h-10 sm:h-12 bg-[#DCC99B]/70 text-black rounded-[20px] font-semibold hover:bg-[#DCC99B]/80 text-sm sm:text-base"
                  >
                    🖨️ Print Receipt
                  </button>
                )}
                
                {/* iPad-specific Safari print button (backup) */}
                {isIOS && (
                  <button
                    onClick={() => window.print()}
                    className="w-full max-w-[150px] h-8 sm:h-10 bg-orange-500 text-white rounded-[15px] font-semibold hover:bg-orange-600 text-xs sm:text-sm"
                  >
                    📄 Safari Print
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Invoice;
