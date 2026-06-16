import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface CheckPasswordStrengthProps {
  password: string;
}

export const isPasswordStrong = (pwd: string | undefined): boolean => {
  if (!pwd) return false;
  const MIN_LENGTH = 8;
  const RE_LOWER = /[a-z]/;
  const RE_UPPER = /[A-Z]/;
  const RE_NUMBER = /\d/;
  const RE_SPECIAL = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/;
  
  return (
    pwd.length >= MIN_LENGTH &&
    RE_LOWER.test(pwd) &&
    RE_UPPER.test(pwd) &&
    RE_NUMBER.test(pwd) &&
    RE_SPECIAL.test(pwd)
  );
};

const getPasswordStrength = (password: string): { strength: number; label: string; color: string } => {
  if (!password) return { strength: 0, label: '', color: '#e0e0e0' };
  
  let strength = 0;
  const MIN_LENGTH = 8;
  const RE_LOWER = /[a-z]/;
  const RE_UPPER = /[A-Z]/;
  const RE_NUMBER = /\d/;
  const RE_SPECIAL = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/;
  
  if (password.length >= MIN_LENGTH) strength++;
  if (RE_LOWER.test(password)) strength++;
  if (RE_UPPER.test(password)) strength++;
  if (RE_NUMBER.test(password)) strength++;
  if (RE_SPECIAL.test(password)) strength++;
  
  if (strength <= 2) {
    return { strength, label: 'Yếu', color: '#ef4444' };
  } else if (strength <= 4) {
    return { strength, label: 'Trung bình', color: '#f59e0b' };
  } else {
    return { strength, label: 'Mạnh', color: '#10b981' };
  }
};

export default function CheckPasswordStrength({ password }: CheckPasswordStrengthProps) {
  const { strength, label, color } = getPasswordStrength(password);
  
  if (!password) return null;
  
  return (
    <View style={styles.container}>
      <View style={styles.barsContainer}>
        {[1, 2, 3, 4, 5].map((bar) => (
          <View
            key={bar}
            style={[
              styles.bar,
              bar <= strength && { backgroundColor: color }
            ]}
          />
        ))}
      </View>
      <Text style={[styles.label, { color }]}>{label}</Text>
      <Text style={styles.hint}>
        Mật khẩu phải có ít nhất 8 ký tự, chữ hoa, chữ thường, số và ký tự đặc biệt
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  barsContainer: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 4,
  },
  bar: {
    flex: 1,
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  hint: {
    fontSize: 11,
    color: '#6b7280',
    lineHeight: 16,
  },
});

