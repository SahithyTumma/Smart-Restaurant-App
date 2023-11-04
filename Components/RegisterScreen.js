import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ImageBackground, TextInput, TouchableOpacity, Text, Alert } from 'react-native';
import { Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

    const navigation = useNavigation();

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
            source={require('../restaurant2.jpg')}
            style={styles.backgroundImage}
        >
            {!showOTP && <View style={styles.container}>
                <TextInput
                    style={[styles.input, firstNameError && styles.inputError]}
                    placeholder="First Name"
                    onChangeText={text => setFirstName(text)}
                    value={firstName}
                />
                {firstNameError ? <Text style={styles.errorText}>{firstNameError}</Text> : null}

                <TextInput
                    style={[styles.input, lastNameError && styles.inputError]}
                    placeholder="Last Name"
                    onChangeText={text => setLastName(text)}
                    value={lastName}
                />
                {lastNameError ? <Text style={styles.errorText}>{lastNameError}</Text> : null}

                <TextInput
                    style={[styles.input, emailError && styles.inputError]}
                    placeholder="Email"
                    onChangeText={text => setEmail(text)}
                    value={email}
                    keyboardType="email-address"
                />
                {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

                <TextInput
                    style={[styles.input, passwordError && styles.inputError]}
                    placeholder="Password"
                    onChangeText={text => setPassword(text)}
                    value={password}
                    secureTextEntry
                />
                {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

                <TextInput
                    style={[styles.input, confirmPasswordError && styles.inputError]}
                    placeholder="Confirm Password"
                    onChangeText={text => setConfirmPassword(text)}
                    value={confirmPassword}
                    secureTextEntry
                />
                {confirmPasswordError ? <Text style={styles.errorText}>{confirmPasswordError}</Text> : null}

                <Button mode="contained" onPress={handleRegister} style={styles.verifyButton}>
                    Register
                </Button>
            </View>}
            {showOTP && <View style={styles.container}>
                <TextInput
                    style={[styles.input, otpError && styles.inputError]}
                    placeholder="OTP"
                    onChangeText={text => setOTP(text)}
                    value={otp}
                    keyboardType="numeric"
                    // secureTextEntry
                    maxLength={6}
                />
                <Text onPress={handleResendOtp}>Resend Otp</Text>
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
    },
    loginButton: {
        marginTop: 10,
        backgroundColor: '#FF6347',
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
