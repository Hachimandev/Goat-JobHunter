import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CheckPasswordStrength, {
  isPasswordStrong,
} from "../../components/common/CheckPasswordStrength";
import { useUserSignUpMutation } from "../../services/auth/authApi";

type SignUpType = "applicant" | "recruiter";

export default function SignUpScreen() {
  const router = useRouter();
  const [userSignUp, { isLoading }] = useUserSignUpMutation();

  // Form state
  const [email, setEmail] = useState("");
  const [type, setType] = useState<SignUpType>("applicant");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [gender, setGender] = useState<"MALE" | "FEMALE" | "OTHER">("MALE");

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Email validation
    if (!email) {
      newErrors.email = "Email không được để trống";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Email không hợp lệ";
    }

    // Full name validation
    if (!fullName) {
      newErrors.fullName = "Họ tên không được để trống";
    }

    // Username validation
    if (!username) {
      newErrors.username = "Tên hiển thị không được để trống";
    }

    // Phone validation
    if (!phone) {
      newErrors.phone = "Số điện thoại không được để trống";
    } else if (!/^\d{10}$/.test(phone)) {
      newErrors.phone = "Số điện thoại không hợp lệ (phải là 10 số)";
    }

    // Password validation
    if (!password) {
      newErrors.password = "Mật khẩu không được để trống";
    } else if (!isPasswordStrong(password)) {
      newErrors.password =
        "Mật khẩu phải có ít nhất 8 ký tự, chữ hoa, chữ thường, số và ký tự đặc biệt";
    }

    // Confirm password validation
    if (!confirmPassword) {
      newErrors.confirmPassword = "Xác nhận mật khẩu không được để trống";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu và xác nhận mật khẩu không khớp";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const result = await userSignUp({
        email,
        fullName,
        username,
        phone,
        password,
        confirmPassword,
        type,
        gender,
      }).unwrap();

      Alert.alert(
        "Thành công",
        "Tài khoản đã được tạo. Vui lòng kiểm tra email để xác thực.",
        [
          {
            text: "OK",
            onPress: () =>
              router.push(`/otp?email=${encodeURIComponent(email)}`),
          },
        ],
      );
    } catch (error: any) {
      console.error("Sign up error:", error);
      Alert.alert(
        "Lỗi",
        error?.data?.message || "Đăng ký thất bại. Vui lòng thử lại.",
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <Text style={styles.backButtonText}>‹ Quay lại</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Tạo tài khoản mới</Text>
            <Text style={styles.subtitle}>
              Nhập thông tin của bạn bên dưới để tạo tài khoản mới.
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Email */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>
                Email <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, errors.email && styles.inputError]}
                placeholder="mail@example.com"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (errors.email) {
                    setErrors({ ...errors, email: "" });
                  }
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              {errors.email && (
                <Text style={styles.errorText}>{errors.email}</Text>
              )}
            </View>

            {/* Type */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Bạn là</Text>
              <View style={styles.radioGroup}>
                <TouchableOpacity
                  style={styles.radioOption}
                  onPress={() => setType("applicant")}
                >
                  <View style={styles.radioCircle}>
                    {type === "applicant" && (
                      <View style={styles.radioSelected} />
                    )}
                  </View>
                  <Text style={styles.radioLabel}>Ứng viên</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.radioOption}
                  onPress={() => setType("recruiter")}
                >
                  <View style={styles.radioCircle}>
                    {type === "recruiter" && (
                      <View style={styles.radioSelected} />
                    )}
                  </View>
                  <Text style={styles.radioLabel}>Nhà tuyển dụng</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Giới tính*/}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>
                Giới tính <Text style={styles.required}>*</Text>
              </Text>

              <View style={styles.radioGroup}>
                {[
                  { label: "Nam", value: "MALE" },
                  { label: "Nữ", value: "FEMALE" },
                  { label: "Khác", value: "OTHER" },
                ].map((g) => (
                  <TouchableOpacity
                    key={g.value}
                    style={styles.radioOption}
                    onPress={() => setGender(g.value as any)}
                  >
                    <View style={styles.radioCircle}>
                      {gender === g.value && (
                        <View style={styles.radioSelected} />
                      )}
                    </View>
                    <Text style={styles.radioLabel}>{g.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Full Name */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>
                Họ và tên <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, errors.fullName && styles.inputError]}
                placeholder="Nguyễn Văn A"
                value={fullName}
                onChangeText={(text) => {
                  setFullName(text);
                  if (errors.fullName) {
                    setErrors({ ...errors, fullName: "" });
                  }
                }}
              />
              {errors.fullName && (
                <Text style={styles.errorText}>{errors.fullName}</Text>
              )}
            </View>

            {/* Username */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>
                Tên hiển thị <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, errors.username && styles.inputError]}
                placeholder="nguyenvana"
                value={username}
                onChangeText={(text) => {
                  setUsername(text);
                  if (errors.username) {
                    setErrors({ ...errors, username: "" });
                  }
                }}
                autoCapitalize="none"
              />
              {errors.username && (
                <Text style={styles.errorText}>{errors.username}</Text>
              )}
            </View>

            {/* Phone */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>
                Số điện thoại <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, errors.phone && styles.inputError]}
                placeholder="0123456789"
                value={phone}
                onChangeText={(text) => {
                  setPhone(text);
                  if (errors.phone) {
                    setErrors({ ...errors, phone: "" });
                  }
                }}
                keyboardType="phone-pad"
                maxLength={10}
              />
              {errors.phone && (
                <Text style={styles.errorText}>{errors.phone}</Text>
              )}
            </View>

            {/* Password */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>
                Mật khẩu <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[
                    styles.passwordInput,
                    errors.password && styles.inputError,
                  ]}
                  placeholder="*********"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (errors.password) {
                      setErrors({ ...errors, password: "" });
                    }
                  }}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Text style={styles.eyeIcon}>
                    {showPassword ? "👁️" : "👁️‍🗨️"}
                  </Text>
                </TouchableOpacity>
              </View>
              {password && <CheckPasswordStrength password={password} />}
              {errors.password && (
                <Text style={styles.errorText}>{errors.password}</Text>
              )}
            </View>

            {/* Confirm Password */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>
                Xác nhận mật khẩu <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[
                    styles.passwordInput,
                    errors.confirmPassword && styles.inputError,
                  ]}
                  placeholder="*********"
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    if (errors.confirmPassword) {
                      setErrors({ ...errors, confirmPassword: "" });
                    }
                  }}
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Text style={styles.eyeIcon}>
                    {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                  </Text>
                </TouchableOpacity>
              </View>
              {errors.confirmPassword && (
                <Text style={styles.errorText}>{errors.confirmPassword}</Text>
              )}
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[
                styles.submitButton,
                isLoading && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Tạo tài khoản</Text>
              )}
            </TouchableOpacity>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Đã có tài khoản? </Text>
              <TouchableOpacity
                onPress={() => router.push("/signin")}
                disabled={isLoading}
              >
                <Text style={styles.footerLink}>Đăng nhập</Text>
              </TouchableOpacity>
            </View>

            {/* Company Signup Link */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Bạn đại diện cho doanh nghiệp?{" "}
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/company")}
                disabled={isLoading}
              >
                <Text style={styles.footerLink}>Đăng ký tài khoản công ty</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  header: {
    marginBottom: 24,
  },
  backButton: {
    paddingVertical: 8,
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: "#1976d2",
    fontWeight: "600",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
  },
  form: {
    gap: 16,
  },
  fieldContainer: {
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
  },
  required: {
    color: "#ef4444",
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: "#111827",
    backgroundColor: "#fff",
  },
  inputError: {
    borderColor: "#ef4444",
  },
  errorText: {
    fontSize: 12,
    color: "#ef4444",
    marginTop: 4,
  },
  radioGroup: {
    flexDirection: "row",
    gap: 24,
  },
  radioOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#1976d2",
    alignItems: "center",
    justifyContent: "center",
  },
  radioSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#1976d2",
  },
  radioLabel: {
    fontSize: 14,
    color: "#111827",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
    backgroundColor: "#fff",
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: "#111827",
    borderWidth: 0,
  },
  eyeButton: {
    paddingHorizontal: 12,
  },
  eyeIcon: {
    fontSize: 20,
  },
  submitButton: {
    backgroundColor: "#1976d2",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  footerText: {
    fontSize: 14,
    color: "#6b7280",
  },
  footerLink: {
    fontSize: 14,
    color: "#1976d2",
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});
