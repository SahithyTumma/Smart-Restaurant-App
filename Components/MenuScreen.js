import React, { useEffect, useState, useLayoutEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator, ImageBackground, TextInput, TouchableWithoutFeedback } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useCart } from '../Contexts/CartContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import HamburgerMenu from './HamburgerMenu';
import { Rating, AirbnbRating } from 'react-native-ratings';
import Icon from 'react-native-vector-icons/AntDesign';
// import FontAwesome from 'react-native-vector-icons/FontAwesome';
import DishDetailsCard from './DishDetailsCard';
import * as Animatable from 'react-native-animatable'; // Import Animatable from the library

const MenuScreen = () => {
    const { cartItems, addToCart, increaseQuantity, decreaseQuantity, socket } = useCart();
    // const { orderId } = route.params;
    const navigation = useNavigation();
    const [expandedCuisines, setExpandedCuisines] = useState({});
    const [menuItems, setMenuItems] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const { params } = useRoute(); // Accessing orderId from route params
    const orderId = params?.orderId;
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredMenuItems, setFilteredMenuItems] = useState([]);
    const [cuisineNames, setCuisineNames] = useState([]);
    const [selectedCuisine, setSelectedCuisine] = useState(null);
    const flatListRef = useRef(null);
    const [selectedDish, setSelectedDish] = useState(null);
    const [isDishDetailsVisible, setIsDishDetailsVisible] = useState(false);

    const toggleCuisine = (cuisine) => {
        setExpandedCuisines((prevExpandedCuisines) => ({
            ...prevExpandedCuisines,
            [cuisine]: !prevExpandedCuisines[cuisine],
        }));
    };

    const handleCuisineSelection = (cuisine) => {
        // Find the index of the selected cuisine in the displayed menu items
        const index = Object.keys(filteredMenuItems).indexOf(cuisine);

        // Scroll to the selected cuisine using the FlatList's scrollToIndex method
        if (flatListRef.current && index !== -1) {
            flatListRef.current.scrollToIndex({ animated: true, index });
        }
        // toggleCuisine(cuisine);
        // Optionally, you can set the selected cuisine state for UI feedback
        setSelectedCuisine(cuisine);
    };


    useEffect(() => {
        const filteredItems = Object.entries(menuItems).reduce((acc, [cuisine, items]) => {
            const filteredItems = items.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
            if (filteredItems.length > 0) {
                acc[cuisine] = filteredItems;
            }
            return acc;
        }, {});
        setFilteredMenuItems(filteredItems);
    }, [searchQuery, menuItems]);

    useEffect(() => {
        setIsLoading(true);
        async function fetchData() {
            const auth = await AsyncStorage.getItem('authUser');
            console.log('wdsfghjuio\n');
            await axios.get(`http://${host}/api/v1/menuItems/`,
                {
                    headers: {
                        authorization: `Bearer ${auth}`,
                    },
                }
            )
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
                    const extractedCuisineNames = Object.keys(groupedMenuItems);
                    setCuisineNames(extractedCuisineNames);
                    // Initialize all cuisines as expanded
                    const initialExpandedCuisines = {};
                    extractedCuisineNames.forEach((cuisine) => {
                        initialExpandedCuisines[cuisine] = true;
                    });
                    setExpandedCuisines(initialExpandedCuisines);
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
        }
        fetchData();
    }, [orderId]);

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

    // const handleCuisineSelection = (cuisine) => {
    //     const index = cuisineNames.indexOf(cuisine);
    //     if (flatListRef.current && index !== -1) {
    //         flatListRef.current.scrollToIndex({ animated: true, index });
    //     }
    // };

    const handleDishClick = (dish) => {
        setSelectedDish(dish);
        setIsDishDetailsVisible(true);
    };

    const handleCloseDishDetails = () => {
        setIsDishDetailsVisible(false);
    };



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
            <View style={styles.addToCartButton}>
                <Text onPress={() => addToCart(item)} style={styles.addToCartButtonText}>ADD</Text>
            </View>
        );
    };
    const renderItem = ({ item }) => (
        <TouchableWithoutFeedback onPress={() => handleDishClick(item)}>
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
                    <View style={{ display: 'flex', flexDirection: 'row', marginTop: 5 }}>
                        <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                            {/* <FontAwesome name="fire" size={30} color="blue" /> */}
                            <Image
                                source={require('../R.png')}
                                style={styles.fireIcon}
                            />
                            <Text style={styles.menuItemPrice}>{item.spicinessLevel}</Text>
                        </View>
                        <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                            <Icon name="clockcircleo" size={20} color="black" />
                            <Text style={styles.menuItemPrice}>{item.preparationTime} min</Text>
                        </View>
                    </View>
                </View>
                <View style={styles.imageContainer}>
                    <Image source={{ uri: item.imageURL }} style={styles.menuItemImage} />
                    {renderCartItemActions(item)}
                </View>
            </View>
        </TouchableWithoutFeedback>
    );

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
                        <View style={styles.searchBarContainer}>
                            <TextInput
                                style={styles.searchBar}
                                placeholder="Search for dishes..."
                                placeholderTextColor="#999999"
                                onChangeText={text => setSearchQuery(text)}
                                value={searchQuery}
                            />
                        </View>

                        {isDishDetailsVisible && selectedDish && (
                            <Animatable.View
                                animation="slideInUp" // Specify the desired animation (slideInUp)
                                duration={200} // Animation duration in milliseconds
                                style={styles.dishDetailsContainer}
                            >
                                <DishDetailsCard
                                    dish={selectedDish}
                                    onClose={handleCloseDishDetails}
                                    onAddToCart={() => {
                                        addToCart(selectedDish);
                                        handleCloseDishDetails();
                                    }}
                                />
                            </Animatable.View>
                        )}

                        <FlatList
                            ref={flatListRef}
                            showsVerticalScrollIndicator={false}
                            data={Object.entries(filteredMenuItems)}
                            extraData={expandedCuisines}
                            renderItem={({ item }) => (
                                <View>
                                    <TouchableOpacity style={styles.cuisineHeader} onPress={() => toggleCuisine(item[0])}>
                                        <Text style={styles.cuisineTitle}>{item[0]}</Text>
                                        <Icon style={{ marginRight: 10 }} name={expandedCuisines[item[0]] ? 'caretdown' : 'caretup'} size={15} color="black" />
                                    </TouchableOpacity>
                                    {expandedCuisines[item[0]] && (
                                        <FlatList
                                            data={item[1]}                      // Dishes belonging to the current cuisine
                                            renderItem={renderItem}            // Render function for each dish
                                            keyExtractor={(item) => item._id}  // Extracts keys from the dishes data
                                            // style={{ marginTop: 15, marginBottom: 0 }}
                                            ItemSeparatorComponent={() => <View style={styles.separator} />}
                                        />
                                    )}
                                </View>
                                // <View>
                                //     <Text style={styles.cuisineTitle}>{item[0]}</Text>
                                //     <FlatList
                                //         data={item[1]}
                                //         renderItem={renderItem}
                                //         keyExtractor={(item) => item._id}
                                //     />
                                // </View>
                            )}
                            keyExtractor={(item) => item[0]}
                        />
                    </>
                )}
                <FlatList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    data={cuisineNames}
                    style={{ margin: 10 }}
                    renderItem={({ item, index }) => (
                        <TouchableOpacity
                            style={[
                                styles.bottomCuisineButton,
                                selectedCuisine === item && styles.bottomCuisineButtonSelected,
                            ]}
                            onPress={() => handleCuisineSelection(item)}
                        >
                            <Text style={styles.bottomCuisineText}>{item}</Text>
                        </TouchableOpacity>
                    )}
                    keyExtractor={(item) => item}
                />

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

        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    dishDetailsContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        zIndex: 999,
    },
    bottomCuisineButton: {
        height: 30,
        paddingHorizontal: 15,
        paddingVertical: 5,
        marginHorizontal: 10,
        backgroundColor: '#FF6347',
        borderRadius: 20,
        marginBottom: 10,
    },
    bottomCuisineButtonSelected: {
        backgroundColor: '#FF6347', // Change the background color for the selected cuisine
    },
    bottomCuisineText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    separator: {
        height: 1,
        width: '100%',
        backgroundColor: '#ccc', // Color of the separator line
    },
    cuisineHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 10,
        backgroundColor: '#F2ECEB',
        marginTop: 5,
        marginBottom: 5,
        elevation: 10,
        // borderBottomWidth: 1,
        // borderBottomColor: '#ccc',
    },
    cuisineHeaderText: {
        fontSize: 18,
        marginLeft: 10,
    },
    searchBarContainer: {
        // padding: 10,
        backgroundColor: '#fff',
        borderRadius: 10,
        margin: 10
    },
    searchBar: {
        height: 40,
        borderColor: '#FF6347',
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 10,
        color: 'black'
    },
    fireIcon: {
        width: 30, // Set the width of the fire icon image
        height: 25, // Set the height of the fire icon image
        marginRight: 5, // Add margin if needed
    },
    backgroundImage: {
        flex: 1,
        resizeMode: 'cover',
        justifyContent: 'center',
    },
    container: {
        flex: 1,
        // backgroundColor: '#fff',
        // padding: 10,
    },
    menuItem: {
        flexDirection: 'row',
        // marginBottom: 20,
        // alignItems: 'center',
        // borderBottomWidth: 1,
        // borderBottomColor: '#ccc',
        padding: 10,
        paddingBottom: 0,
        // paddingTop: 0
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
        // fontWeight: 'bold',
        fontSize: 15,
        marginTop: 10,
        marginRight: 20,
        color: '#000',
        position: 'relative',
        top: -5,
        marginLeft: 2
    },
    addToCartContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
    },
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
        // padding: 5,
        backgroundColor: '#FF6347',
        borderRadius: 5,
        width: "90%",
        position: 'absolute',
        bottom: -15,
    },
    quantityButton: {
        padding: 5,
        width: "30%",
        // height: 30,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: "20%",
        // padding: 5,
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
        // marginBottom: 10,
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
        width: "90%",
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
        // paddingBottom: 10,
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
        marginLeft: 10,
        // marginTop: 20,
        // marginBottom: 10,
        color: 'red'
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
        color: 'black'
    },
});

export default MenuScreen;
