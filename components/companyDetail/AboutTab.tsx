import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  useWindowDimensions,
} from 'react-native';
import { Company } from '@/types/model';
import { Ionicons } from '@expo/vector-icons';
import { COMPANY_SIZE_OPTIONS } from '@/constants/constant';
import RenderHtml from 'react-native-render-html';
import { WebView } from 'react-native-webview';

interface AboutTabProps {
  company: Company;
  skills: Record<number, string>;
}

export default function AboutTab({ company, skills }: AboutTabProps) {
  const [activeLocationIndex, setActiveLocationIndex] = useState(0);
  const { width } = useWindowDimensions();

  const groupedAddresses = useMemo(() => {
    const groups: Record<string, typeof company.addresses> = {};
    company.addresses.forEach((address) => {
      if (!groups[address.province]) {
        groups[address.province] = [];
      }
      groups[address.province].push(address);
    });
    return groups;
  }, [company]);

  const handleWebsitePress = () => {
    if (company.website) {
      Linking.openURL(company.website);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Thông tin chung */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Thông tin chung</Text>
        </View>
        <View style={styles.cardContent}>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Ionicons name="business-outline" size={20} color="#9ca3af" />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Quy mô công ty</Text>
                <Text style={styles.infoValue}>
                  {COMPANY_SIZE_OPTIONS.find((option) => option.value === company.size)?.label ||
                    company.size}
                </Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <Ionicons name="briefcase-outline" size={20} color="#9ca3af" />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Lĩnh vực</Text>
                <Text style={styles.infoValue}>{company.industry}</Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <Ionicons name="flag-outline" size={20} color="#9ca3af" />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Quốc gia</Text>
                <Text style={styles.infoValue}>{company.country}</Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <Ionicons name="calendar-outline" size={20} color="#9ca3af" />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Thời gian làm việc</Text>
                <Text style={styles.infoValue}>{company.workingDays}</Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <Ionicons name="time-outline" size={20} color="#9ca3af" />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Làm việc ngoài giờ</Text>
                <Text style={styles.infoValue}>{company.overtimePolicy}</Text>
              </View>
            </View>
          </View>

          {company.website && (
            <TouchableOpacity onPress={handleWebsitePress} style={styles.websiteLink}>
              <Ionicons name="globe-outline" size={16} color="#1976d2" />
              <Text style={styles.websiteText} numberOfLines={1}>
                {company.website}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Giới thiệu công ty */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Giới thiệu công ty</Text>
        </View>
        <View style={styles.cardContent}>
          {company.description ? (
            <RenderHtml
              contentWidth={width - 64}
              source={{ html: company.description }}
              tagsStyles={{
                p: { fontSize: 15, color: '#1f2937', lineHeight: 24, marginBottom: 8 },
                span: { fontSize: 15, color: '#1f2937', lineHeight: 24 },
              }}
            />
          ) : (
            <Text style={styles.emptyText}>Chưa có thông tin giới thiệu về công ty.</Text>
          )}
        </View>
      </View>

      {/* Chuyên môn */}
      {Object.keys(skills).length > 0 && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Chuyên môn của chúng tôi</Text>
          </View>
          <View style={styles.cardContent}>
            <View style={styles.skillsContainer}>
              {Object.entries(skills).map(([id, name]) => (
                <View key={id} style={styles.skillBadge}>
                  <Text style={styles.skillText}>{name}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      )}

      {/* Địa điểm */}
      {company.addresses && company.addresses.length > 0 && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Địa điểm</Text>
          </View>
          <View style={styles.cardContent}>
            {/* Danh sách địa điểm theo chiều dọc */}
            <View style={styles.addressesContainer}>
              {Object.entries(groupedAddresses).map(([province, addresses]) => (
                <View key={province} style={styles.provinceSection}>
                  <Text style={styles.provinceName}>{province}</Text>
                  {addresses.map((address) => {
                    const globalIndex = company.addresses.findIndex(
                      (a) => a.addressId === address.addressId
                    );
                    const isActive = activeLocationIndex === globalIndex;
                    return (
                      <TouchableOpacity
                        key={address.addressId}
                        onPress={() => setActiveLocationIndex(globalIndex)}
                        style={[styles.addressCard, isActive && styles.addressCardActive]}
                      >
                        <Ionicons
                          name="location"
                          size={20}
                          color={isActive ? '#1976d2' : '#9ca3af'}
                        />
                        <Text
                          style={[styles.addressText, isActive && styles.addressTextActive]}
                        >
                          {address.fullAddress}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}
            </View>

            {/* Google Maps Embed - Giống Web */}
            <View style={styles.mapSection}>
              <View style={styles.mapHeader}>
                <Text style={styles.mapTitle}>Vị trí trên bản đồ</Text>
                <TouchableOpacity
                  style={styles.openMapButton}
                  onPress={() => {
                    const address = company.addresses[activeLocationIndex].fullAddress;
                    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
                    Linking.openURL(url);
                  }}
                >
                  <Ionicons name="open-outline" size={16} color="#1976d2" />
                  <Text style={styles.openMapText}>Mở Google Maps</Text>
                </TouchableOpacity>
              </View>

              {/* WebView với iframe Google Maps - Giống y hệt web */}
              <View style={styles.mapContainer}>
                <WebView
                  source={{
                    html: `
                      <!DOCTYPE html>
                      <html>
                        <head>
                          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
                          <style>
                            body { margin: 0; padding: 0; }
                            iframe { border: 0; }
                          </style>
                        </head>
                        <body>
                          <iframe
                            width="100%"
                            height="100%"
                            loading="lazy"
                            allowfullscreen
                            referrerpolicy="no-referrer-when-downgrade"
                            src="https://maps.google.com/maps?q=${encodeURIComponent(
                              company.addresses[activeLocationIndex].fullAddress
                            )}&t=&z=16&ie=UTF8&iwloc=&output=embed"
                          ></iframe>
                        </body>
                      </html>
                    `,
                  }}
                  style={styles.webview}
                  scrollEnabled={false}
                  bounces={false}
                />
              </View>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  cardHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    borderStyle: 'dashed',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  cardContent: {
    padding: 16,
  },
  infoGrid: {
    gap: 24,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6b7280',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  websiteLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 24,
  },
  websiteText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#1976d2',
    textDecorationLine: 'underline',
  },
  emptyText: {
    fontSize: 15,
    color: '#6b7280',
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillBadge: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  skillText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  addressesContainer: {
    marginBottom: 16,
  },
  provinceSection: {
    marginBottom: 16,
  },
  provinceName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  addressCardActive: {
    backgroundColor: '#eff6ff',
    borderColor: '#1976d2',
  },
  addressText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
    lineHeight: 22,
  },
  addressTextActive: {
    color: '#1976d2',
    fontWeight: '600',
  },
  mapSection: {
    marginTop: 8,
  },
  mapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  mapTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  openMapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  openMapText: {
    fontSize: 14,
    color: '#1976d2',
    fontWeight: '500',
  },
  mapContainer: {
    height: 300,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#f3f4f6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});

