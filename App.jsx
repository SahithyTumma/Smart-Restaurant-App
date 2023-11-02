import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './Components/LoginScreen';
import RegisterScreen from './Components/RegisterScreen';
import MenuScreen from './Components/MenuScreen'
import CartScreen from './Components/CartScreen';
import OrderPlacedScreen from './Components/OrderPlaced';
import { CartProvider } from './Contexts/CartContext';
import OrderStatus from './Components/OrderStatus';
import AddMenu from './Components/AddMenu';
import { Provider as PaperProvider } from 'react-native-paper';

const Stack = createStackNavigator();

const App = () => {
  return (
    <PaperProvider>
    <CartProvider>
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Menu">
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Menu" component={MenuScreen} />
        <Stack.Screen name="Cart" component={CartScreen} />
        <Stack.Screen name="Success" component={OrderPlacedScreen} options={{ headerShown: false }}/>
        <Stack.Screen name="Status" component={OrderStatus}/>
        <Stack.Screen name="Add" component={AddMenu}/>
      </Stack.Navigator> 
    </NavigationContainer>
    </CartProvider>
    </PaperProvider>
  );
};

export default App;
