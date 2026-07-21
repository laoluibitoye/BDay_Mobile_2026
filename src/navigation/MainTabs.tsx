import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { MainTabParamList } from './types';
import { HomeScreen } from '../screens/home/HomeScreen';
import { WatchListenScreen } from '../screens/watchlisten/WatchListenScreen';
import { GamesScreen } from '../screens/games/GamesScreen';
import { LatestScreen } from '../screens/latest/LatestScreen';
import { ForYouScreen } from '../screens/foryou/ForYouScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

// The visible floating pill bar is `GlobalTabBar`, rendered once at the root (RootNavigator) so
// it stays on screen across pushed stack screens too — this navigator's own tab bar is hidden
// (`tabBar={() => null}`); it exists purely to hold the five tab screens' state.
export function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={() => null}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Home' }} />
      <Tab.Screen name="Latest" component={LatestScreen} options={{ title: 'Latest' }} />
      <Tab.Screen name="WatchListen" component={WatchListenScreen} options={{ title: 'Watch' }} />
      <Tab.Screen name="Games" component={GamesScreen} options={{ title: 'Games' }} />
      <Tab.Screen name="ForYou" component={ForYouScreen} options={{ title: 'For You' }} />
    </Tab.Navigator>
  );
}
