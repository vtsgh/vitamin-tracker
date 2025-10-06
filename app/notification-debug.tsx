import { useState, useCallback, useRef } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { 
  auditNotifications, 
  cleanupOrphanedNotifications, 
  resetNotificationSystem,
  getNotificationStatus,
  NotificationAuditResult
} from '../utils/notification-debug';
import { 
  runNotificationTest, 
  scheduleTestNotification,
  getAllScheduledNotifications,
  requestNotificationPermissions,
  emergencyAndroidNotificationTest
} from '../utils/notifications';
// Android monitoring functions moved to main notification utils
import { 
  debugStorageNotificationMismatch, 
  showStorageDebugAlert,
  cleanDeadNotificationReferences
} from '../utils/storage-debug';

interface StatusInfo {
  hasPermissions: boolean;
  totalScheduled: number;
  totalPlans: number;
  hasIssues: boolean;
  summary: string;
}

export default function NotificationDebugScreen() {
  const [status, setStatus] = useState<StatusInfo | null>(null);
  const [auditResult, setAuditResult] = useState<NotificationAuditResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const lastActionTime = useRef(0);

  // Load status when screen focuses
  useFocusEffect(
    useCallback(() => {
      loadStatus();
    }, [])
  );

  const loadStatus = async () => {
    try {
      setIsLoading(true);
      const statusInfo = await getNotificationStatus();
      setStatus(statusInfo);
    } catch (error) {
      console.error('Failed to load notification status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (action: () => Promise<void>, description: string) => {
    const now = Date.now();
    if (now - lastActionTime.current < 1000) {
      console.log('🚫 Action blocked - too soon');
      return;
    }
    lastActionTime.current = now;

    try {
      setIsLoading(true);
      console.log(`🔧 Starting: ${description}`);
      await action();
      await loadStatus(); // Refresh status after action
      console.log(`✅ Completed: ${description}`);
    } catch (error) {
      console.error(`❌ Failed: ${description}`, error);
      Alert.alert('Error', `${description} failed: ${(error as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const requestPermissions = async () => {
    const granted = await requestNotificationPermissions();
    Alert.alert(
      'Permissions', 
      granted ? 'Permissions granted!' : 'Permissions denied or failed'
    );
  };

  const runQuickTest = async () => {
    const id = await scheduleTestNotification();
    Alert.alert('Test Scheduled', `Test notification scheduled! ID: ${id}`);
  };

  const runComprehensiveTest = async () => {
    Alert.alert(
      'Comprehensive Test',
      'This will run a full notification test.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Run Test', 
          onPress: () => handleAction(runNotificationTest, 'Comprehensive notification test')
        }
      ]
    );
  };


  const runAudit = async () => {
    const result = await auditNotifications();
    setAuditResult(result);
    Alert.alert('Audit Complete', result.summary);
  };

  const cleanupOrphaned = async () => {
    Alert.alert(
      'Cleanup Orphaned',
      'This will remove notifications that don\'t belong to any current plans.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clean Up', 
          onPress: () => handleAction(async () => {
            const count = await cleanupOrphanedNotifications();
            Alert.alert('Cleanup Complete', `Removed ${count} orphaned notifications`);
          }, 'Cleanup orphaned notifications')
        }
      ]
    );
  };


  const resetSystem = async () => {
    Alert.alert(
      '⚠️ Reset Notification System',
      'This will cancel ALL notifications and rebuild them from current plans. This is destructive!',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          style: 'destructive',
          onPress: () => handleAction(async () => {
            await resetNotificationSystem();
            Alert.alert('Reset Complete', 'Notification system has been rebuilt');
          }, 'Reset notification system')
        }
      ]
    );
  };

  const viewAllNotifications = async () => {
    try {
      const notifications = await getAllScheduledNotifications();
      console.log('📋 All scheduled notifications:', notifications);
      
      let message = `Found ${notifications.length} scheduled notifications:\n\n`;
      notifications.forEach((notification, index) => {
        message += `${index + 1}. ${notification.content.title}\n`;
        message += `   ID: ${notification.identifier}\n`;
        message += `   Trigger: ${JSON.stringify(notification.trigger)}\n\n`;
      });
      
      Alert.alert('All Notifications', notifications.length > 0 ? message : 'No notifications scheduled');
    } catch (error) {
      Alert.alert('Error', `Failed to get notifications: ${(error as Error).message}`);
    }
  };

  const goBack = () => {
    router.back();
  };

  const renderActionButton = (title: string, onPress: () => void, color: string = '#FF7F50', disabled: boolean = false) => (
    <TouchableOpacity 
      style={[
        styles.actionButton, 
        { backgroundColor: disabled ? '#ccc' : color },
        disabled && styles.disabledButton
      ]} 
      onPress={onPress}
      disabled={disabled || isLoading}
    >
      <Text style={[styles.actionButtonText, disabled && styles.disabledButtonText]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const renderStatusCard = (title: string, value: string | number, color: string = '#333') => (
    <View style={styles.statusCard}>
      <Text style={styles.statusTitle}>{title}</Text>
      <Text style={[styles.statusValue, { color }]}>{value}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={goBack}>
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>🧪 Notification Debug Center</Text>
        <Text style={styles.subtitle}>Test and diagnose notification issues</Text>

        {/* Status Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 System Status</Text>
          
          <View style={styles.statusGrid}>
            {status ? (
              <>
                {renderStatusCard('Permissions', status.hasPermissions ? 'Granted' : 'Denied', status.hasPermissions ? '#4CAF50' : '#F44336')}
                {renderStatusCard('Scheduled', status.totalScheduled, '#FF7F50')}
                {renderStatusCard('Plans', status.totalPlans, '#2196F3')}
                {renderStatusCard('Health', status.hasIssues ? 'Issues' : 'Healthy', status.hasIssues ? '#FF9800' : '#4CAF50')}
              </>
            ) : (
              <Text style={styles.loadingText}>Loading status...</Text>
            )}
          </View>

          <TouchableOpacity style={styles.refreshButton} onPress={loadStatus} disabled={isLoading}>
            <Text style={styles.refreshButtonText}>🔄 Refresh Status</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Tests Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚡ Quick Tests</Text>
          {renderActionButton('🚨 Emergency Test', () => handleAction(async () => {
            const id = await emergencyAndroidNotificationTest();
            Alert.alert('Emergency Test', id ? `Immediate notification sent! ID: ${id}` : 'Emergency test failed');
          }, 'Emergency notification test'), '#FF0000')}
          {renderActionButton('Request Permissions', requestPermissions, '#4CAF50')}
          {renderActionButton('Quick Test (5s)', runQuickTest, '#2196F3')}
          {renderActionButton('Comprehensive Test', runComprehensiveTest, '#FF9800')}
          {renderActionButton('View All Notifications', viewAllNotifications, '#9C27B0')}
        </View>

        {/* Diagnostic Tools Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔍 Diagnostic Tools</Text>
          {renderActionButton('Audit System', () => handleAction(runAudit, 'System audit'), '#607D8B')}
          {renderActionButton('Debug Storage', () => handleAction(showStorageDebugAlert, 'Storage debug'), '#795548')}
          {renderActionButton('Clean Dead References', () => handleAction(async () => {
            const count = await cleanDeadNotificationReferences();
            Alert.alert('Cleanup Complete', `Updated ${count} plans with dead references`);
          }, 'Clean dead references'), '#FF5722')}
          {renderActionButton('Cleanup Orphaned', () => cleanupOrphaned(), '#FF5722')}
          {renderActionButton('Reset System', () => resetSystem(), '#F44336')}
        </View>

        {/* Audit Results */}
        {auditResult && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📋 Last Audit Results</Text>
            <View style={styles.auditResults}>
              <Text style={styles.auditText}>Total Scheduled: {auditResult.totalScheduled}</Text>
              <Text style={styles.auditText}>Valid Plans: {auditResult.validPlans.length}</Text>
              <Text style={styles.auditText}>Orphaned: {auditResult.orphanedNotifications.length}</Text>
              <Text style={styles.auditText}>Missing: {auditResult.missingNotifications.length}</Text>
              <Text style={styles.auditText}>Duplicates: {auditResult.duplicateNotifications.length}</Text>
              <Text style={[styles.auditText, styles.auditSummary]}>{auditResult.summary}</Text>
            </View>
          </View>
        )}

        {/* Instructions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💡 Debugging Guide</Text>
          <Text style={styles.instructionText}>
            <Text style={styles.bold}>For Notification Issues:</Text>{'\n'}
            1. <Text style={styles.bold}>Create Debug Plan</Text> - Test with 2-minute vitamin plan{'\n'}
            2. <Text style={styles.bold}>Emergency Test</Text> - Force immediate notification{'\n'}
            3. <Text style={styles.bold}>Audit System</Text> - Check for orphaned notifications{'\n'}
            4. <Text style={styles.bold}>Reset System</Text> - Rebuild all notifications{'\n'}{'\n'}
            <Text style={styles.bold}>If Nothing Works:</Text>{'\n'}
            • Delete and reinstall Expo Go app{'\n'}
            • This clears all notification state{'\n'}
            • Scan QR code to reload your project{'\n'}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF3E0',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 1,
    backgroundColor: '#6B7280',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
    paddingTop: 100,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF7F50',
    textAlign: 'center',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#000000',
    textAlign: 'center',
    marginBottom: 30,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  statusCard: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  statusTitle: {
    fontSize: 14,
    color: '#000000',
    marginBottom: 5,
  },
  statusValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingText: {
    fontSize: 16,
    color: '#000000',
    textAlign: 'center',
    width: '100%',
  },
  refreshButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignSelf: 'center',
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  actionButton: {
    backgroundColor: '#FF7F50',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  disabledButtonText: {
    color: '#999',
  },
  auditResults: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  auditText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  auditSummary: {
    fontWeight: 'bold',
    marginTop: 10,
    color: '#FF7F50',
  },
  instructionText: {
    fontSize: 14,
    color: '#000000',
    lineHeight: 22,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  bold: {
    fontWeight: 'bold',
    color: '#FF7F50',
  },
});