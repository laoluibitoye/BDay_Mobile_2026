import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { MainTabParamList } from './types';
import { GlassTabBar } from '../components/GlassTabBar';
import { TodayScreen } from '../screens/today/TodayScreen';
import { ExploreScreen } from '../screens/explore/ExploreScreen';
import { WatchListenScreen } from '../screens/watchlisten/WatchListenScreen';
import { GamesScreen } from '../screens/games/GamesScreen';
import { MarketsScreen } from '../screens/markets/MarketsScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <GlassTabBar {...props} />}
    >
      <Tab.Screen name="Today" component={TodayScreen} options={{ title: 'Today' }} />
      <Tab.Screen name="Explore" component={ExploreScreen} options={{ title: 'Explore' }} />
      <Tab.Screen name="WatchListen" component={WatchListenScreen} options={{ title: 'Watch' }} />
      <Tab.Screen name="Games" component={GamesScreen} options={{ title: 'Games' }} />
      <Tab.Screen name="Markets" component={MarketsScreen} options={{ title: 'Markets' }} />
    </Tab.Navigator>
  );
}
