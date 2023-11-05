import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Octicons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Entypo from 'react-native-vector-icons/Entypo';
import Toast from 'react-native-toast-message';

const HamburgerMenu = () => {
    const navigation = useNavigation();
    const [isMenuOpen, setMenuOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const checkAuthUser = async () => {
            try {
                const authUser = await AsyncStorage.getItem('authUser');
                setIsLoggedIn(authUser !== null);
            } catch (error) {
                console.error('Error checking authUser:', error);
            }
        };

        checkAuthUser();
    }, []);

    useEffect(() => {
        const updateMenu = async () => {
            const authUser = await AsyncStorage.getItem('authUser');
            setIsLoggedIn(authUser !== null);
        };

        updateMenu();
    }, [isMenuOpen]); // Run the effect whenever the menu state changes

    const toggleMenu = () => {
        setMenuOpen(!isMenuOpen);
    };

    const handleLogout = async () => {
        try {
            Toast.show({
                text1: "Logged out Successfully",
                // buttonText: "Okay",
                visibilityTime: 3000,
                position: 'bottom',
                type: 'success', // or 'error' for error messages
                bottomOffset: 40,
            })
            navigation.navigate('Menu');
            await AsyncStorage.removeItem('authUser');
            await AsyncStorage.removeItem('autUser');
            await AsyncStorage.removeItem('role');
            await AsyncStorage.removeItem('_id');
            setIsLoggedIn(false);
        } catch (error) {
            console.error('Error removing authUser:', error);
        }
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.menuButton}>
                {isMenuOpen ? <Entypo name="cross" size={24} color="black" onPress={toggleMenu} /> : <Entypo name="menu" size={24} color="black" onPress={toggleMenu} />}
            </TouchableOpacity>

            {isMenuOpen && (
                <View style={styles.dropdown}>
                    <TouchableOpacity style={styles.option}>
                        <Text style={styles.optionText} onPress={() => { navigation.navigate('Menu'); setMenuOpen(false); }}>Menu</Text>
                    </TouchableOpacity>
                    {isLoggedIn ? <TouchableOpacity style={styles.option}>
                        <Text style={styles.optionText} onPress={() => { navigation.navigate('Status'); setMenuOpen(false); }}>Orders</Text>
                    </TouchableOpacity> : null}
                    <TouchableOpacity style={styles.option} onPress={() => {
                        if (isLoggedIn) {
                            handleLogout();
                        } else {
                            navigation.navigate('Login');
                        }
                        setMenuOpen(false);
                    }}>
                        <Text style={styles.optionText}>{isLoggedIn ? 'Logout' : 'Login'}</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 10,
    },
    menuButton: {
        marginRight: 10,
    },
    dropdown: {
        position: 'absolute',
        top: 40,
        right: 10,
        backgroundColor: 'white',
        borderRadius: 5,
        elevation: 3,
        padding: 10,
    },
    option: {
        padding: 10,
    },
    optionText: {
        fontSize: 16,
        color: 'black',
    },
});

export default HamburgerMenu;
