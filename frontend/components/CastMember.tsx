// components/CastMember.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface CastMemberProps {
  name: string;
}

const CastMember: React.FC<CastMemberProps> = ({ name }) => {
  const getInitials = (fullName: string) => {
    return fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getBackgroundColor = (fullName: string) => {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#F9A826', 
      '#6C5CE7', '#A29BFE', '#FD79A8', '#00B894'
    ];
    const index = fullName.length % colors.length;
    return colors[index];
  };

  return (
    <View style={styles.container}>
      <View style={[styles.avatar, { backgroundColor: getBackgroundColor(name) }]}>
        <Text style={styles.initials}>{getInitials(name)}</Text>
      </View>
      <Text style={styles.name} numberOfLines={1}>{name}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: 80,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  initials: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  name: {
    fontSize: 12,
    textAlign: 'center',
    color: '#666',
  },
});

export default CastMember;