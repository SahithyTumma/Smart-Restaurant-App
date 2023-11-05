import React, { useState, useEffect, useLayoutEffect } from 'react';
import { View, StyleSheet, ImageBackground, TextInput, TouchableOpacity, Text, Alert } from 'react-native';
import { Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HamburgerMenu from './HamburgerMenu';
import Toast from 'react-native-toast-message';

const LoginScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOTP] = useState('');
    const [emailError, setEmailError] = useState('');
    const [otpError, setOTPError] = useState('');

    const correctOTP = '123456'; // Set the correct OTP here
    const adminOTP = '234567';
    const navigation = useNavigation();

    // async function handleLogin() {
    const handleLogin = () => {
        const user = {
            email: email,
            password: password
        }
        axios.post(`http://${host}/api/v1/users/signin`, user, {
            headers: {
                "Content-Type": "application/json"
            }
        }).then(async (response) => {
            console.log(response.data);
            console.log("\n\ntoken", response.data.token)
            // toast.success("logged in successfully", {
            //     position: "bottom-right",
            //     autoClose: 4000,
            //     hideProgressBar: false,
            //     closeOnClick: true,
            //     progress: undefined,
            //     theme: "light",
            // });
            Toast.show({
                text1: "Login Successfull",
                // buttonText: "Okay",
                visibilityTime: 3000,
                position: 'bottom',
                type: 'success', // or 'error' for error messages
                bottomOffset: 40,
            })
            // const data = response.data;
            // async (response) => {
            //     console.log(response.data.data.access_token);
            //     await AsyncStorage.setItem("token", response.data.data.access_token);
            await AsyncStorage.setItem("authUser", response.data.token);
            await AsyncStorage.setItem("autUser", JSON.stringify(response.data));
            await AsyncStorage.setItem("role", response.data.role);
            await AsyncStorage.setItem("_id", response.data._id);
            console.log("token", await AsyncStorage.getItem("authUser"))
            console.log("token", await AsyncStorage.getItem("role"))
            if (response.data.role === 'admin') {
                navigation.navigate('Add');
            }
            if (response.data.role === 'waiter' || response.data.role === 'chef') {
                navigation.navigate('Orders');
            }
            else {
                navigation.goBack();
                // navigation.navigate('Menu')
            }
            // navigation.replace('Menu');
        }).catch((error) => {
            Alert.alert("Login Error Invalid email");
            console.log(error);
        })
    }

    // async function handleLogin() {
    //     const user = {
    //         email: email,
    //         password: password,
    //     };
    //     try {
    //         let { data } = await axios.post(
    //             "http://10.196.11.3:8000/api/v1/users/signin",
    //             user
    //         );
    //         console.log("Logged in succesfully");
    //         console.log("data", data);
    //         if (data) {
    //             localStorage.setItem("SRA_userData", JSON.stringify(data));
    //         }
    //         if (data.role === "customer") {
    //             navigate("/menu");
    //         }
    //         // else {
    //         //     navigate("/orders");
    //         // }
    //     } catch (err) {
    //         console.log(err.response.data.message);
    //     }
    // }

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

    const handleVerify = () => {
        if (isValidEmail(email)) {
            setShowOTP(true);
            setEmailError('');
        } else {
            setEmailError('Please enter a valid email address');
        }
    };

    const handleOTPEnter = () => {
        if (otp === adminOTP) {
            setOTPError('');
            navigation.navigate('Add');
        }
        if (otp === correctOTP) {
            setOTPError('');
            navigation.navigate('Success');
        } else {
            setOTPError('Incorrect OTP. Please try again.');
        }
    };

    const isValidEmail = email => {
        const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
        return emailPattern.test(email);
    };
    const handleChangeEmail = () => {
        setShowOTP(false);
        setEmail('');
        setOTP('');
        setOTPError('');
    };

    useEffect(() => {
        if (otp.length === 6) {
            handleOTPEnter();
        }
    }, [otp]);

    return (
        <ImageBackground
            source={require('../menuBackground.jpg')} // Replace with your background image
            style={styles.backgroundImage}
        >
            <View style={styles.container}>
                <TextInput
                    style={[styles.input, emailError && styles.inputError]}
                    placeholder="Email"
                    onChangeText={text => setEmail(text)}
                    value={email}
                    // editable={!showOTP}
                    keyboardType="email-address"
                />
                <TextInput
                    style={[styles.input, emailError && styles.inputError]}
                    placeholder="Password"
                    onChangeText={text => setPassword(text)}
                    value={password}
                    // editable={!showOTP}
                    secureTextEntry
                // keyboardType="text"
                />
                <Button mode="contained" onPress={handleLogin} style={styles.loginButton}>
                    Log in
                </Button>
                {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 5 }}><Text style={{ fontSize: 15 }}>Don't have an account? </Text><Text style={{ color: 'red', fontSize: 20 }} onPress={() => { navigation.navigate('Register') }}>Sign up</Text></View>

                {/* {showOTP ? (
                    <TextInput
                        style={[styles.input, otpError && styles.inputError]}
                        placeholder="OTP"
                        onChangeText={text => setOTP(text)}
                        value={otp}
                        keyboardType="numeric"
                        // secureTextEntry
                        maxLength={6}
                    />
                ) : null} */}
                {/* {otpError ? <Text style={styles.errorText}>{otpError}</Text> : null} */}
                {/* {!showOTP && (
                    <Button mode="contained" onPress={handleVerify} style={styles.verifyButton}>
                        Verify
                    </Button>
                )}
                {showOTP && (
                    <TouchableOpacity style={styles.changeEmailButton}>
                        <Text onPress={handleChangeEmail} style={styles.changeEmailText}>Change Email?</Text>
                    </TouchableOpacity>
                )} */}
            </View>
        </ImageBackground>
    );
};

// Rest of the styles remain the same
const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        resizeMode: 'cover',
        justifyContent: 'center',
    },
    container: {
        padding: 20,
        // borderWidth: 1,
        // borderColor: 'black'
        // ...StyleSheet.absoluteFillObject,
    },
    input: {
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderRadius: 8,
        padding: 12,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'black'
    },
    loginButton: {
        marginTop: 10,
        backgroundColor: '#FF841C', // Customize the color
    },
    errorText: {
        color: 'red', // Customize the color
        fontSize: 14,
        marginBottom: 10,
    },
    changeEmailButton: {
        marginTop: 10,
        alignItems: 'flex-end',
    },
    changeEmailText: {
        color: '#ffffff', // Customize the color
        fontSize: 14,
        fontWeight: "bold"
    },
});

export default LoginScreen;
