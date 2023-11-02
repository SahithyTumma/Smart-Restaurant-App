import React from 'react';
import { Card, Button } from 'react-native-paper';
import { Text } from 'react-native';

const MenuItemCard = ({ item, onEdit }) => (
    <Card>
        <Card.Cover source={{ uri: item.imageURL }} />
        <Card.Content>
            <Card.Title title={item.name} subtitle={`Price: ${item.price}`} />
            <Card.Content>
                <Text>{`Cuisine: ${item.cuisine}`}</Text>
                <Text>{`Description: ${item.description}`}</Text>
                <Text>{`Spiciness Level: ${item.spicinessLevel}`}</Text>
                <Text>{`Preparation Time: ${item.preparationTime} mins`}</Text>
                <Text>{`Calories: ${item.calories}`}</Text>
                <Text>{`Availability: ${item.availability ? 'Available' : 'Not Available'}`}</Text>
            </Card.Content>
        </Card.Content>
        <Card.Actions>
            <Button onPress={() => onEdit(item)}>Edit</Button>
        </Card.Actions>
    </Card>
);

export default MenuItemCard;
