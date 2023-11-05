import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import io from 'socket.io-client';
import Toast from 'react-native-toast-message';

const CartContext = createContext();

export const useCart = () => {
    return useContext(CartContext);
};

export const CartProvider = ({ children }) => {
    const socket = io.connect(`http://${host}`, {
        transports: ["websocket"],
    });
    const [room, setRoom] = useState(""); // Never used further
    useEffect(() => {
        console.log("dfghj\n");
        AsyncStorage.getItem('autUser').then((user) => {
            user = JSON.parse(user);
            let role = "";
            if (user) {
                role = user.role;
            }
            console.log("jk-=========================================\n", role);
            if (role === "waiter") {
                socket.emit("join_waiters_room", { waiter: `${user._id}` });
                socket.on("pick_order", (data) => {
                    // toast.info(data, {
                    //   position: "bottom-right",
                    //   autoClose: 5000,
                    //   hideProgressBar: false,
                    //   closeOnClick: true,
                    //   progress: undefined,
                    //   theme: "light",
                    // });
                    Toast.show({
                        text1: 'New Order',
                        text2: data,
                        visibilityTime: 5000,
                        position: 'bottom',
                        type: 'info',
                        bottomOffset: 40,
                    });
                });
                socket.on("chef_ended", (data) => {
                    // toast.info(data, {
                    //   position: "bottom-right",
                    //   autoClose: 5000,
                    //   hideProgressBar: false,
                    //   closeOnClick: true,
                    //   progress: undefined,
                    //   theme: "light",
                    // });
                    Toast.show({
                        text1: 'Order Completed',
                        text2: data,
                        visibilityTime: 5000,
                        position: 'bottom',
                        type: 'info',
                        bottomOffset: 40,
                    });
                });
            }
            if (role === "chef") {
                socket.emit("join_chefs_room", { chef: `${user._id}` });
                socket.on("waiter_confirmed", (data) => {
                    // toast.info(data, {
                    //   position: "bottom-right",
                    //   autoClose: 5000,
                    //   hideProgressBar: false,
                    //   closeOnClick: true,
                    //   progress: undefined,
                    //   theme: "light",
                    // });
                    Toast.show({
                        text1: 'Order Confirmed',
                        text2: data,
                        visibilityTime: 5000,
                        position: 'bottom',
                        type: 'info',
                        bottomOffset: 40,
                    });
                });
            }
            if (role === "customer") {
                socket.emit("join_customer_room", {
                    customer: user._id,
                });
                socket.on("waiter_confirmed", (data) => {
                    // toast.info(data, {
                    //   position: "bottom-right",
                    //   autoClose: 5000,
                    //   hideProgressBar: false,
                    //   closeOnClick: true,
                    //   progress: undefined,
                    //   theme: "light",
                    // });
                    Toast.show({
                        text1: 'Order Confirmed',
                        text2: data,
                        visibilityTime: 5000,
                        position: 'bottom',
                        type: 'info',
                        bottomOffset: 40,
                    });
                });
                socket.on("chef_started", (data) => {
                    // toast.info(data, {
                    //   position: "bottom-right",
                    //   autoClose: 5000,
                    //   hideProgressBar: false,
                    //   closeOnClick: true,
                    //   progress: undefined,
                    //   theme: "light",
                    // });
                    Toast.show({
                        text1: 'Order Started',
                        text2: data,
                        visibilityTime: 5000,
                        position: 'bottom',
                        type: 'info',
                        bottomOffset: 40,
                    })
                });
                socket.on("chef_ended", (data) => {
                    // toast.info(data, {
                    //   position: "bottom-right",
                    //   autoClose: 5000,
                    //   hideProgressBar: false,
                    //   closeOnClick: true,
                    //   progress: undefined,
                    //   theme: "light",
                    // });
                    Toast.show({
                        text1: 'Order Completed',
                        text2: data,
                        visibilityTime: 5000,
                        position: 'bottom',
                        type: 'info',
                        bottomOffset: 40,
                    })
                });
            }
        })
    }, [socket]);
    const [cartItems, setCartItems] = useState([]);
    const [orderedItems, setOrderedItems] = useState([]);

    const addToCart = (item) => {
        const existingItem = cartItems.find((cartItem) => cartItem._id === item._id);

        if (existingItem) {
            const updatedCart = cartItems.map((cartItem) =>
                cartItem._id === item._id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem
            );
            setCartItems(updatedCart);
        } else {
            setCartItems((prevCartItems) => [...prevCartItems, { ...item, quantity: 1 }]);
        }
    };

    const increaseQuantity = (itemId) => {
        const updatedCart = cartItems.map((cartItem) =>
            cartItem._id === itemId ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem
        );
        setCartItems(updatedCart);
    };

    const decreaseQuantity = (itemId) => {
        const updatedCart = cartItems
            .map((cartItem) =>
                cartItem._id === itemId ? { ...cartItem, quantity: Math.max(cartItem.quantity - 1, 0) } : cartItem
            )
            .filter((cartItem) => cartItem.quantity > 0);
        setCartItems(updatedCart);
    };

    const calculateItemTotal = item => {
        // console.log(item.quantity);
        // console.log(item.price * item.quantity);
        return item.quantity * item.price;
    };

    const calculateSubTotal = () => {
        // console.log(cartItems);
        return cartItems.reduce((total, item) => total + calculateItemTotal(item), 0);
    };

    const calculateGST = subTotal => {
        return subTotal * 0.18; // Assuming GST is 18%
    };

    const calculateGrandTotal = subTotal => {
        return subTotal + calculateGST(subTotal);
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const createOrder = async (update) => {
        let message = "";
        const menuItems = cartItems.map((obj) => ({
            menuName: obj._id,
            quantity: obj.quantity,
        }));
        console.log("heree", menuItems, calculateSubTotal().toFixed(2));
        await AsyncStorage.getItem("autUser").then(async (data) => {
            if (data) {
                data = JSON.parse(data);
                if (update) {
                    console.log("\n\nnjiewnfj\n\n", update);
                    await axios.patch(
                        `http://${host}/api/v1/orders/${update._id}`,
                        {
                            user: data._id,
                            menuItems,
                            totalAmount: calculateSubTotal().toFixed(2),
                            tableNumber: update.tableNumber
                            // tableNumber: Math.floor(Math.random() * 10),
                        },
                        {
                            headers: {
                                authorization: `Bearer ${data.token}`,
                            },
                        }
                    )
                        .then((res) => {
                            message = "Order Updated Sucessfully";
                            // setToastMessage('Order Updated Sucessfully');
                            console.log("res233", res.data);
                        })
                        .then(() => {
                            clearCart();
                        })
                        .catch((err) => {
                            message = "Order not Updated Sucessfully";
                            console.log("\n\nerr98456", err);
                        });
                }
                else {
                    console.log("\n\nllniurefnfj\n\n");
                    await axios.post(
                        `http://${host}/api/v1/orders/`,
                        {
                            user: data._id,
                            menuItems,
                            totalAmount: calculateSubTotal().toFixed(2),
                            tableNumber: Math.floor(Math.random() * 10),
                        },
                        {
                            headers: {
                                authorization: `Bearer ${data.token}`,
                            },
                        }
                    )
                        .then((res) => {
                            console.log("res", res.data);
                            socket.emit("order_placed", {
                                tableNumber: 1,
                            });
                            // setToastMessage('Order Placed Sucessfully');
                            // toast.success("Order placed successfully", {
                            //     position: "bottom-right",
                            //     autoClose: 4000,
                            //     hideProgressBar: false,
                            //     closeOnClick: true,
                            //     progress: undefined,
                            //     theme: "light",
                            // });
                        })
                        .then(() => {
                            message = "Order Placed Sucessfully";
                            console.log("message1\n\n", message);
                            clearCart();
                        })
                        .catch((err) => {
                            message = "Order not Placed Sucessfully";
                            console.log("err", err);
                        });
                }
            }
        });
        console.log("message2323\n\n", message);
        return message;
    }

    useEffect(() => {
        const interval = setInterval(() => {
            const updatedItems = orderedItems.map(item => {
                if (item.status === 'Order Placed') {
                    return { ...item, status: 'Approved by Waiter' };
                } else if (item.status === 'Approved by Waiter') {
                    return { ...item, status: 'Preparing' };
                } else if (item.status === 'Preparing') {
                    return { ...item, status: 'Served' };
                }
                return item;
            });

            setOrderedItems(updatedItems);
        }, 3000);

        return () => clearInterval(interval); // Cleanup on unmount
    }, [orderedItems]);

    return (
        <CartContext.Provider
            value={{
                cartItems,
                addToCart,
                orderedItems,
                increaseQuantity,
                decreaseQuantity,
                clearCart,
                createOrder,
                calculateSubTotal,
                calculateGST,
                calculateGrandTotal,
                socket,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};
