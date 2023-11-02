import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useCart } from '../Contexts/CartContext';

const OrderPlacedScreen = () => {
    const navigation = useNavigation();
    const { clearCart, createOrder } = useCart();

    const handleContinueShopping = () => {
        createOrder();
        clearCart();
        navigation.navigate('Status'); // Navigate back to the Menu screen or your desired destination
    };

    return (
        <View style={styles.container}>
            <Text style={styles.successText}>Order Placed Successfully!</Text>
            <TouchableOpacity onPress={handleContinueShopping} style={styles.continueButton}>
                <Text style={styles.continueButtonText}>Track Order</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
    },
    successText: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    continueButton: {
        backgroundColor: 'green',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
    },
    continueButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default OrderPlacedScreen;
