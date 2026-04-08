import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import { Job } from '../../types/model';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import { MapPin, DollarSign, Calendar } from 'lucide-react-native';

type JobCardProps = {
  job: Job;
  onPress?: () => void;
};

export const JobCard: React.FC<JobCardProps> = ({ job, onPress }) => {
  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={onPress} 
      activeOpacity={0.7}
    >
      {/* Badges Row */}
      <View style={styles.badgesRow}>
        <View style={styles.levelBadge}>
          <Text style={styles.levelText}>{job.level}</Text>
        </View>
        <View style={styles.workingTypeBadge}>
          <Text style={styles.workingTypeText}>{job.workingType}</Text>
        </View>
        <View style={[styles.statusBadge, job.active ? styles.activeBadge : styles.inactiveBadge]}>
          <Text style={[styles.statusText, job.active ? styles.activeText : styles.inactiveText]}>
            {job.active ? 'Đang tuyển' : 'Đã đóng'}
          </Text>
        </View>
      </View>

      {/* Job Title */}
      <Text style={styles.jobTitle} numberOfLines={2}>{job.title}</Text>

      {/* Job Info */}
      <View style={styles.infoContainer}>
        <View style={styles.infoRow}>
          <MapPin size={14} color="#6b7280" />
          <Text style={styles.infoText} numberOfLines={1}>{job.address.province}</Text>
        </View>

        <View style={styles.infoRow}>
          <DollarSign size={14} color="#6b7280" />
          <Text style={styles.infoValue}>{formatCurrency(job.salary)}</Text>
        </View>

        <View style={styles.infoRow}>
          <Calendar size={14} color="#6b7280" />
          <Text style={styles.infoText}>{formatDate(job.startDate)}</Text>
        </View>
      </View>

      {/* Skills Footer */}
      {job.skills && job.skills.length > 0 && (
        <View style={styles.skillsContainer}>
          {job.skills.slice(0, 3).map((skill) => (
            <View key={skill.skillId} style={styles.skillBadge}>
              <Text style={styles.skillText}>{skill.name}</Text>
            </View>
          ))}
          {job.skills.length > 3 && (
            <View style={styles.skillBadge}>
              <Text style={styles.skillText}>+{job.skills.length - 3}</Text>
            </View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  levelBadge: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
  },
  levelText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  workingTypeBadge: {
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  workingTypeText: {
    fontSize: 12,
    color: '#6b7280',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
  },
  activeBadge: {
    backgroundColor: '#1976d2',
  },
  inactiveBadge: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  activeText: {
    color: '#fff',
  },
  inactiveText: {
    color: '#6b7280',
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
    lineHeight: 24,
  },
  infoContainer: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    fontSize: 16,
    marginRight: 8,
    width: 20,
  },
  infoText: {
    fontSize: 14,
    color: '#6b7280',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: '#1976d2',
    fontWeight: '600',
    flex: 1,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  skillBadge: {
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  skillText: {
    fontSize: 12,
    color: '#374151',
  },
});


