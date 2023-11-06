import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Entypo from 'react-native-vector-icons/Entypo';

const DishDetailsCard = ({ dish, onClose, onAddToCart }) => {
    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                {/* <Text style={styles.closeButtonText}>Close</Text> */}
                <Entypo name="cross" size={24} color="black" />
            </TouchableOpacity>
            <Text style={styles.dishName}>{dish.name}</Text>
            <Text style={styles.dishDescription}>{dish.description}</Text>
            <Text style={styles.dishPrice}>₹{dish.price}</Text>
            <TouchableOpacity onPress={onAddToCart} style={styles.addToCartButton}>
                <Text style={styles.addToCartButtonText}>Add to Cart</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        padding: 20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    dishName: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    dishDescription: {
        fontSize: 16,
        marginBottom: 10,
    },
    dishPrice: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    addToCartButton: {
        backgroundColor: '#FF6347',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
    },
    addToCartButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    closeButton: {
        marginTop: 10,
        alignItems: 'center',
    },
    closeButtonText: {
        color: '#FF6347',
        fontSize: 16,
    },
});

export default DishDetailsCard;
