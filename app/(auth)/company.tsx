import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useCompanySignUpMutation } from '../../services/auth/authApi';
import { useUploadSingleFileMutation } from '../../services/upload/uploadApi';
import CheckPasswordStrength, { isPasswordStrong } from '../../components/common/CheckPasswordStrength';
import PickerModal from '../../components/common/PickerModal';
import {
  COMPANY_INDUSTRY_OPTIONS,
  COMPANY_SIZE_OPTIONS,
  COUNTRY_OPTIONS,
} from '../../constants/constant';

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

type CompanyAddress = {
  province: string;
  fullAddress: string;
};

export default function CompanySignUpScreen() {
  const router = useRouter();
  const [companySignUp, { isLoading: isSubmitting }] = useCompanySignUpMutation();
  const [uploadFile, { isLoading: isUploadingFile }] = useUploadSingleFileMutation();

  const [step, setStep] = useState(1);

  // Step 1: Account Information
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Step 2: Company Information
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [size, setSize] = useState<'STARTUP' | 'SMALL' | 'MEDIUM' | 'LARGE' | 'ENTERPRISE' | ''>('');
  const [country, setCountry] = useState('');
  const [industry, setIndustry] = useState('');
  const [workingDays, setWorkingDays] = useState('');
  const [overtimePolicy, setOvertimePolicy] = useState('');
  const [addresses, setAddresses] = useState<CompanyAddress[]>([{ province: '', fullAddress: '' }]);

  // Image states
  const [logoUri, setLogoUri] = useState<string | null>(null);
  const [coverPhotoUri, setCoverPhotoUri] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<any>(null);
  const [coverPhotoFile, setCoverPhotoFile] = useState<any>(null);

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Pickers visibility
  const [showSizePicker, setShowSizePicker] = useState(false);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [showIndustryPicker, setShowIndustryPicker] = useState(false);

  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!username) {
      newErrors.username = 'Tên đăng nhập không được để trống';
    }

    if (!email) {
      newErrors.email = 'Email không được để trống';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!password) {
      newErrors.password = 'Mật khẩu không được để trống';
    } else if (!isPasswordStrong(password)) {
      newErrors.password = 'Mật khẩu phải có ít nhất 8 ký tự, chữ hoa, chữ thường, số và ký tự đặc biệt';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Xác nhận mật khẩu không được để trống';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu và xác nhận mật khẩu không khớp';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!logoUri) {
      newErrors.logo = 'Logo không được để trống';
    }

    if (!coverPhotoUri) {
      newErrors.coverPhoto = 'Ảnh bìa không được để trống';
    }

    if (!name) {
      newErrors.name = 'Tên công ty không được để trống';
    }

    if (!description) {
      newErrors.description = 'Mô tả không được để trống';
    } else if (description.length < 50) {
      newErrors.description = 'Mô tả công ty phải có ít nhất 50 ký tự';
    }

    if (!phone) {
      newErrors.phone = 'Số điện thoại không được để trống';
    } else if (!/^\d{10}$/.test(phone)) {
      newErrors.phone = 'Số điện thoại không hợp lệ (phải là 10 số)';
    }

    if (!size) {
      newErrors.size = 'Quy mô không được để trống';
    }

    if (!country) {
      newErrors.country = 'Quốc gia không được để trống';
    }

    if (!industry) {
      newErrors.industry = 'Lĩnh vực không được để trống';
    }

    if (!workingDays) {
      newErrors.workingDays = 'Ngày làm việc không được để trống';
    }

    if (!overtimePolicy) {
      newErrors.overtimePolicy = 'Chính sách OT không được để trống';
    }

    if (!addresses.length || addresses.some(addr => !addr.province || !addr.fullAddress)) {
      newErrors.addresses = 'Địa chỉ không được để trống';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handlePrevStep = () => {
    setStep(1);
  };

  const pickImage = async (type: 'logo' | 'coverPhoto') => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: type === 'logo' ? [1, 1] : [4, 3],
        quality: 0.6, // Giảm từ 0.8 xuống 0.6 để file nhẹ hơn, tốc độ upload nhanh hơn
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        
        // Check file size
        if (asset.fileSize && asset.fileSize > MAX_FILE_SIZE) {
          Alert.alert('Lỗi', `Kích thước ảnh không được vượt quá ${MAX_FILE_SIZE / 1024 / 1024}MB`);
          return;
        }

        const file = {
          uri: asset.uri,
          type: 'image/jpeg',
          name: `image_${Date.now()}.jpg`,
        };

        if (type === 'logo') {
          setLogoUri(asset.uri);
          setLogoFile(file);
          if (errors.logo) {
            setErrors({ ...errors, logo: '' });
          }
        } else {
          setCoverPhotoUri(asset.uri);
          setCoverPhotoFile(file);
          if (errors.coverPhoto) {
            setErrors({ ...errors, coverPhoto: '' });
          }
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Lỗi', 'Không thể chọn ảnh. Vui lòng thử lại.');
    }
  };

  const removeImage = (type: 'logo' | 'coverPhoto') => {
    if (type === 'logo') {
      setLogoUri(null);
      setLogoFile(null);
    } else {
      setCoverPhotoUri(null);
      setCoverPhotoFile(null);
    }
  };

  const addAddress = () => {
    setAddresses([...addresses, { province: '', fullAddress: '' }]);
  };

  const removeAddress = (index: number) => {
    if (addresses.length > 1) {
      setAddresses(addresses.filter((_, i) => i !== index));
    }
  };

  const updateAddress = (index: number, field: 'province' | 'fullAddress', value: string) => {
    const newAddresses = [...addresses];
    newAddresses[index][field] = value;
    setAddresses(newAddresses);
  };

  const handleSubmit = async () => {
    if (!validateStep2()) {
      return;
    }

    if (!logoFile || !coverPhotoFile) {
      Alert.alert('Lỗi', 'Vui lòng chọn cả logo và ảnh bìa cho công ty');
      return;
    }

    try {
      // Upload logo và cover photo song song (parallel) để tiết kiệm thời gian
      const [logoUploadResponse, coverPhotoUploadResponse] = await Promise.all([
        uploadFile({
          file: logoFile,
          folderType: 'company-logos',
        }).unwrap(),
        uploadFile({
          file: coverPhotoFile,
          folderType: 'company-covers',
        }).unwrap(),
      ]);

      // Validate upload responses
      if (!logoUploadResponse?.data?.url) {
        Alert.alert('Lỗi', 'Không thể tải logo lên');
        return;
      }

      if (!coverPhotoUploadResponse?.data?.url) {
        Alert.alert('Lỗi', 'Không thể tải ảnh bìa lên');
        return;
      }

      // Submit company signup
      await companySignUp({
        username,
        email,
        password,
        confirmPassword,
        name,
        description,
        logo: logoUploadResponse.data.url,
        coverPhoto: coverPhotoUploadResponse.data.url,
        website: website || undefined,
        phone,
        size: size as 'STARTUP' | 'SMALL' | 'MEDIUM' | 'LARGE' | 'ENTERPRISE',
        country,
        industry,
        workingDays,
        overtimePolicy,
        addresses,
      }).unwrap();

      Alert.alert(
        'Thành công',
        'Tài khoản công ty đã được tạo. Vui lòng kiểm tra email để xác thực.',
        [
          {
            text: 'OK',
            onPress: () => router.push(`/otp?email=${encodeURIComponent(email)}`),
          },
        ]
      );
    } catch (error: any) {
      console.error('Company sign up error:', error);
      Alert.alert(
        'Lỗi',
        error?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.'
      );
    }
  };

  const isLoading = isSubmitting || isUploadingFile;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Text style={styles.backButtonText}>‹ Quay lại</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Đăng ký tài khoản công ty</Text>
            <Text style={styles.subtitle}>
              {step === 1 ? 'Bước 1/2: Tạo tài khoản đăng nhập' : 'Bước 2/2: Nhập thông tin công ty của bạn'}
            </Text>

            {/* Progress indicator */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, step >= 1 && styles.progressActive]} />
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, step >= 2 && styles.progressActive]} />
              </View>
            </View>
          </View>

          {/* Step 1: Account Information */}
          {step === 1 && (
            <View style={styles.form}>
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>
                  Tên đăng nhập <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={[styles.input, errors.username && styles.inputError]}
                  placeholder="goat"
                  value={username}
                  onChangeText={(text) => {
                    setUsername(text);
                    if (errors.username) {
                      setErrors({ ...errors, username: '' });
                    }
                  }}
                  autoCapitalize="none"
                />
                {errors.username && <Text style={styles.errorText}>{errors.username}</Text>}
              </View>

              <View style={styles.fieldContainer}>
                <Text style={styles.label}>
                  Email <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={[styles.input, errors.email && styles.inputError]}
                  placeholder="goat@example.com"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (errors.email) {
                      setErrors({ ...errors, email: '' });
                    }
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
              </View>

              <View style={styles.fieldContainer}>
                <Text style={styles.label}>
                  Mật khẩu <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={[styles.passwordInput, errors.password && styles.inputError]}
                    placeholder="*********"
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      if (errors.password) {
                        setErrors({ ...errors, password: '' });
                      }
                    }}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Text style={styles.eyeIcon}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
                  </TouchableOpacity>
                </View>
                {password && <CheckPasswordStrength password={password} />}
                {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
              </View>

              <View style={styles.fieldContainer}>
                <Text style={styles.label}>
                  Xác nhận mật khẩu <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={[styles.passwordInput, errors.confirmPassword && styles.inputError]}
                    placeholder="*********"
                    value={confirmPassword}
                    onChangeText={(text) => {
                      setConfirmPassword(text);
                      if (errors.confirmPassword) {
                        setErrors({ ...errors, confirmPassword: '' });
                      }
                    }}
                    secureTextEntry={!showConfirmPassword}
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <Text style={styles.eyeIcon}>{showConfirmPassword ? '👁️' : '👁️‍🗨️'}</Text>
                  </TouchableOpacity>
                </View>
                {errors.confirmPassword && (
                  <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                )}
              </View>

              <TouchableOpacity
                style={[styles.button, styles.primaryButton]}
                onPress={handleNextStep}
              >
                <Text style={styles.buttonText}>Tiếp theo</Text>
              </TouchableOpacity>

              <View style={styles.footer}>
                <Text style={styles.footerText}>Đã có tài khoản? </Text>
                <TouchableOpacity onPress={() => router.push('/signin')}>
                  <Text style={styles.footerLink}>Đăng nhập</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Step 2: Company Information */}
          {step === 2 && (
            <View style={styles.form}>
              {/* Logo and Cover Photo */}
              <View style={styles.imageRow}>
                <View style={styles.imageContainer}>
                  <Text style={styles.label}>
                    Logo <Text style={styles.required}>*</Text>
                  </Text>
                  {logoUri ? (
                    <View style={styles.imagePreview}>
                      <Image source={{ uri: logoUri }} style={styles.logoImage} />
                      <TouchableOpacity
                        style={styles.removeImageButton}
                        onPress={() => removeImage('logo')}
                      >
                        <Text style={styles.removeImageText}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.imagePicker}
                      onPress={() => pickImage('logo')}
                    >
                      <Text style={styles.imagePickerText}>📷</Text>
                      <Text style={styles.imagePickerLabel}>Tải logo</Text>
                    </TouchableOpacity>
                  )}
                  {errors.logo && <Text style={styles.errorText}>{errors.logo}</Text>}
                </View>

                <View style={[styles.imageContainer, styles.coverImageContainer]}>
                  <Text style={styles.label}>
                    Ảnh bìa <Text style={styles.required}>*</Text>
                  </Text>
                  {coverPhotoUri ? (
                    <View style={styles.imagePreview}>
                      <Image source={{ uri: coverPhotoUri }} style={styles.coverImage} />
                      <TouchableOpacity
                        style={styles.removeImageButton}
                        onPress={() => removeImage('coverPhoto')}
                      >
                        <Text style={styles.removeImageText}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.imagePicker}
                      onPress={() => pickImage('coverPhoto')}
                    >
                      <Text style={styles.imagePickerText}>📷</Text>
                      <Text style={styles.imagePickerLabel}>Tải ảnh bìa</Text>
                    </TouchableOpacity>
                  )}
                  {errors.coverPhoto && <Text style={styles.errorText}>{errors.coverPhoto}</Text>}
                </View>
              </View>

              {/* Company Name & Phone */}
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>
                  Tên công ty <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={[styles.input, errors.name && styles.inputError]}
                  placeholder="Công ty TNHH ABC"
                  value={name}
                  onChangeText={(text) => {
                    setName(text);
                    if (errors.name) {
                      setErrors({ ...errors, name: '' });
                    }
                  }}
                />
                {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
              </View>

              <View style={styles.fieldContainer}>
                <Text style={styles.label}>
                  SĐT <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={[styles.input, errors.phone && styles.inputError]}
                  placeholder="0123456789"
                  value={phone}
                  onChangeText={(text) => {
                    setPhone(text);
                    if (errors.phone) {
                      setErrors({ ...errors, phone: '' });
                    }
                  }}
                  keyboardType="phone-pad"
                  maxLength={10}
                />
                {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
              </View>

              {/* Description */}
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>
                  Mô tả <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={[styles.textArea, errors.description && styles.inputError]}
                  placeholder="Giới thiệu về công ty..."
                  value={description}
                  onChangeText={(text) => {
                    setDescription(text);
                    if (errors.description) {
                      setErrors({ ...errors, description: '' });
                    }
                  }}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
                {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
              </View>

              {/* Industry */}
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>
                  Lĩnh vực <Text style={styles.required}>*</Text>
                </Text>
                <TouchableOpacity
                  style={[styles.input, styles.pickerInput, errors.industry && styles.inputError]}
                  onPress={() => setShowIndustryPicker(true)}
                >
                  <Text style={[styles.pickerText, !industry && styles.placeholderText]}>
                    {industry
                      ? COMPANY_INDUSTRY_OPTIONS.find((opt) => opt.value === industry)?.label ||
                        industry
                      : 'Chọn lĩnh vực'}
                  </Text>
                </TouchableOpacity>
                {errors.industry && <Text style={styles.errorText}>{errors.industry}</Text>}
              </View>

              {/* Size */}
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>
                  Quy mô <Text style={styles.required}>*</Text>
                </Text>
                <TouchableOpacity
                  style={[styles.input, styles.pickerInput, errors.size && styles.inputError]}
                  onPress={() => setShowSizePicker(true)}
                >
                  <Text style={[styles.pickerText, !size && styles.placeholderText]}>
                    {size
                      ? COMPANY_SIZE_OPTIONS.find((opt) => opt.value === size)?.label || size
                      : 'Chọn quy mô'}
                  </Text>
                </TouchableOpacity>
                {errors.size && <Text style={styles.errorText}>{errors.size}</Text>}
              </View>

              {/* Country */}
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>
                  Quốc gia <Text style={styles.required}>*</Text>
                </Text>
                <TouchableOpacity
                  style={[styles.input, styles.pickerInput, errors.country && styles.inputError]}
                  onPress={() => setShowCountryPicker(true)}
                >
                  <Text style={[styles.pickerText, !country && styles.placeholderText]}>
                    {country
                      ? COUNTRY_OPTIONS.find((opt) => opt.value === country)?.label || country
                      : 'Chọn quốc gia'}
                  </Text>
                </TouchableOpacity>
                {errors.country && <Text style={styles.errorText}>{errors.country}</Text>}
              </View>

              {/* Working Days */}
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>
                  Ngày làm việc <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={[styles.input, errors.workingDays && styles.inputError]}
                  placeholder="T2 - T6"
                  value={workingDays}
                  onChangeText={(text) => {
                    setWorkingDays(text);
                    if (errors.workingDays) {
                      setErrors({ ...errors, workingDays: '' });
                    }
                  }}
                />
                {errors.workingDays && <Text style={styles.errorText}>{errors.workingDays}</Text>}
              </View>

              {/* Website */}
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Website</Text>
                <TextInput
                  style={styles.input}
                  placeholder="https://example.com"
                  value={website}
                  onChangeText={setWebsite}
                  keyboardType="url"
                  autoCapitalize="none"
                />
              </View>

              {/* Overtime Policy */}
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>
                  Chính sách OT <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={[styles.input, errors.overtimePolicy && styles.inputError]}
                  placeholder="Có hỗ trợ"
                  value={overtimePolicy}
                  onChangeText={(text) => {
                    setOvertimePolicy(text);
                    if (errors.overtimePolicy) {
                      setErrors({ ...errors, overtimePolicy: '' });
                    }
                  }}
                />
                {errors.overtimePolicy && (
                  <Text style={styles.errorText}>{errors.overtimePolicy}</Text>
                )}
              </View>

              {/* Addresses */}
              <View style={styles.fieldContainer}>
                <View style={styles.addressHeader}>
                  <Text style={styles.label}>
                    Địa chỉ <Text style={styles.required}>*</Text>
                  </Text>
                  <TouchableOpacity style={styles.addButton} onPress={addAddress}>
                    <Text style={styles.addButtonText}>+ Thêm</Text>
                  </TouchableOpacity>
                </View>
                {addresses.map((address, index) => (
                  <View key={index} style={styles.addressItem}>
                    <View style={styles.addressInputs}>
                      <TextInput
                        style={[styles.input, styles.addressInput]}
                        placeholder="Tỉnh/TP"
                        value={address.province}
                        onChangeText={(text) => updateAddress(index, 'province', text)}
                      />
                      <TextInput
                        style={[styles.input, styles.addressInput]}
                        placeholder="Địa chỉ chi tiết"
                        value={address.fullAddress}
                        onChangeText={(text) => updateAddress(index, 'fullAddress', text)}
                      />
                    </View>
                    {addresses.length > 1 && (
                      <TouchableOpacity
                        style={styles.removeAddressButton}
                        onPress={() => removeAddress(index)}
                      >
                        <Text style={styles.removeAddressText}>✕</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
                {errors.addresses && <Text style={styles.errorText}>{errors.addresses}</Text>}
              </View>

              {/* Buttons */}
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.button, styles.secondaryButton]}
                  onPress={handlePrevStep}
                  disabled={isLoading}
                >
                  <Text style={[styles.buttonText, styles.secondaryButtonText]}>Quay lại</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.primaryButton, isLoading && styles.buttonDisabled]}
                  onPress={handleSubmit}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.buttonText}>Tạo tài khoản</Text>
                  )}
                </TouchableOpacity>
              </View>

              {/* Footer */}
              <View style={styles.footer}>
                <Text style={styles.footerText}>Đã có tài khoản? </Text>
                <TouchableOpacity onPress={() => router.push('/signin')} disabled={isLoading}>
                  <Text style={styles.footerLink}>Đăng nhập</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Picker Modals */}
      <PickerModal
        visible={showIndustryPicker}
        options={COMPANY_INDUSTRY_OPTIONS}
        selectedValue={industry}
        onSelect={(value) => {
          setIndustry(value);
          if (errors.industry) {
            setErrors({ ...errors, industry: '' });
          }
        }}
        onClose={() => setShowIndustryPicker(false)}
        title="Chọn lĩnh vực"
        placeholder="Tìm lĩnh vực..."
      />

      <PickerModal
        visible={showSizePicker}
        options={COMPANY_SIZE_OPTIONS}
        selectedValue={size}
        onSelect={(value) => {
          setSize(value as any);
          if (errors.size) {
            setErrors({ ...errors, size: '' });
          }
        }}
        onClose={() => setShowSizePicker(false)}
        title="Chọn quy mô công ty"
        placeholder="Tìm quy mô..."
      />

      <PickerModal
        visible={showCountryPicker}
        options={COUNTRY_OPTIONS}
        selectedValue={country}
        onSelect={(value) => {
          setCountry(value);
          if (errors.country) {
            setErrors({ ...errors, country: '' });
          }
        }}
        onClose={() => setShowCountryPicker(false)}
        title="Chọn quốc gia"
        placeholder="Tìm quốc gia..."
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
    color: '#1976d2',
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 16,
  },
  progressContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    width: '0%',
    backgroundColor: '#1976d2',
  },
  progressActive: {
    width: '100%',
  },
  form: {
    gap: 16,
  },
  fieldContainer: {
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  required: {
    color: '#ef4444',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#111827',
    backgroundColor: '#fff',
  },
  inputError: {
    borderColor: '#ef4444',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#111827',
    backgroundColor: '#fff',
    minHeight: 100,
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 4,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#111827',
    borderWidth: 0,
  },
  eyeButton: {
    paddingHorizontal: 12,
  },
  eyeIcon: {
    fontSize: 20,
  },
  imageRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  imageContainer: {
    flex: 1,
  },
  coverImageContainer: {
    flex: 2,
  },
  imagePicker: {
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
    backgroundColor: '#f9fafb',
  },
  imagePickerText: {
    fontSize: 32,
    marginBottom: 8,
  },
  imagePickerLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  imagePreview: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  logoImage: {
    width: '100%',
    height: 120,
    resizeMode: 'contain',
  },
  coverImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  removeImageButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#ef4444',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeImageText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  pickerInput: {
    justifyContent: 'center',
  },
  pickerText: {
    fontSize: 14,
    color: '#111827',
  },
  placeholderText: {
    color: '#9ca3af',
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  addButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1976d2',
  },
  addButtonText: {
    fontSize: 12,
    color: '#1976d2',
    fontWeight: '600',
  },
  addressItem: {
    marginBottom: 12,
  },
  addressInputs: {
    gap: 8,
  },
  addressInput: {
    marginBottom: 0,
  },
  removeAddressButton: {
    alignSelf: 'flex-end',
    padding: 8,
    marginTop: 4,
  },
  removeAddressText: {
    fontSize: 18,
    color: '#ef4444',
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: '#1976d2',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  secondaryButtonText: {
    color: '#111827',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  footerText: {
    fontSize: 14,
    color: '#6b7280',
  },
  footerLink: {
    fontSize: 14,
    color: '#1976d2',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});

