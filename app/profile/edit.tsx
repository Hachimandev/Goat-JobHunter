import { useUser } from "@/hooks/useUser";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import dayjs from "dayjs";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { RadioButton } from "react-native-paper";
import RNPickerSelect from "react-native-picker-select";
import { SafeAreaView } from "react-native-safe-area-context";

interface ExtendedUser {
  accountId: number;
  fullName?: string;
  username?: string;
  email?: string;
  phone?: string;
  dob?: string | Date;
  gender?: string;
  availableStatus?: boolean;
  headline?: string;
  bio?: string;
  education?: string;
  level?: string;
  addresses?: { addressId?: number; province: string; fullAddress: string }[];
  role?: { name: string };
}

export default function EditProfileScreen() {
  const router = useRouter();
  const {
    user,
    handleUpdateApplicant,
    isUpdatingApplicant,
    handleUpdateRecruiter,
    isUpdatingRecruiter,
  } = useUser();
  const [showDatePicker, setShowDatePicker] = useState(false);

  const userData = user as unknown as ExtendedUser;
  const isApplicant = user?.role?.name === "APPLICANT";
  const isUpdating = isApplicant ? isUpdatingApplicant : isUpdatingRecruiter;

  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      fullName: "",
      username: "",
      email: "",
      phone: "",
      dob: new Date(),
      gender: "MALE",
      education: "UNIVERSITY",
      level: "INTERN",
      availableStatus: true,
      headline: "",
      bio: "",
      addresses: [{ province: "", fullAddress: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "addresses",
  });

  useEffect(() => {
    if (userData) {
      reset({
        fullName: userData.fullName || "",
        username: userData.username || "",
        email: userData.email || "",
        phone: userData.phone || "",
        gender: userData.gender || "MALE",
        dob: userData.dob ? new Date(userData.dob) : new Date(),
        availableStatus: userData.availableStatus ?? true,
        headline: userData.headline || "",
        bio: userData.bio || "",
        education: userData.education || "UNIVERSITY",
        level: userData.level || "INTERN",
        addresses: userData.addresses?.length
          ? userData.addresses.map((addr) => ({
              addressId: addr.addressId,
              province: addr.province || "",
              fullAddress: addr.fullAddress || "",
            }))
          : [{ province: "", fullAddress: "" }],
      });
    }
  }, [userData, reset]);

  const handleSafeBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/profile/info");
    }
  };

  const onSubmit = async (data: any) => {
    try {
      const formData = new FormData();
      formData.append("accountId", String(userData?.accountId));
      formData.append("fullName", data.fullName);
      formData.append("username", data.username);
      formData.append("email", userData?.email || "");
      formData.append("phone", data.phone || "");
      formData.append("gender", data.gender);
      formData.append("dob", dayjs(data.dob).format("YYYY-MM-DD"));
      formData.append("headline", data.headline || "");
      formData.append("bio", data.bio || "");
      formData.append("addresses", JSON.stringify(data.addresses));

      let result;
      if (isApplicant) {
        formData.append("education", data.education);
        formData.append("level", data.level);
        formData.append("availableStatus", String(data.availableStatus));
        result = await handleUpdateApplicant(formData);
      } else {
        result = await handleUpdateRecruiter(formData);
      }

      if (result?.success) {
        Alert.alert("Thành công", "Hồ sơ của bạn đã được cập nhật");
        handleSafeBack();
      }
    } catch (error) {
      console.error("Submit Error:", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleSafeBack} style={styles.headerBtn}>
          <Text style={styles.textCancel}>Hủy</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chỉnh sửa hồ sơ</Text>
        <TouchableOpacity
          onPress={handleSubmit(onSubmit)}
          disabled={isUpdating}
          style={styles.headerBtn}
        >
          {isUpdating ? (
            <ActivityIndicator size="small" color="#00a651" />
          ) : (
            <Text style={styles.textSave}>Lưu</Text>
          )}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>
            <View style={styles.row}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Họ và tên *</Text>
                <Controller
                  control={control}
                  name="fullName"
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      style={styles.input}
                      value={value}
                      onChangeText={onChange}
                    />
                  )}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Tên hiển thị *</Text>
                <Controller
                  control={control}
                  name="username"
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      style={styles.input}
                      value={value}
                      onChangeText={onChange}
                    />
                  )}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Số điện thoại</Text>
                <Controller
                  control={control}
                  name="phone"
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      style={styles.input}
                      value={value}
                      onChangeText={onChange}
                      keyboardType="phone-pad"
                    />
                  )}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Ngày sinh</Text>
                <Controller
                  control={control}
                  name="dob"
                  render={({ field: { onChange, value } }) => (
                    <TouchableOpacity
                      style={styles.input}
                      onPress={() => setShowDatePicker(true)}
                    >
                      <Text>{dayjs(value).format("DD/MM/YYYY")}</Text>
                      {showDatePicker && (
                        <DateTimePicker
                          value={value || new Date()}
                          mode="date"
                          onChange={(e, d) => {
                            setShowDatePicker(false);
                            if (d) onChange(d);
                          }}
                        />
                      )}
                    </TouchableOpacity>
                  )}
                />
              </View>
            </View>

            <Text style={styles.label}>Giới tính</Text>
            <Controller
              control={control}
              name="gender"
              render={({ field: { onChange, value } }) => (
                <View style={styles.radioGroup}>
                  <TouchableOpacity
                    onPress={() => onChange("MALE")}
                    style={styles.radioItem}
                  >
                    <RadioButton
                      value="MALE"
                      status={value === "MALE" ? "checked" : "unchecked"}
                      color="#00a651"
                      onPress={() => onChange("MALE")}
                    />
                    <Text style={styles.radioText}>Nam</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => onChange("FEMALE")}
                    style={styles.radioItem}
                  >
                    <RadioButton
                      value="FEMALE"
                      status={value === "FEMALE" ? "checked" : "unchecked"}
                      color="#00a651"
                      onPress={() => onChange("FEMALE")}
                    />
                    <Text style={styles.radioText}>Nữ</Text>
                  </TouchableOpacity>
                </View>
              )}
            />
          </View>
          {isApplicant && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Chuyên môn</Text>
              <View style={styles.row}>
                {/* CỘT LEVEL */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Cấp bậc *</Text>
                  <Controller
                    control={control}
                    name="level"
                    render={({ field: { onChange, value } }) => (
                      <RNPickerSelect
                        onValueChange={onChange}
                        value={value}
                        items={[
                          { label: "Intern", value: "INTERN" },
                          { label: "Fresher", value: "FRESHER" },
                          { label: "Junior", value: "JUNIOR" },
                          { label: "Middle", value: "MIDDLE" },
                          { label: "Senior", value: "SENIOR" },
                        ]}
                        style={pickerStyles}
                        useNativeAndroidPickerStyle={false}
                        Icon={() => (
                          <Ionicons
                            name="chevron-down"
                            size={18}
                            color="#94a3b8"
                            style={{ marginTop: 12, marginRight: 8 }}
                          />
                        )}
                      />
                    )}
                  />
                </View>

                {/* CỘT EDUCATION */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Học vấn *</Text>
                  <Controller
                    control={control}
                    name="education"
                    render={({ field: { onChange, value } }) => (
                      <RNPickerSelect
                        onValueChange={onChange}
                        value={value}
                        items={[
                          { label: "School", value: "SCHOOL" },
                          { label: "College", value: "COLLEGE" },
                          { label: "Universtity", value: "UNIVERSITY" },
                          { label: "Engineer", value: "ENGINEER" },
                        ]}
                        style={pickerStyles}
                        useNativeAndroidPickerStyle={false}
                        Icon={() => (
                          <Ionicons
                            name="chevron-down"
                            size={18}
                            color="#94a3b8"
                            style={{ marginTop: 12, marginRight: 8 }}
                          />
                        )}
                      />
                    )}
                  />
                </View>
              </View>
            </View>
          )}

          <View style={styles.section}>
            <View style={styles.rowBetween}>
              <Text style={styles.sectionTitle}>Địa chỉ liên lạc *</Text>
              <TouchableOpacity
                onPress={() => append({ province: "", fullAddress: "" })}
                style={styles.addBtn}
              >
                <Text style={styles.addBtnText}>+ Thêm mới</Text>
              </TouchableOpacity>
            </View>
            {fields.map((field, index) => (
              <View key={field.id} style={styles.addressBox}>
                <View style={styles.rowBetween}>
                  <Text style={styles.addressSubTitle}>
                    Địa chỉ {index + 1}
                  </Text>
                  {fields.length > 1 && (
                    <TouchableOpacity onPress={() => remove(index)}>
                      <Text style={styles.delText}>Xóa</Text>
                    </TouchableOpacity>
                  )}
                </View>
                <Controller
                  control={control}
                  name={`addresses.${index}.province`}
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      style={styles.input}
                      value={value}
                      onChangeText={onChange}
                      placeholder="Tỉnh/Thành phố"
                    />
                  )}
                />
                <View style={{ height: 10 }} />
                <Controller
                  control={control}
                  name={`addresses.${index}.fullAddress`}
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      style={styles.input}
                      value={value}
                      onChangeText={onChange}
                      placeholder="Địa chỉ chi tiết"
                    />
                  )}
                />
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Chuyên môn</Text>
            {isApplicant && (
              <View style={styles.switchRow}>
                <Text style={styles.label}>Công khai hồ sơ</Text>
                <Controller
                  control={control}
                  name="availableStatus"
                  render={({ field: { onChange, value } }) => (
                    <Switch
                      value={value}
                      onValueChange={onChange}
                      trackColor={{ true: "#00a651" }}
                    />
                  )}
                />
              </View>
            )}
            <Text style={styles.label}>Headline</Text>
            <Controller
              control={control}
              name="headline"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.input}
                  value={value}
                  onChangeText={onChange}
                  placeholder="VD: Backend Developer"
                />
              )}
            />
            <View style={{ height: 10 }} />
            <Text style={styles.label}>Bio</Text>
            <Controller
              control={control}
              name="bio"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={value}
                  onChangeText={onChange}
                  multiline
                  placeholder="Giới thiệu bản thân"
                />
              )}
            />
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f4f7f6" },
  header: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: { fontSize: 17, fontWeight: "bold" },
  headerBtn: { minWidth: 45 },
  textCancel: { color: "#666", fontSize: 15 },
  textSave: { color: "#00a651", fontWeight: "bold", fontSize: 16 },
  scrollContent: { padding: 12 },
  section: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#1976d2",
    marginBottom: 15,
  },
  row: { flexDirection: "row", gap: 10, marginBottom: 12 },
  inputGroup: { flex: 1 },
  label: { fontSize: 13, fontWeight: "600", color: "#444", marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    backgroundColor: "#f8fafc",
  },
  disabledInput: { backgroundColor: "#edf2f7", color: "#718096" },
  textArea: { height: 100, textAlignVertical: "top" },
  radioGroup: { flexDirection: "row", gap: 15, alignItems: "center" },
  radioItem: { flexDirection: "row", alignItems: "center" },
  radioText: { fontSize: 14 },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  addBtn: {
    backgroundColor: "#e3f2fd",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addBtnText: { color: "#1976d2", fontSize: 12, fontWeight: "bold" },
  addressBox: {
    padding: 12,
    backgroundColor: "#f1f5f9",
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  addressSubTitle: { fontSize: 12, fontWeight: "bold", color: "#64748b" },
  delText: { color: "red", fontSize: 12 },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    backgroundColor: "#f8fafc",
    justifyContent: "center",
    height: 45,
  },
});

const pickerStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 14,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    color: "#1e293b",
    backgroundColor: "#f8fafc",
    paddingRight: 30,
  },
  inputAndroid: {
    fontSize: 14,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    color: "#1e293b",
    backgroundColor: "#f8fafc",
    paddingRight: 30,
  },
  iconContainer: {
    top: 0,
    right: 0,
  },
});
