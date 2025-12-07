// ============================================
// CommitAI Mobile - Custom Tab Bar Component
// Floating bottom navigation with elevated center button
// ============================================

import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Home, Flame, User } from 'lucide-react-native';
import { COLORS } from '@/constants';

interface TabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
}

const CustomTabBar: React.FC<TabBarProps> = ({ state, navigation }) => {
  return (
    <View style={styles.tabBarContainer}>
      <View style={styles.tabBar}>
        {state.routes.map((route: any, index: number) => {
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          // Center button (Move) has special styling
          if (route.name === 'Move') {
            return (
              <View key={route.key} style={styles.centerButtonWrapper}>
                <Pressable
                  onPress={onPress}
                  style={styles.centerButton}
                >
                  <Flame
                    size={28}
                    color={COLORS.acidGreen}
                    fill={COLORS.acidGreen}
                  />
                </Pressable>
              </View>
            );
          }

          const IconComponent = route.name === 'Home' ? Home : User;

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              style={styles.tabButton}
            >
              <IconComponent
                size={24}
                color={isFocused ? COLORS.black : COLORS.systemGray1}
                strokeWidth={isFocused ? 2.5 : 2}
              />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

export default CustomTabBar;

// ---------- Styles ----------

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
  },
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 32,
    height: 64,
    paddingHorizontal: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  tabButton: {
    padding: 8,
    zIndex: 1,
  },
  centerButtonWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: -24,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  centerButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.black,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
