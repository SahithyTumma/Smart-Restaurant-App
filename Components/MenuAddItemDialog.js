import React, { useState } from 'react';
import {
    Text,
    View,
    TextInput,
    Button,
    Checkbox,
    StyleSheet,
    TouchableOpacity,
    Image,
} from 'react-native';
import Modal from 'react-native-modal';
import ImagePicker from 'react-native-image-picker';

const MenuAddItemDialog = ({ visible, onDismiss, onAddItem }) => {
    const [itemName, setItemName] = useState('');
    const [itemPrice, setItemPrice] = useState('');
    const [isVeg, setIsVeg] = useState(false);
    const [cuisine, setCuisine] = useState('');
    const [description, setDescription] = useState('');
    const [spicinessLevel, setSpicinessLevel] = useState(1);
    const [preparationTime, setPreparationTime] = useState('');
    const [calories, setCalories] = useState('');
    const [image, setImage] = useState(null);

    const pickImage = () => {
        ImagePicker.showImagePicker({}, (response) => {
            if (response.didCancel) {
                console.log('User cancelled image picker');
            } else if (response.error) {
                console.log('ImagePicker Error: ', response.error);
            } else {
                setImage(response.uri);
            }
        });
    };

    const addItem = () => {
        AsyncStorage.getItem("autUser").then(async (data) => {
            const User = JSON.parse(data);
            console.log(User);
            if (User.token) {
                console.log("\n\nllniurefnfj\n\n");
                await axios.post(
                    "http://10.196.11.3:8000/api/v1/menuItems",
                    {
                        user: User,
                        name: itemName,
                        price: itemPrice,
                        isVeg: isVeg,
                        cuisine: cuisine,
                        description: description,
                        spicinessLevel: spicinessLevel,
                        preparationTime: preparationTime,
                        calories: calories,
                    },
                    {
                        headers: {
                            authorization: `Bearer ${User.token}`,
                        },
                    }
                )
                    .then((res) => {
                        console.log("res", res.data);
                    })
                    .catch((err) => {
                        console.log("err", err);
                    });
            }
        });
        if (itemName && itemPrice && cuisine && preparationTime && calories) {
            console.log("mjidfk");
            onAddItem({
                name: itemName,
                price: parseFloat(itemPrice),
                isVeg,
                cuisine,
                description,
                spicinessLevel,
                preparationTime: parseInt(preparationTime),
                calories: parseInt(calories),
                // Add other item details here
            });
            setItemName('');
            setItemPrice('');
            setIsVeg(false);
            setCuisine('');
            setDescription('');
            setSpicinessLevel(1);
            setPreparationTime('');
            setCalories('');
            onDismiss();
        }
    };

    return (
        <Modal
            isVisible={visible}
            style={styles.modal}
            onBackdropPress={onDismiss}
            animationIn="slideInUp"
            animationOut="slideOutDown"
            backdropOpacity={0.5}
        >
            <View style={styles.container}>
                <TouchableOpacity style={styles.imageContainer} onPress={pickImage}>
                    {image ? (
                        <Image source={{ uri: image }} style={styles.image} />
                    ) : (
                        <Text>Select Image</Text>
                    )}
                </TouchableOpacity>
                <TextInput
                    style={styles.input}
                    placeholder="Item Name"
                    value={itemName}
                    onChangeText={(text) => setItemName(text)}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Item Price"
                    keyboardType="numeric"
                    value={itemPrice}
                    onChangeText={(text) => setItemPrice(text)}
                />
                <Checkbox
                    status={isVeg ? 'checked' : 'unchecked'}
                    onPress={() => setIsVeg(!isVeg)}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Cuisine"
                    value={cuisine}
                    onChangeText={(text) => setCuisine(text)}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Description"
                    value={description}
                    onChangeText={(text) => setDescription(text)}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Spiciness Level"
                    keyboardType="numeric"
                    value={spicinessLevel.toString()}
                    onChangeText={(text) => setSpicinessLevel(parseInt(text))}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Preparation Time (in minutes)"
                    keyboardType="numeric"
                    value={preparationTime}
                    onChangeText={(text) => setPreparationTime(text)}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Calories"
                    keyboardType="numeric"
                    value={calories}
                    onChangeText={(text) => setCalories(text)}
                />
                <Button title="Add Item" onPress={addItem} />
            </View>
        </Modal>
    );
};
const styles = StyleSheet.create({
    modal: {
        justifyContent: 'flex-end',
        margin: 0,
    },
    container: {
        backgroundColor: 'white',
        padding: 20,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 10,
        paddingLeft: 10,
    },
    imageContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    image: {
        width: 100,
        height: 100,
    },
});

export default MenuAddItemDialog;
