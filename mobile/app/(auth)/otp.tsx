import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useVerifyCodeMutation, useResendCodeMutation } from '../../services/auth/authApi';

export default function OTPScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const email = params.email as string;

  const [verifyCode, { isLoading: isVerifying }] = useVerifyCodeMutation();
  const [resendCode, { isLoading: isResending }] = useResendCodeMutation();

  // OTP state - 6 digits
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Refs for inputs
  const inputRefs = useRef<(TextInput | null)[]>([]);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  // Auto-focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Handle OTP input change
  const handleOtpChange = (value: string, index: number) => {
    // Only allow numbers
    if (value && !/^\d+$/.test(value)) {
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-move to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits are filled
    if (index === 5 && value) {
      const fullOtp = newOtp.join('');
      if (fullOtp.length === 6) {
        handleSubmit(fullOtp);
      }
    }
  };

  // Handle backspace
  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Submit OTP
  const handleSubmit = async (code?: string) => {
    const otpCode = code || otp.join('');

    if (otpCode.length !== 6) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ mã OTP 6 số');
      return;
    }

    try {
      const result = await verifyCode({
        email,
        verificationCode: otpCode,
      }).unwrap();

      if (result.statusCode === 200) {
        Alert.alert(
          'Thành công',
          'Xác thực email thành công!',
          [
            {
              text: 'OK',
              onPress: () => router.replace('/signin'),
            },
          ]
        );
      } else {
        Alert.alert('Lỗi', 'Mã xác thực không đúng');
        // Clear OTP inputs
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (error: any) {
      console.error('Verify error:', error);
      Alert.alert(
        'Lỗi',
        error?.data?.message || 'Xác thực thất bại. Vui lòng thử lại.'
      );
      // Clear OTP inputs
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  };

  // Resend OTP
  const handleResend = async () => {
    if (!canResend) return;

    try {
      const result = await resendCode({ email }).unwrap();

      if (result.statusCode === 200) {
        Alert.alert('Thành công', 'Mã xác thực mới đã được gửi đến email của bạn');
        setCountdown(60);
        setCanResend(false);
        // Clear current OTP
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (error: any) {
      console.error('Resend error:', error);
      Alert.alert(
        'Lỗi',
        error?.data?.message || 'Gửi lại mã thất bại. Vui lòng thử lại.'
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>‹ Quay lại</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.icon}>✉️</Text>
          <Text style={styles.title}>Xác thực tài khoản</Text>
          <Text style={styles.subtitle}>
            Nhập mã OTP đã gửi đến{'\n'}
            <Text style={styles.emailText}>{email}</Text>
          </Text>
        </View>

        {/* OTP Input */}
        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputRefs.current[index] = ref)}
              style={[
                styles.otpInput,
                digit && styles.otpInputFilled,
              ]}
              value={digit}
              onChangeText={(value) => handleOtpChange(value, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
            />
          ))}
        </View>

        {/* Countdown / Resend */}
        <View style={styles.resendContainer}>
          {!canResend ? (
            <Text style={styles.countdownText}>
              Gửi lại mã sau {countdown}s
            </Text>
          ) : (
            <TouchableOpacity onPress={handleResend} disabled={isResending}>
              {isResending ? (
                <ActivityIndicator size="small" color="#1976d2" />
              ) : (
                <Text style={styles.resendButton}>Gửi lại mã OTP</Text>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, isVerifying && styles.submitButtonDisabled]}
          onPress={() => handleSubmit()}
          disabled={isVerifying}
        >
          {isVerifying ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Xác nhận</Text>
          )}
        </TouchableOpacity>

        {/* Change Email */}
        <TouchableOpacity onPress={() => router.back()} style={styles.changeEmailButton}>
          <Text style={styles.changeEmailText}>Thay đổi email</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  backButton: {
    paddingVertical: 8,
    marginTop: 8,
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: '#1976d2',
    fontWeight: '600',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  icon: {
    fontSize: 80,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  emailText: {
    fontWeight: '600',
    color: '#111827',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 24,
  },
  otpInput: {
    width: 48,
    height: 56,
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 12,
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    color: '#111827',
    backgroundColor: '#fff',
  },
  otpInputFilled: {
    borderColor: '#1976d2',
  },
  resendContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  countdownText: {
    fontSize: 14,
    color: '#6b7280',
  },
  resendButton: {
    fontSize: 14,
    color: '#1976d2',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  submitButton: {
    backgroundColor: '#1976d2',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  changeEmailButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  changeEmailText: {
    fontSize: 14,
    color: '#6b7280',
  },
});

