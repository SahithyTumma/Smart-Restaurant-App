import React, { useState, useEffect } from 'react';
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
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoadingComponent from './Components/LoadingComponent';
import PushNotification from "react-native-push-notification";

const Stack = createStackNavigator();

const App = () => {

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // createCannels();
    const checkAuthentication = async () => {
      const userLoggedIn = await AsyncStorage.getItem('autUser');
      setIsLoggedIn(!!userLoggedIn);
      setIsLoading(false);
    };

    checkAuthentication();
  }, []);

  const createCannels = () => {
    PushNotification.createChannel(
      {
        channelId: 'smart-restaurant',
        channelName: 'smart Restaurant'
      },
      (created) => console.log(`createChannel returned '${created}'`)
    )
  }

  if (isLoading) {
    // Show loading spinner or placeholder while authentication status is being checked
    return <LoadingComponent />;
  }

  return (
    <PaperProvider>
      <CartProvider>
        <NavigationContainer>
          <Stack.Navigator initialRouteName={isLoggedIn ? 'Menu' : 'Login'}>
            {/* {isLoggedIn ? (
              // If user is logged in, navigate to MenuScreen
              <Stack.Screen name="Menu" component={MenuScreen} />
            ) : (
              // If user is not logged in, navigate to LoginScreen
              <Stack.Screen name="Login" component={LoginScreen} />
            )} */}
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Menu" component={MenuScreen} options={{
              gestureEnabled: false, // Disable swiping back gesture
              headerLeft: null, // Hide the back button in the header
            }} />
            <Stack.Screen name="Cart" component={CartScreen} />
            <Stack.Screen name="Success" component={OrderPlacedScreen} options={{
              headerShown: false
            }} />
            <Stack.Screen name="Status" component={OrderStatus} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="Add" component={AddMenu} />
          </Stack.Navigator>
          <Toast />
        </NavigationContainer>
      </CartProvider>
    </PaperProvider>
  );
};

export default App;
