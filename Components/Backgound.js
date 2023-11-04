import React from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';

const BackgroundContainer = ({ children }) => {
    return (
        <ImageBackground
            source={require('../menuBackground.jpeg')} // Replace with the actual path to your image file
            style={styles.backgroundImage}
        >
            <View style={styles.container}>
                {children}
            </View>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        resizeMode: 'cover', // or 'stretch' or 'contain'
    },
    container: {
        flex: 1,
    },
});

export default BackgroundContainer;
