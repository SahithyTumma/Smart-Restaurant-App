import React, { useState, useEffect, useLayoutEffect } from 'react';
import { View, StyleSheet, ImageBackground, TextInput, TouchableOpacity, Text, Alert } from 'react-native';
import { Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HamburgerMenu from './HamburgerMenu';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/Ionicons'; // Import the eye icon from a suitable icon library

const RegisterScreen = () => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [firstNameError, setFirstNameError] = useState('');
    const [lastNameError, setLastNameError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');
    const [showOTP, setShowOTP] = useState(false);
    const [otpError, setOTPError] = useState('');
    const [otp, setOTP] = useState('');
    const [showPassword, setShowPassword] = useState(true); // State variable to track password visibility
    const [showPassword1, setShowPassword1] = useState(true); // State variable to track password visibility

    const navigation = useNavigation();

    useLayoutEffect(() => {
        navigation.setOptions({
            headerBackTitleVisible: false,
            headerTitle: 'Smart Restaurant App',
            // headerRight: () => <HamburgerMenu />,
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

    const handleOtpVerification = () => {
        AsyncStorage.getItem('User').then(async (response) => {
            User = JSON.parse(response);
            let postdata = {
                email: User.email,
                enteredOTP: otp,
            };
            await axios.post(
                `http://${host}/api/v1/users/verify-otp`,
                postdata
            ).then((response) => {
                console.log(response);
                navigation.navigate('Login');
            }).catch((error) => {
                Alert.alert("Wrong OTP entered");
                console.log(error);
            });
        })
    };

    const handleResendOtp = () => {
        AsyncStorage.getItem('User').then(async (newUser) => {
            newUser = JSON.parse(newUser)
            await axios.post(
                `http://${host}/api/v1/users/signup`,
                newUser
            ).then((response) => {
                console.log(response);
                console.log(response.data);
                console.log('Otp sent');
            }).catch((error) => {
                Alert.alert("Can not send Otp");
                console.log(error);
            });
        })
    }

    const handleRegister = async () => {
        if (validateForm()) {
            const user = {
                firstName: firstName,
                lastName: lastName,
                email: email,
                password: password,
                role: 'customer'
            };
            console.log("post user" + user);
            await axios.post(
                `http://${host}/api/v1/users/signup`,
                user
            ).then(async (response) => {
                Toast.show({
                    text1: "Registration Successfull",
                    // buttonText: "Okay",
                    visibilityTime: 3000,
                    position: 'bottom',
                    type: 'success', // or 'error' for error messages
                    bottomOffset: 40,
                })
                console.log(response);
                console.log(response.data);
                await AsyncStorage.setItem("User", JSON.stringify(response.data));
                setShowOTP(true);
            }).catch((error) => {
                Alert.alert("Login Error Invalid email");
                console.log(error);
            });
        }
    };

    const validateForm = () => {
        let isValid = true;

        if (!firstName) {
            isValid = false;
            setFirstNameError('Please enter your first name');
        } else {
            setFirstNameError('');
        }

        if (!lastName) {
            isValid = false;
            setLastNameError('Please enter your last name');
        } else {
            setLastNameError('');
        }

        if (!email) {
            isValid = false;
            setEmailError('Please enter your email');
        } else {
            setEmailError('');
        }

        if (!password) {
            isValid = false;
            setPasswordError('Please enter your password');
        } else {
            setPasswordError('');
        }

        if (!confirmPassword) {
            isValid = false;
            setConfirmPasswordError('Please confirm your password');
        } else if (confirmPassword !== password) {
            isValid = false;
            setConfirmPasswordError('Passwords do not match');
        } else {
            setConfirmPasswordError('');
        }

        return isValid;
    };

    useEffect(() => {
        if (otp.length === 6) {
            handleOtpVerification();
        }
    }, [otp]);

    return (
        <ImageBackground
            source={require('../menuBackground.jpg')}
            style={styles.backgroundImage}
        >
            {!showOTP && <View style={styles.container}>
                <TextInput
                    style={[styles.input, firstNameError && styles.inputError]}
                    placeholder="First Name"
                    placeholderTextColor="#999999"
                    onChangeText={text => setFirstName(text)}
                    value={firstName}
                />
                {firstNameError ? <Text style={styles.errorText}>{firstNameError}</Text> : null}

                <TextInput
                    style={[styles.input, lastNameError && styles.inputError]}
                    placeholder="Last Name"
                    placeholderTextColor="#999999"
                    onChangeText={text => setLastName(text)}
                    value={lastName}
                />
                {lastNameError ? <Text style={styles.errorText}>{lastNameError}</Text> : null}

                <TextInput
                    style={[styles.input, emailError && styles.inputError]}
                    placeholder="Email"
                    placeholderTextColor="#999999"
                    onChangeText={text => setEmail(text)}
                    value={email}
                    keyboardType="email-address"
                />
                {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

                {/* <TextInput
                    style={[styles.input, passwordError && styles.inputError]}
                    placeholder="Password"
                    placeholderTextColor="#999999"
                    onChangeText={text => setPassword(text)}
                    value={password}
                    secureTextEntry
                /> */}
                <View style={{ position: 'relative', flexDirection: 'row', alignItems: 'center' }}>
                    <TextInput
                        style={[styles.input, passwordError && styles.inputError, { flex: 1 }]}
                        placeholder="Password"
                        placeholderTextColor="#999999"
                        onChangeText={text => setPassword(text)}
                        value={password}
                        secureTextEntry={showPassword}
                    />
                    <TouchableOpacity
                        onPress={() => setShowPassword(!showPassword)}
                        style={{ position: 'absolute', right: 15, top: 14 }}
                    >
                        <Icon
                            name={showPassword ? 'eye-off-outline' : 'eye-outline'} // Use appropriate icon names based on your icon library
                            size={25}
                            color="black"
                        />
                    </TouchableOpacity>
                </View>
                {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

                {/* <TextInput
                    style={[styles.input, confirmPasswordError && styles.inputError]}
                    placeholder="Confirm Password"
                    placeholderTextColor="#999999"
                    onChangeText={text => setConfirmPassword(text)}
                    value={confirmPassword}
                    secureTextEntry
                /> */}
                <View style={{ position: 'relative', flexDirection: 'row', alignItems: 'center' }}>
                    <TextInput
                        style={[styles.input, confirmPasswordError && styles.inputError, { flex: 1 }]}
                        placeholder="Confirm Password"
                        placeholderTextColor="#999999"
                        onChangeText={text => setConfirmPassword(text)}
                        value={confirmPassword}
                        secureTextEntry={showPassword1}
                    />
                    <TouchableOpacity
                        onPress={() => setShowPassword1(!showPassword1)}
                        style={{ position: 'absolute', right: 15, top: 14 }}
                    >
                        <Icon
                            name={showPassword1 ? 'eye-off-outline' : 'eye-outline'} // Use appropriate icon names based on your icon library
                            size={25}
                            color="black"
                        />
                    </TouchableOpacity>
                </View>
                {confirmPasswordError ? <Text style={styles.errorText}>{confirmPasswordError}</Text> : null}

                <Button mode="contained" onPress={handleRegister} style={styles.loginButton}>
                    Register
                </Button>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 5 }}><Text style={{ fontSize: 15, color: 'black' }}>Already have an account? </Text><Text style={{ color: 'red', fontSize: 20 }} onPress={() => { navigation.navigate('Login') }}>Login</Text></View>

            </View>}
            {showOTP && <View style={styles.container}>
                <TextInput
                    style={[styles.input, otpError && styles.inputError]}
                    placeholder="OTP"
                    onChangeText={text => setOTP(text)}
                    value={otp}
                    keyboardType="numeric"
                    placeholderTextColor="#999999"
                    // secureTextEntry
                    maxLength={6}
                />
                <Text style={{ color: 'black' }} onPress={handleResendOtp}>Resend Otp</Text>
            </View>}
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        resizeMode: 'cover',
        justifyContent: 'center',
    },
    container: {
        padding: 20,
    },
    input: {
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderRadius: 8,
        padding: 12,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'black',
        color: 'black'
    },
    loginButton: {
        marginTop: 10,
        backgroundColor: '#FF841C',
        color: 'white'
    },
    errorText: {
        color: 'red',
        fontSize: 14,
        marginBottom: 10,
    },
    changeEmailButton: {
        marginTop: 10,
        alignItems: 'flex-end',
    },
    changeEmailText: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: "bold"
    },
});

export default RegisterScreen;
