import { useUser } from "@/hooks/useUser";
import dayjs from "dayjs";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
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
import { RadioButton } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EditProfileScreen() {
  const router = useRouter();
  const {
    user,
    handleUpdateApplicant,
    isUpdatingApplicant,
    handleUpdateRecruiter,
    isUpdatingRecruiter,
  } = useUser();

  const isApplicant = user?.role?.name === "APPLICANT";
  const isUpdating = isApplicant ? isUpdatingApplicant : isUpdatingRecruiter;

  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      fullName: "",
      username: "",
      phone: "",
      dob: new Date(),
      gender: "NAM",
      addresses: [{ province: "", fullAddress: "" }],
      education: "SCHOOL",
      level: "INTERN",
      position: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "addresses",
  });

  useEffect(() => {
    if (user) {
      const baseData = {
        fullName: user.fullName || "",
        username: user.username || "",
        phone: user.phone || "",
        gender: user.gender || "NAM",
        dob: user.dob ? new Date(user.dob) : new Date(),
        addresses:
          user.addresses?.length > 0
            ? user.addresses.map((addr: any) => ({
                addressId: addr.addressId,
                province: addr.province || "",
                fullAddress: addr.fullAddress || "",
              }))
            : [{ province: "", fullAddress: "" }],
      };

      if (isApplicant) {
        reset({
          ...baseData,
          education: (user as any).education || "SCHOOL",
          level: (user as any).level || "INTERN",
        });
      } else {
        reset({
          ...baseData,
          position: (user as any).position || "",
        });
      }
    }
  }, [user]);

  const onSubmit = async (data: any) => {
    if (!user?.accountId) return;

    try {
      const cleanAddresses = data.addresses.map((addr: any) => ({
        province: addr.province,
        fullAddress: addr.fullAddress,
        ...(addr.addressId && { addressId: addr.addressId }),
      }));

      const payload = {
        ...data,
        addresses: cleanAddresses,
        dob: dayjs(data.dob).format("YYYY-MM-DD"),
      };

      if (isApplicant) {
        await handleUpdateApplicant(user.accountId, payload);
      } else {
        await handleUpdateRecruiter(user.accountId, payload);
      }

      Alert.alert("Thành công", "Thông tin hồ sơ đã được cập nhật.");
      router.back();
    } catch (error) {
      console.error("Update Error:", error);
      Alert.alert(
        "Lỗi",
        "Không thể cập nhật thông tin. Vui lòng kiểm tra lại kết nối.",
      );
    }
  };

  if (!user) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.btnHeader}
        >
          <Text style={styles.textCancel}>Hủy</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Chỉnh sửa hồ sơ</Text>
        <TouchableOpacity
          onPress={handleSubmit(onSubmit)}
          disabled={isUpdating}
          style={styles.btnHeader}
        >
          {isUpdating ? (
            <ActivityIndicator size="small" color="#1976d2" />
          ) : (
            <Text style={styles.textSave}>Lưu</Text>
          )}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.section}>
            <Text style={styles.label}>Họ và tên *</Text>
            <Controller
              control={control}
              name="fullName"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.input}
                  value={value}
                  onChangeText={onChange}
                  placeholder="Nhập họ tên"
                />
              )}
            />

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
                  placeholder="Nhập số điện thoại"
                />
              )}
            />

            <Text style={styles.label}>Giới tính</Text>
            <Controller
              control={control}
              name="gender"
              render={({ field: { onChange, value } }) => (
                <View style={styles.radioGroup}>
                  {[
                    { label: "Nam", value: "NAM" },
                    { label: "Nữ", value: "NU" },
                    { label: "Khác", value: "OTHER" },
                  ].map((item) => (
                    <TouchableOpacity
                      key={item.value}
                      style={styles.radioItem}
                      onPress={() => onChange(item.value)}
                    >
                      <RadioButton
                        value={item.value}
                        status={value === item.value ? "checked" : "unchecked"}
                        onPress={() => onChange(item.value)}
                        color="#1976d2"
                      />
                      <Text style={styles.radioLabel}>{item.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            />
          </View>

          <View style={styles.section}>
            <View style={styles.rowBetween}>
              <Text style={styles.label}>Địa chỉ</Text>
              <TouchableOpacity
                onPress={() => append({ province: "", fullAddress: "" })}
              >
                <Text style={styles.textAdd}>+ Thêm địa chỉ</Text>
              </TouchableOpacity>
            </View>

            {fields.map((field, index) => (
              <View key={field.id} style={styles.addressCard}>
                <View style={styles.rowBetween}>
                  <Text style={styles.addressIndex}>Địa chỉ {index + 1}</Text>
                  {fields.length > 1 && (
                    <TouchableOpacity onPress={() => remove(index)}>
                      <Text style={styles.textDelete}>Xóa</Text>
                    </TouchableOpacity>
                  )}
                </View>
                <Controller
                  control={control}
                  name={`addresses.${index}.province`}
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      style={styles.input}
                      placeholder="Tỉnh/Thành phố (VD: TP. Hồ Chí Minh)"
                      value={value}
                      onChangeText={onChange}
                    />
                  )}
                />
                <Controller
                  control={control}
                  name={`addresses.${index}.fullAddress`}
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      style={styles.input}
                      placeholder="Địa chỉ chi tiết (Số nhà, đường...)"
                      value={value}
                      onChangeText={onChange}
                    />
                  )}
                />
              </View>
            ))}
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  header: {
    height: 56,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: "#ddd",
  },
  btnHeader: { padding: 5, minWidth: 50, alignItems: "center" },
  title: { fontSize: 18, fontWeight: "bold" },
  textCancel: { color: "#666", fontSize: 16 },
  textSave: { color: "#1976d2", fontSize: 16, fontWeight: "bold" },
  scrollContent: { padding: 16 },
  section: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  label: { fontSize: 14, fontWeight: "600", color: "#444", marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    marginBottom: 12,
    backgroundColor: "#fafafa",
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  textAdd: { color: "#1976d2", fontWeight: "bold", fontSize: 14 },
  addressCard: {
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 12,
    marginTop: 4,
  },
  addressIndex: { fontSize: 12, color: "#888", fontWeight: "bold" },
  textDelete: { color: "#ff4d4f", fontSize: 12 },
  radioGroup: {
    flexDirection: "column",
    backgroundColor: "#fafafa",
    borderRadius: 8,
    padding: 5,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  radioItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
  },
  radioLabel: { fontSize: 15, color: "#444" },
});
