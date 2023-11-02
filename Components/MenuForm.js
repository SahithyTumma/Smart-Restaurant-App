import React, { useState } from 'react';
import { Modal, TextInput, Button, Checkbox, Slider } from 'react-native-paper';
import { View, StyleSheet, Text } from 'react-native';

const MenuForm = ({ visible, onClose, onSubmit, item }) => {
    const [itemName, setItemName] = useState(item ? item.name : '');
    const [itemPrice, setItemPrice] = useState(item ? item.price.toString() : '');
    const [isVeg, setIsVeg] = useState(item ? item.isVeg : false);
    const [itemCuisine, setItemCuisine] = useState(item ? item.cuisine : '');
    const [itemDescription, setItemDescription] = useState(item ? item.description : '');
    const [spicinessLevel, setSpicinessLevel] = useState(item ? item.spicinessLevel : 0);
    const [preparationTime, setPreparationTime] = useState(item ? item.preparationTime.toString() : '');
    const [calories, setCalories] = useState(item ? item.calories.toString() : '');

    const handleFormSubmit = () => {
        const formData = {
            name: itemName,
            price: parseFloat(itemPrice),
            isVeg: isVeg,
            cuisine: itemCuisine,
            description: itemDescription,
            spicinessLevel: spicinessLevel,
            preparationTime: parseInt(preparationTime),
            calories: parseInt(calories),
        };

        onSubmit(formData);
    };

    return (
        <Modal visible={visible} onDismiss={onClose}>
            <View style={styles.formContainer}>
                <TextInput label="Name" value={itemName} onChangeText={setItemName} style={styles.input} />
                <TextInput label="Price" value={itemPrice} onChangeText={setItemPrice} keyboardType="numeric" style={styles.input} />
                <View style={styles.checkboxContainer}>
                    <Checkbox.Item label="Is Vegetarian" status={isVeg ? 'checked' : 'unchecked'} onPress={() => setIsVeg(!isVeg)} />
                </View>
                <TextInput label="Cuisine" value={itemCuisine} onChangeText={setItemCuisine} style={styles.input} />
                <TextInput label="Description" value={itemDescription} onChangeText={setItemDescription} style={styles.input} />
                <View style={styles.sliderContainer}>
                    <Text>Spiciness Level: {spicinessLevel}</Text>
                    <Slider
                        value={spicinessLevel}
                        onValueChange={value => setSpicinessLevel(value)}
                        minimumValue={0}
                        maximumValue={5}
                        step={1}
                        style={styles.slider}
                    />
                </View>
                <TextInput label="Preparation Time (mins)" value={preparationTime} onChangeText={setPreparationTime} keyboardType="numeric" style={styles.input} />
                <TextInput label="Calories" value={calories} onChangeText={setCalories} keyboardType="numeric" style={styles.input} />
                <Button mode="contained" onPress={handleFormSubmit} style={styles.button}>
                    Submit
                </Button>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    formContainer: {
        padding: 16,
    },
    input: {
        marginBottom: 8,
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    sliderContainer: {
        marginBottom: 16,
    },
    slider: {
        width: '100%',
    },
    button: {
        marginTop: 16,
    },
});

export default MenuForm;
