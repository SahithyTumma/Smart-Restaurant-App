import React, { useState, useEffect, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, ImageBackground } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useCart } from '../Contexts/CartContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker'; // Import Picker from the correct package
import Toast from 'react-native-toast-message';
import HamburgerMenu from './HamburgerMenu';

const OrderStatusScreen = () => {
    const { orderedItems, addToCart, socket } = useCart();
    // const [updatedOrderedItems, setUpdatedOrderedItems] = useState(orderedItems);
    const navigation = useNavigation();
    const [showSuccess, setShowSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [state, setState] = useState("");
    const [orderData, setOrderData] = useState({});
    const [total, setTotal] = useState(0);
    const [expandedCards, setExpandedCards] = useState(new Array(orderData.length).fill(false));
    const [refresh, setRefresh] = useState(false);
    const [rolei, setRole] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const { params } = useRoute();
    const message = params?.messagee;
    console.log("params", message);
    const [toastMessage, setToastMessage] = useState(message || null);

    useEffect(() => {
        const timer = setTimeout(() => {
            setRefresh(!refresh);
        }, 500); // Refresh after 2000 milliseconds (2 seconds)

        // Clear the timer to avoid memory leaks
        return () => clearTimeout(timer);
    }, [])

    useLayoutEffect(() => {
        navigation.setOptions({
            headerBackTitleVisible: false,
            headerTitle: 'Smart Restaurant App',
            headerRight: () => <HamburgerMenu />,
            headerStyle: {
                backgroundColor: '#F2ECEB', // Change 'your_color_here' to your desired header color
                elevation: 10,
                shadowColor: '#000', // Shadow color
                shadowOffset: {
                    width: 0,
                    height: 10,
                },
                shadowOpacity: 1, // Shadow opacity (0 to 1)
                shadowRadius: 5,
            },
            headerTintColor: '#FF841C',
            headerTitleStyle: {
                color: '#FF841C',
            },
        });
    }, [navigation]);

    useEffect(() => {
        if (toastMessage) {
            Toast.show({
                text1: toastMessage,
                visibilityTime: 3000,
                position: 'bottom',
                type: 'success', // or 'error' for error messages
                bottomOffset: 40,
            });

            // Clear toast message after displaying
            setToastMessage(null);
        }
    }, [toastMessage]);

    const handleCardClick = (index) => {
        const newExpandedCards = [...expandedCards];
        newExpandedCards[index] = !newExpandedCards[index];
        setExpandedCards(newExpandedCards);
    };

    const handleRefresh = () => {
        setRefresh(!refresh)
    }

    useEffect(() => {
        setIsLoading(true);
        AsyncStorage.multiGet(['role', 'authUser', '_id']).then((response) => {
            console.log("data", response);
            let role = response[0][1];
            let token = response[1][1];
            let _id = response[2][1];
            setRole(role);
            if (role === 'waiter') {
                // setState('pending');
                setSelectedStatus('pending');
            }
            else if (role === 'chef') {
                // setState('confirmed_by_waiter');
                setSelectedStatus('confirmed_by_waiter');
            }
            console.log("role", role);
            console.log("token", token);
            console.log("_id", _id);
            if (role) {
                let apiURL = `http://${host}/api/v1/orders?`;
                apiURL += state.length > 0 ? `status=${state}&` : "";
                if (role === "customer") {
                    console.log("entered customer");
                    apiURL += `sort=-createdAt&user=${_id}&status[ne]=payment_done`;
                } else if (role === "waiter") {
                    apiURL += "sort=createdAt&";
                    if (state.length === 0) apiURL += "status=pending&";
                    else if (state !== "pending") apiURL += `waiter=${_id}&`;
                } else if (role === "chef") {
                    apiURL += "sort=createdAt&";
                    if (state.length === 0) {
                        setState("confirmed_by_waiter");
                        apiURL += `status=confirmed_by_waiter`;
                    }
                    if (state !== "confirmed_by_waiter" && state !== "pending") {
                        apiURL += `chef=${_id}&`;
                    }
                }
                console.log("api", apiURL);
                axios.get(apiURL, {
                    headers: {
                        authorization: `Bearer ${token}`,
                    },
                })
                    .then((response) => {
                        setIsLoading(false);
                        setOrderData(response.data);
                        console.log(response.data[0].menuItems);
                        console.log("res11", response.data);
                        const calculatedTotal = calculateTotal(response.data);
                        setTotal(calculatedTotal);
                        setExpandedCards(new Array(response.data.length).fill(false));
                    })
                    .catch((err) => {
                        console.log("err1", err);
                        // setIsLoading(false);
                    });
            }
        })
        // console.log("rolei", rolei);
    }, [refresh, state]);
    function formatDate(inputDate) {
        const months = [
            "Jan", "Feb", "Mar", "Apr", "May", "June",
            "July", "Aug", "Sept", "Oct", "Nov", "Dec"
        ];

        const dateObj = new Date(inputDate);
        const day = dateObj.getDate();
        const month = months[dateObj.getMonth()];
        const year = dateObj.getFullYear();
        const hours = dateObj.getHours();
        const minutes = dateObj.getMinutes();

        const formattedDate = `${day} ${month} ${year} at ${hours}:${(minutes < 10 ? '0' : '') + minutes}`;
        return formattedDate;
    }
    // useEffect(() => {
    //     navigation.setOptions({
    //         headerTitle: '',
    //         headerBackTitleVisible: false,
    //         headerRight: () => (
    //             <TouchableOpacity onPress={handleModifyOrder} style={styles.modifyOrderButton}>
    //                 <Text style={styles.modifyOrderButtonText}>Modify Order</Text>
    //             </TouchableOpacity>
    //         ),
    //     });
    //     const allItemsServed = orderedItems.every(item => item.status === 'Served');

    //     if (allItemsServed) {
    //         setShowSuccess(true);
    //     }

    // }, [orderedItems]);

    const handleModifyOrder = () => {
        const itemsToModify = orderedItems.filter(
            item => item.status !== 'Preparing' && item.status !== 'Served'
        );

        itemsToModify.forEach(item => {
            addToCart(item);
        });

        navigation.navigate('Menu');
    };

    const calculateTotal = orderData => {
        if (!orderData) {
            return "Invalid data";
        }

        let totalAmount = 0;
        orderData.forEach(order => {
            totalAmount += order.totalAmount;
        });
        return totalAmount.toFixed(2);
    };

    const handleUpdate = (id) => {
        console.log("nhufbhje");
        console.log("id", id);
        navigation.navigate('Menu', { orderId: id });
    }

    const updateOrder = (orderId, body) => {
        // try {
        AsyncStorage.getItem('authUser').then(async (token) => {
            console.log("token", token);
            await axios.patch(
                `http://${host}/api/v1/orders/${orderId}`,
                body,
                {
                    headers: {
                        authorization: `Bearer ${token}`,
                    },
                }
            ).then((res) => {
                console.log("res", res.data);
                if (body.status === "confirmed_by_waiter") {
                    console.log('confirmed_by_waiter');
                    socket.emit("order_confirmed", {
                        customer: `${body.user}`,
                        tableNumber: `${body.tableNumber}`,
                    });

                    console.log("niewufbhewuifbewj =============================================================");
                    // toast.success("Order confirmed", {
                    //     position: "bottom-right",
                    //     autoClose: 2000,
                    //     hideProgressBar: false,
                    //     closeOnClick: true,
                    //     progress: undefined,
                    //     theme: "light",
                    // });
                    setToastMessage("Order confirmed");
                    // navigation.navigate('Status', { messagee: "Order Confirmed" });
                    // Toast.show({
                    //     text1: 'Order Confirmed Sucessfully',
                    //     visibilityTime: 5000,
                    //     position: 'bottom',
                    //     type: 'info',
                    //     bottomOffset: 40,
                    // })
                    // socket.emit("order_confirmed", {
                    //     customer: `${body.user}`,
                    //     tableNumber: `${body.tableNumber}`,
                    // });
                    // toast.success("Order confirmed", {
                    //     position: "bottom-right",
                    //     autoClose: 2000,
                    //     hideProgressBar: false,
                    //     closeOnClick: true,
                    //     progress: undefined,
                    //     theme: "light",
                    // });
                }
                if (body.status === "confirmed_by_chef") {
                    console.log('confirmed_by_chef');
                    socket.emit("preparation_started", {
                        customer: `${body.user}`,
                    });
                    // toast.success("You started preparation", {
                    //     position: "bottom-right",
                    //     autoClose: 2000,
                    //     hideProgressBar: false,
                    //     closeOnClick: true,
                    //     progress: undefined,
                    //     theme: "light",
                    // });
                    setToastMessage("Preparation started");
                }
                if (body.status === "order_is_ready") {
                    console.log('order is ready');
                    socket.emit("order_is_ready", {
                        customer: `${body.user}`,
                        waiter: `${body.waiter}`,
                        tableNumber: `${body.tableNumber}`,
                    });
                    // toast.success("Order is ready.", {
                    //     position: "bottom-right",
                    //     autoClose: 2000,
                    //     hideProgressBar: false,
                    //     closeOnClick: true,
                    //     progress: undefined,
                    //     theme: "light",
                    // });
                    setToastMessage("Order is Ready");
                }

                // setToastMessage("Order updated successfully!");

            }).catch((err) => {
                console.log("err", err);
            });
            setTimeout(() => {
                setRefresh(!refresh);
            }, 2000); // Refresh after 2000 milliseconds (2 seconds)

            // Clear the timer to avoid memory leaks
            // return () => clearTimeout(timer);
            setRefresh(!refresh);
            return () => clearTimeout(timer);
            // setRefresh(!refresh);
        })
        // const token = JSON.parse(localStorage.getItem("SRA_userData")).token;
        // window.location.reload();
        // } catch (err) {
        //     console.log(err);
        //     // toast.error(`${err.response.data.message}`, {
        //     //     position: "bottom-right",
        //     //     autoClose: 2000,
        //     //     hideProgressBar: false,
        //     //     closeOnClick: true,
        //     //     progress: undefined,
        //     //     theme: "light",
        //     // });
        // }
    };

    // const handleCancel = () => {
    const handleCancel = (orderId) => {
        try {
            AsyncStorage.getItem("authUser").then(async (token) => {
                if (token) {
                    await axios.delete(`http://${host}/api/v1/orders/${orderId}`, {
                        headers: {
                            authorization: `Bearer ${token}`,
                        },
                    }).then((res) => {
                        // if (orderData.length === 1) {
                        //     setOrderData([]);
                        // }
                        // else {
                        //     const updatedOrders = orderData.map(order => (order._id === orderId ? res.data : order));
                        //     setOrderData(updatedOrders);
                        // }
                        setRefresh(!refresh);
                        console.log("order cancelled");
                        console.log("res233", res.data);
                        setToastMessage("Order cancelled successfully!");
                        // Toast.show({
                        //     text1: 'Order Cancelled Sucessfully',
                        //     visibilityTime: 5000,
                        //     position: 'bottom',
                        //     type: 'info',
                        //     bottomOffset: 40,
                        // });
                    })
                        .catch((err) => {
                            console.log("err98456", err);
                        });
                }
            })
        } catch (err) {
            // toast.error(`${err.response.data.message}`, {
            //     position: "bottom-right",
            //     autoClose: 4000,
            //     hideProgressBar: false,
            //     closeOnClick: true,
            //     progress: undefined,
            //     theme: "light",
            // });
            Toast.show({
                text1: `${err.response.data.message}`,
                visibilityTime: 5000,
                position: 'bottom',
                type: 'info',
                bottomOffset: 40,
            });
        }
    }
    // }

    const renderItem = ({ item, index }) => {
        const menuItems = item.menuItems;
        return (
            <TouchableOpacity onPress={() => handleCardClick(index)}>
                <View style={{ display: 'flex', flexDirection: 'column', marginBottom: 10, padding: 10, borderRadius: 10, borderWidth: 2, borderColor: '#D3D3D3' }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <View style={{ flexDirection: 'row' }}>
                            <Text style={styles.statusText}>Status:</Text>
                            {item.status === "" || item.status === "pending" && <Text style={[styles.statusText, styles.orderPlacedStatus]}>Order Placed</Text>}
                            {item.status === "confirmed_by_waiter" && <Text style={[styles.statusText, styles.approvedStatus]}>Order Confirmed</Text>}
                            {item.status === "confirmed_by_chef" && <Text style={[styles.statusText, styles.preparingStatus]}>Order Preparing</Text>}
                            {item.status === "order_is_ready" && <Text style={[styles.statusText, styles.servedStatus]}>Order Ready</Text>}
                            {item.status === "payment_done" && <Text style={styles.statusText}>Payment Received</Text>}
                        </View>
                        <Text style={styles.itemQuantity}>Table No: {item.tableNumber}</Text>
                    </View>

                    <View style={styles.itemDetails}>
                        {menuItems.map((menuItem, index) => (
                            <View key={index}>
                                <Text style={styles.itemQuantity}>
                                    {menuItem.quantity} x <Text style={{ color: '#000' }}>{menuItem.menuName.name}</Text>
                                </Text>
                            </View>
                        ))}
                        <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Text >{formatDate(item.createdAt)}</Text>
                            <Text style={styles.itemPrice}>₹{(item.totalAmount).toFixed(2)}</Text>
                        </View>
                    </View>
                    {expandedCards[index] && (
                        <View style={styles.cardButtonsContainer}>
                            <TouchableOpacity style={styles.cardButton} onPress={() => handleCancel(item._id)}>
                                <Text style={styles.cardButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.cardButton} onPress={() => handleUpdate(item)}>
                                <Text style={styles.cardButtonText}>Update</Text>
                            </TouchableOpacity>
                            {rolei === 'waiter' && item.status === 'pending' ?
                                <TouchableOpacity style={styles.cardButton} onPress={() => updateOrder(item._id, {
                                    status: "confirmed_by_waiter",
                                    user: item.user,
                                    tableNumber: item.tableNumber,
                                })}>
                                    <Text style={styles.cardButtonText}>Confirm Order</Text>
                                </TouchableOpacity> : null
                            }
                            {rolei === 'chef' && item.status === 'confirmed_by_waiter' ?
                                // {                                    
                                <TouchableOpacity style={styles.cardButton} onPress={() => updateOrder(item._id, {
                                    status: "confirmed_by_chef",
                                    user: item.user,
                                })}>
                                    <Text style={styles.cardButtonText}>Start Preparation</Text>
                                </TouchableOpacity> : null
                                // } : null
                            }
                            {rolei === 'chef' && item.status === 'confirmed_by_chef' ?
                                // {
                                <TouchableOpacity style={styles.cardButton} onPress={() => updateOrder(item._id, {
                                    status: "order_is_ready",
                                    user: item.user,
                                    waiter: item.waiter,
                                    tableNumber: item.tableNumber,
                                })}>
                                    <Text style={styles.cardButtonText}>Order Ready</Text>
                                </TouchableOpacity> : null
                                // } : null
                            }
                        </View>
                    )}
                </View>
            </TouchableOpacity >
        );
    };

    return (
        <ImageBackground
            source={require('../menuBackground.jpg')} // Change the path to your actual image file
            style={styles.backgroundImage}
        >
            <View style={styles.container}>
                {isLoading ? (
                    <ActivityIndicator size="large" color="#009688" />
                ) : (
                    <>
                        {rolei !== 'customer' ? <View style={styles.statusFilterContainer}>
                            <Text style={styles.statusFilterLabel}>Filter by Status:</Text>
                            <Picker
                                style={styles.statusFilterPicker}
                                selectedValue={selectedStatus}
                                onValueChange={(itemValue) => {
                                    setSelectedStatus(itemValue);
                                    setState(itemValue); // Update the state based on the selected value
                                }}
                            >
                                {/* <Picker.Item label="All" value="" /> */}
                                <Picker.Item label="Pending" value="pending" />
                                <Picker.Item label="Order Confirmed" value="confirmed_by_waiter" />
                                <Picker.Item label="Started Preparing" value="confirmed_by_chef" />
                                <Picker.Item label="Order Is Ready" value="order_is_ready" />
                            </Picker>
                        </View> : null}
                        <Text style={styles.title}>Order Status</Text>
                        <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
                            <Text style={styles.refreshButtonText}>Refresh</Text>
                        </TouchableOpacity>
                        <FlatList
                            showsVerticalScrollIndicator={false}
                            data={orderData} // Use the order data from the state
                            renderItem={renderItem}
                            keyExtractor={(item) => item._id}
                        />

                        {rolei === 'customer' ? <View style={styles.totalContainer}>
                            {/* {showSuccess && ( */}
                            <View style={styles.successContainer}>
                                {/* <Text style={styles.successText}>All items have been served!</Text> */}
                                <TouchableOpacity style={styles.payNowButton}>
                                    <Text style={styles.payNowButtonText}>Pay Now</Text>
                                </TouchableOpacity>
                            </View>
                            {/* )} */}
                            <Text style={styles.totalText}>Total:</Text>
                            <Text style={styles.totalAmount}>₹{total}</Text>
                        </View> : null}
                    </>
                )}
            </View>
        </ImageBackground>
    );
};


const styles = StyleSheet.create({
    cardButtonText: {
        fontSize: 15,
        color: 'black'
    },
    backgroundImage: {
        flex: 1,
        resizeMode: 'cover',
        justifyContent: 'center',
    },
    statusFilterContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    statusFilterLabel: {
        marginRight: 10,
        fontSize: 16,
    },
    statusFilterPicker: {
        flex: 1,
        height: 40,
    },
    container: {
        flex: 1,
        padding: 20,
        // backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#422E2B'
    },
    statusContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    statusItem: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 10,
        borderRadius: 10,
    },
    orderPlaced: {
        color: '#3498db',
        fontSize: 18,
        fontWeight: 'bold'
    },
    preparing: {
        backgroundColor: '#e67e22',
    },
    served: {
        backgroundColor: '#2ecc71',
    },
    statusBox: {
        display: 'flex',
        flexDirection: 'column',


    },
    statusText: {
        alignItems: 'flex-end',
        color: 'black',
        fontSize: 18,
        fontWeight: 'bold',
    },
    orderDetailsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    itemContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: "100%",
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        paddingBottom: 10,
    },
    itemName: {
        fontSize: 16,
        fontWeight: 'bold',
        width: '50%',
    },
    itemQuantity: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#777',
    },
    itemPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000'
        // textAlign: "right",
    },
    totalContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginTop: 20,
    },
    totalText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginRight: 10,
    },
    totalAmount: {
        fontSize: 18,
        color: 'green',
        fontWeight: 'bold',
    },
    orderPlacedStatus: {
        color: '#e74c3c',
    },
    approvedStatus: {
        color: '#27ae60',
    },
    preparingStatus: {
        color: '#f39c12',
    },
    servedStatus: {
        color: '#3498db',
    },
    modifyOrderButton: {
        marginRight: 20,
        paddingVertical: 10,
    },
    modifyOrderButtonText: {
        color: 'blue',
        fontSize: 16,
        fontWeight: 'bold',
    },
    successContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    successText: {
        fontSize: 15,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: "center",
    },
    payNowButton: {
        backgroundColor: 'blue',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
    },
    payNowButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    cardButtonsContainer: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-evenly'
    }
});


export default OrderStatusScreen;
