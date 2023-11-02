import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useCart } from '../Contexts/CartContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CartScreen = () => {
    // const { cartItems } = route.params;
    const navigation = useNavigation();
    const { cartItems, addToCart, increaseQuantity, decreaseQuantity, createOrder, clearCart, calculateSubTotal, calculateGST, calculateGrandTotal } = useCart();
    const { params } = useRoute(); // Accessing orderId from route params
    const update = params?.update;
    console.log("update", update);
    const renderCartItemActions = item => {
        const cartItem = cartItems.find(cartItem => cartItem._id === item._id);

        if (cartItem) {
            return (
                <View style={styles.quantityContainer}>
                    <TouchableOpacity onPress={() => decreaseQuantity(item._id)} style={styles.quantityButton}>
                        <Text style={styles.quantityButtonText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.cartItemQuantity}>{cartItem.quantity}</Text>
                    <TouchableOpacity onPress={() => increaseQuantity(item._id)} style={styles.quantityButton}>
                        <Text style={styles.quantityButtonText}>+</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        return (
            <TouchableOpacity style={styles.addToCartButton}>
                <Text onPress={() => addToCart(item)} style={styles.addToCartButtonText}>Add</Text>
            </TouchableOpacity>
        );
    };

    const handlePlaceOrder = () => {
        AsyncStorage.getItem("authUser").then((data) => {
            console.log("data", data);
            if (data) {
                createOrder(update);
                clearCart();
                navigation.navigate('Status'); // Navigate to the payment page
            } else {
                navigation.navigate('Login'); // Navigate to the login page
            }
        });
    };
    return (
        <View style={styles.container}>
            <Text style={styles.title}>ITEM(S) ADDED</Text>
            <FlatList
                data={cartItems}
                renderItem={({ item }) => (
                    // <View style={styles.cartItem} key={item.id}>
                    //     <View style={styles.cartItemImageContainer}>
                    //         <Image source={item.image} style={styles.cartItemImage} />
                    //     </View>
                    //     <View style={styles.cartItemDetails}>
                    //         <Text style={styles.cartItemName}>{item.name}</Text>
                    //         <Text style={styles.cartItemPrice}>₹{item.price}</Text>
                    //         {/* <Text style={styles.cartItemQuantity}>Quantity: {item.quantity}</Text> */}
                    //     </View>
                    //     <View>
                    //         {renderCartItemActions(item)}
                    //         <Text style={styles.cartItemTotal}>₹{calculateItemTotal(item)}</Text>
                    //     </View>
                    // </View>
                    <View style={styles.menuItem}>
                        <View style={styles.menuItemDetails}>
                            <Text style={styles.menuItemName}>{item.name}</Text>
                            <Text style={styles.menuItemPrice}>₹{item.price}</Text>
                        </View>
                        <View style={styles.imageContainer}>
                            {renderCartItemActions(item)}
                        </View>
                    </View>
                )}
                keyExtractor={item => item._id}
            />
            <View style={styles.billContainer}>
                <Text style={styles.title}>BILL SUMMARY</Text>
                <View style={styles.billItem}>
                    <Text style={styles.billText}>Sub-Total:</Text>
                    <Text style={styles.billValue}>{calculateSubTotal().toFixed(2)}</Text>
                </View>
                <View style={styles.billItem}>
                    <Text style={styles.billText}>GST (18%):</Text>
                    <Text style={styles.billValue}>{calculateGST(calculateSubTotal()).toFixed(2)}</Text>
                </View>
                <View style={styles.billItem}>
                    <Text style={styles.billText}>Grand Total:</Text>
                    <Text style={styles.billValue}>{calculateGrandTotal(calculateSubTotal()).toFixed(2)}</Text>
                </View>
            </View>
            <TouchableOpacity onPress={handlePlaceOrder} style={styles.placeOrderButton}>
                <View>
                    <Text style={styles.total}>₹{calculateGrandTotal(calculateSubTotal()).toFixed(2)}</Text>
                    <Text style={styles.total1}>TOTAL</Text>
                </View>
                <Text style={styles.placeOrderButtonText}>
                    Place Order
                </Text>
            </TouchableOpacity>
        </View>
        // <TouchableOpacity onPress={handlePlaceOrder} style={styles.placeOrderButton}>
        //     <Text style={styles.placeOrderButtonText}>Place Order</Text>
        // </TouchableOpacity>
        // </View >
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 20,
    },
    title: {
        textAlign: 'center',
        fontSize: 15,
        // fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
    },
    cartItem: {
        flexDirection: 'row',
        marginBottom: 20,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        paddingBottom: 10,
    },
    cartItemImageContainer: {
        marginRight: 10,
    },
    cartItemImage: {
        width: 80,
        height: 80,
        borderRadius: 5,
    },
    cartItemDetails: {
        flex: 1,
    },
    cartItemName: {
        color: '#000',
        fontSize: 18,
        fontWeight: 'bold',
    },
    cartItemPrice: {
        fontWeight: 'bold',
        color: '#000',
    },
    cartItemQuantity: {
        color: '#888',
    },
    placeOrderButton: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'green', // Button background color
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        alignSelf: 'center', // Align the button horizontally in the center
        marginTop: 20, // Add some margin from the items above
    },
    placeOrderButtonText: {
        color: 'white', // Button text color
        fontSize: 16,
        fontWeight: 'bold',
    },
    quantityContainer: {
        display: "flex",
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        // padding: 5,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#FF6347',
        borderRadius: 5,
        // width: "150px",
    },
    quantityButton: {
        // backgroundColor: '#DDDDDD',
        width: 25,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 5,
    },
    quantityButtonText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FF6347',
    },
    cartItemQuantity: {
        // marginLeft: 10,
        width: 30,
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FF6347',
        textAlign: "center",
    },
    billContainer: {
        marginTop: 20,
        borderTopWidth: 1,
        borderTopColor: '#ccc',
        paddingTop: 10,
    },
    billItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    billText: {
        fontSize: 16,
        color: '#000',
    },
    billValue: {
        fontSize: 16,
        color: '#333',
        fontWeight: 'bold',
    },
    cartItemTotal: {
        color: '#000',
        textAlign: 'right',
        fontWeight: 'bold',
    },
    total: {
        color: '#fff',
        marginRight: 30,
        fontWeight: '500',
    },
    total1: {
        fontWeight: '500',
        color: '#fff',
        // marginRight: 15,
    },
    addToCartButton: {
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#FF6347',
        padding: 5,
        borderRadius: 5,
        width: "80%",
        position: 'absolute',
        bottom: -15,
    },
    addToCartButtonText: {
        color: '#FF6347',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    menuItem: {
        flexDirection: 'row',
        marginBottom: 20,
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        paddingBottom: 10,
    },
    menuItemImage: {
        width: 120,
        height: 120,
        borderRadius: 15,
    },
    menuItemDetails: {
        flex: 1,
        marginLeft: 10,
    },
    menuItemName: {
        color: "#000",
        fontSize: 20,
        // fontWeight: 'bold',
        // marginTop: 15,
    },
    menuItemType: {
        color: '#666',
    },
    menuItemPrice: {
        // fontWeight: 'bold',
        fontSize: 15,
        // marginTop: 10,
        color: '#000',
    },
});

export default CartScreen;
