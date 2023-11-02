import React, { useEffect, useState, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useCart } from '../Contexts/CartContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import HamburgerMenu from './HamburgerMenu';
import { Rating, AirbnbRating } from 'react-native-ratings';
import Icon from 'react-native-vector-icons/AntDesign';

const MenuScreen = () => {
    const { cartItems, addToCart, increaseQuantity, decreaseQuantity } = useCart();
    // const { orderId } = route.params;
    const navigation = useNavigation();
    const [menuItems, setMenuItems] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const { params } = useRoute(); // Accessing orderId from route params
    const orderId = params?.orderId;

    useEffect(() => {
        setIsLoading(true);
        axios.get("http://10.196.11.3:8000/api/v1/menuItems/")
            .then((response) => {
                // Filter out unavailable items and group by cuisine
                const filteredMenuItems = response.data.filter(item => item.availability);
                const groupedMenuItems = {};

                filteredMenuItems.forEach(item => {
                    if (!groupedMenuItems[item.cuisine]) {
                        groupedMenuItems[item.cuisine] = [];
                    }
                    groupedMenuItems[item.cuisine].push(item);
                });

                setMenuItems(groupedMenuItems);
                console.log("jedhueifbnekfenffffv----------------");
                if (orderId) {
                    console.log("hurat");
                    const orderItems = orderId.menuItems;
                    orderItems.forEach((orderItem) => {
                        const menuItem = response.data.find((menuItem) => menuItem._id === orderItem.menuName._id);
                        console.log("menu", menuItem);
                        if (menuItem) {
                            addToCart(menuItem);
                        }
                    });
                    setIsLoading(false);
                }
                else {
                    setIsLoading(false);
                }
            })
            .catch((err) => {
                console.log(err);
                setIsLoading(false);
            });
    }, [orderId]);

    // Function to add items from the order to cart


    // useEffect(() => {
    //     if (orderId) {
    //         // Fetch order details by orderId and add items to cart
    //         axios.get(`http://10.196.11.3:8000/api/v1/orders/${orderId}`)
    //             .then((response) => {
    //                 const orderItems = response.data.menuItems;
    //                 addItemsFromOrderToCart(orderItems);
    //             })
    //             .catch((err) => {
    //                 console.log(err);
    //             });
    //     }
    // }, [orderId]);

    useLayoutEffect(() => {
        navigation.setOptions({
            headerBackTitleVisible: false,
            headerRight: () => <HamburgerMenu />
            // :
            // (
            //     <TouchableOpacity onPress={() => navigation.navigate('Menu')} style={styles.modifyOrderButton}>
            //         <Text style={styles.modifyOrderButtonText}>Logout</Text>
            //     </TouchableOpacity>
            // )
            // ),
        });
    }, [navigation]);

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
                <Text onPress={() => addToCart(item)} style={styles.addToCartButtonText}>ADD</Text>
            </TouchableOpacity>
        );
    };
    const renderItem = ({ item }) => (
        <View style={styles.menuItem}>
            <View style={styles.menuItemDetails}>
                <Text style={styles.menuItemName}>{item.name}</Text>
                <Text style={styles.menuItemPrice}>₹{item.price}</Text>
                <View style={styles.container1}>
                    <View style={styles.ratingContainer}>
                        <AirbnbRating
                            count={5}
                            reviews={['Terrible', 'Bad', 'OK', 'Good', 'Excellent']}
                            defaultRating={item.averageRating}
                            size={15}
                            showRating={false}
                            isDisabled
                        />
                    </View>
                    <View style={styles.subscriptContainer}>
                        <Text style={styles.ratingNumber}>({item.numberOfRatings})</Text>
                    </View>
                </View>
                {/* <Text style={styles.menuItemPrice}>{item.averageRating}</Text> */}
                {/* <Text style={styles.menuItemPrice}>{item.numberOfRatings}</Text> */}
                <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                    <View style={{ display: 'flex', flexDirection: 'row' }}>
                        <Icon name="clockcircleo" size={30} color="blue" />
                        <Text style={styles.menuItemPrice}>{item.spicinessLevel}</Text>
                    </View>
                    <View style={{ display: 'flex', flexDirection: 'row' }}>
                        <Icon name="clockcircleo" size={30} color="blue" />
                        <Text style={styles.menuItemPrice}>{item.preparationTime} min</Text>
                    </View>
                </View>
            </View>
            <View style={styles.imageContainer}>
                <Image source={{ uri: item.imageURL }} style={styles.menuItemImage} />
                {renderCartItemActions(item)}
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            {isLoading ? (
                <ActivityIndicator size="large" color="#009688" />
            ) : (
                <FlatList
                    showsVerticalScrollIndicator={false}
                    data={Object.entries(menuItems)}
                    renderItem={({ item }) => (
                        <View>
                            <Text style={styles.cuisineTitle}>{item[0]}</Text>
                            <FlatList
                                data={item[1]}
                                renderItem={renderItem}
                                keyExtractor={(item) => item._id}
                            />
                        </View>
                    )}
                    keyExtractor={(item) => item[0]}
                />
            )}

            {/* <AirbnbRating /> */}

            {/* <AirbnbRating
                count={5}
                showRating={false}
                // reviews={["Terrible", "Bad", "Meh", "OK", "Good", "Hmm...", "Very Good", "Wow", "Amazing", "Unbelievable", "Jesus"]}
                defaultRating={2}
                size={20}
                isDisabled={true}
            /> */}

            {/* <Rating
                showRating
                onFinishRating={this.ratingCompleted}
                style={{ paddingVertical: 10 }}
            />

            <Rating
                type='heart'
                // ratingCount={3}
                defaultRating={2}
                imageSize={60}
                fractions={0.25}
                // showRating
                onFinishRating={this.ratingCompleted}
            />

            <Rating
                type='custom'
                //   ratingImage={WATER_IMAGE}
                ratingColor='#3498db'
                ratingBackgroundColor='#c8c7c8'
                ratingCount={10}
                imageSize={30}
                onFinishRating={this.ratingCompleted}
                style={{ paddingVertical: 10 }}
            /> */}
            {cartItems.length > 0 && (
                <View style={styles.cartItemQ}>
                    <Text style={styles.title}>{cartItems.length} item added</Text>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('Cart', { update: orderId ? orderId : false })}
                        style={styles.viewCartButton}
                    >
                        <Text style={styles.viewCartButtonText}>Next</Text>
                    </TouchableOpacity>
                </View>
            )
            }
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 30,
    },
    menuItem: {
        flexDirection: 'row',
        marginBottom: 20,
        // alignItems: 'center',
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
        fontWeight: 'bold',
        marginTop: 15,
    },
    menuItemType: {
        color: '#666',
    },
    menuItemPrice: {
        fontWeight: 'bold',
        fontSize: 15,
        marginTop: 10,
        color: '#000',
    },
    addToCartContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
    },
    // addToCartButton: {
    //     backgroundColor: '#FF6347',
    //     padding: 5,
    //     borderRadius: 5,
    //     width: "25%"
    // },
    addToCartButtonText: {
        color: '#FF6347',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    quantityContainer: {
        display: "flex",
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        padding: 5,
        backgroundColor: '#FF6347',
        borderRadius: 5,
        width: "80%",
        position: 'absolute',
        bottom: -15,
    },
    quantityButton: {
        // backgroundColor: '#DDDDDD',
        // width: 30,
        // height: 30,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 5,
    },
    quantityButtonText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFF',
    },
    cartItemQuantity: {
        // marginLeft: 10,
        // width: 30,
        // height: 30,
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFF',
        textAlign: "center",
    },
    viewCartButton: {
        backgroundColor: '#009688',
        padding: 10,
        width: '45%',
        borderRadius: 5,
        // marginTop: 20,
    },
    viewCartButtonText: {
        color: '#fff',
        textAlign: 'center',
        fontSize: 18,
        fontWeight: 'bold',
    },
    imageContainer: {
        flexDirection: 'column',
        alignItems: 'center',
        marginBottom: 30,
        position: 'relative', // Enable absolute positioning for its children
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
    cartItemQ: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: 'grey',
        padding: 20,
        paddingBottom: 0,
    },
    title: {
        color: '#000',
        fontWeight: 'bold',
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
    cuisineTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 10,
    },
    container1: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratingContainer: {
        // marginRight: 5,
    },
    subscriptContainer: {
        bottom: -5,
    },
    ratingNumber: {
        fontSize: 12,
    },
});

export default MenuScreen;
