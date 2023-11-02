import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CartContext = createContext();

export const useCart = () => {
    return useContext(CartContext);
};

export const CartProvider = ({ children }) => {
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

    const createOrder = (update) => {
        const menuItems = cartItems.map((obj) => ({
            menuName: obj._id,
            quantity: obj.quantity,
        }));
        console.log("heree", menuItems, calculateSubTotal().toFixed(2));
        AsyncStorage.getItem("autUser").then(async (data) => {
            if (data) {
                data = JSON.parse(data);
                if (update) {
                    console.log("\n\nnjiewnfj\n\n", update);
                    await axios.patch(
                        `http://10.196.11.3:8000/api/v1/orders/${update._id}`,
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
                            console.log("res233", res.data);
                        })
                        .then(() => {
                            clearCart();
                        })
                        .catch((err) => {
                            console.log("\n\nerr98456", err);
                        });
                }
                else {
                    console.log("\n\nllniurefnfj\n\n");
                    await axios.post(
                        "http://10.196.11.3:8000/api/v1/orders/",
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
                        })
                        .then(() => {
                            clearCart();
                        })
                        .catch((err) => {
                            console.log("err", err);
                        });
                }
            }
        });
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
            }}
        >
            {children}
        </CartContext.Provider>
    );
};
