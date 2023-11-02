import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, IconButton, Provider, Appbar } from 'react-native-paper';
import MenuAddItemDialog from './MenuAddItemDialog';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    card: {
        margin: 16,
        padding: 16,
        borderRadius: 10,
        backgroundColor: 'white',
        elevation: 4,
    },
    itemName: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    itemDetails: {
        fontSize: 14,
        marginBottom: 4,
        color: '#333333',
    },
});

const AddMenu = () => {
    const [isDialogVisible, setDialogVisible] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [menuItems, setMenuItems] = useState([]);

    const openDialog = () => {
        setDialogVisible(true);
    };

    const closeDialog = () => {
        setDialogVisible(false);
        setEditItem(null);
    };

    const handleAddItem = (itemDetails) => {
        if (editItem) {
            // Editing existing item
            const updatedItems = menuItems.map((item) =>
                item.id === editItem.id ? { ...item, ...itemDetails } : item
            );
            setMenuItems(updatedItems);
        } else {
            // Adding new item
            setMenuItems([...menuItems, { ...itemDetails, id: Date.now().toString() }]);
        }
        closeDialog();
    };

    const handleEditItem = (item) => {
        setEditItem(item);
        openDialog();
    };

    const renderMenuItem = ({ item }) => (
        <TouchableOpacity onPress={() => handleEditItem(item)}>
            <Card style={styles.card}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemDetails}>
                    <Text style={{ fontWeight: 'bold' }}>Price:</Text> ${item.price}
                </Text>
                <Text style={styles.itemDetails}>
                    <Text style={{ fontWeight: 'bold' }}>Veg:</Text> {item.isVeg ? 'Yes' : 'No'}
                </Text>
                <Text style={styles.itemDetails}>
                    <Text style={{ fontWeight: 'bold' }}>Cuisine:</Text> {item.cuisine}
                </Text>
                <Text style={styles.itemDetails}>
                    <Text style={{ fontWeight: 'bold' }}>Description:</Text> {item.description}
                </Text>
                <Text style={styles.itemDetails}>
                    <Text style={{ fontWeight: 'bold' }}>Spiciness Level:</Text> {item.spicinessLevel}
                </Text>
                <Text style={styles.itemDetails}>
                    <Text style={{ fontWeight: 'bold' }}>Preparation Time:</Text> {item.preparationTime} mins
                </Text>
                <Text style={styles.itemDetails}>
                    <Text style={{ fontWeight: 'bold' }}>Calories:</Text> {item.calories}
                </Text>
            </Card>
        </TouchableOpacity>
    );

    return (
        <Provider>
            <View style={styles.container}>
                <Appbar.Header>
                    <Appbar.Content title="Menu Items" />
                    <IconButton icon="plus" color="white" onPress={openDialog} />
                </Appbar.Header>
                <FlatList
                    data={menuItems.sort((a, b) => a.cuisine.localeCompare(b.cuisine))}
                    renderItem={renderMenuItem}
                    keyExtractor={(item) => item.id}
                />
                {/* Replace 'MenuAddItemDialog' with your actual dialog component */}
                <MenuAddItemDialog
                    visible={isDialogVisible}
                    onDismiss={closeDialog}
                    onAddItem={handleAddItem}
                    editItem={editItem}
                />
            </View>
        </Provider>
    );
};

export default AddMenu;
