import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ImageBackground, TextInput, TouchableOpacity, Text, Alert } from 'react-native';
import { Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
        axios.post("http://10.196.11.3:8000/api/v1/users/signin", user, {
            headers: {
                "Content-Type": "application/json"
            }
        }).then(async (response) => {
            console.log(response.data);
            console.log("\n\ntoken", response.data.token)
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
            else {
                navigation.goBack();
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
            source={require('../restaurant2.jpg')} // Replace with your background image
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
                <Button mode="contained" onPress={handleLogin} style={styles.verifyButton}>
                    Log in
                </Button>
                {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
                <Text onPress={() => { navigation.navigate('Register') }}>Sign up</Text>
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
        // ...StyleSheet.absoluteFillObject,
    },
    input: {
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderRadius: 8,
        padding: 12,
        marginBottom: 20,
    },
    loginButton: {
        marginTop: 10,
        backgroundColor: '#FF6347', // Customize the color
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
