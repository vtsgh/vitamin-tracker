import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface NoteInputModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (note: string) => Promise<boolean>;
  vitaminName: string;
  existingNote?: string;
}

const DEFAULT_PROMPTS = `How did you feel?

Taken with food or empty stomach?

Energy level: [1-5]/5

Side effects (if any):`;

export const NoteInputModal: React.FC<NoteInputModalProps> = ({
  visible,
  onClose,
  onSave,
  vitaminName,
  existingNote
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [noteText, setNoteText] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      // Load existing note or default prompts
      setNoteText(existingNote || DEFAULT_PROMPTS);
    }
  }, [visible, existingNote]);

  const handleSave = async () => {
    if (!noteText.trim()) {
      Alert.alert('Empty Note', 'Please add some content or tap Cancel to close without saving.');
      return;
    }

    setIsSaving(true);
    try {
      const success = await onSave(noteText);
      if (success) {
        Alert.alert('✅ Note Saved!', `Your note for ${vitaminName} has been saved.`);
        onClose();
      } else {
        Alert.alert('Error', 'Failed to save note. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save note. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClear = () => {
    Alert.alert(
      'Clear Note',
      existingNote
        ? 'This will delete your saved note. Continue?'
        : 'This will clear the text. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => setNoteText('')
        }
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Title */}
          <View style={styles.titleSection}>
            <Text style={styles.icon}>📝</Text>
            <Text style={styles.title}>Add Note</Text>
            <Text style={styles.subtitle}>{vitaminName}</Text>
          </View>

          {/* Instructions */}
          <View style={styles.instructionsBox}>
            <Text style={styles.instructionsText}>
              💡 Track how you felt, timing, or any observations. You can edit the prompts below or write your own notes.
            </Text>
          </View>

          {/* Note Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              value={noteText}
              onChangeText={setNoteText}
              placeholder="Add your notes here..."
              placeholderTextColor="#999"
              multiline
              textAlignVertical="top"
              maxLength={500}
            />
            <Text style={styles.charCount}>{noteText.length}/500</Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.button, styles.clearButton]}
              onPress={handleClear}
              disabled={isSaving}
            >
              <Text style={styles.clearButtonText}>Clear</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.saveButton, isSaving && styles.buttonDisabled]}
              onPress={handleSave}
              disabled={isSaving}
            >
              <Text style={styles.saveButtonText}>
                {isSaving ? 'Saving...' : 'Save Note'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Privacy Note */}
          <View style={styles.privacyNote}>
            <Text style={styles.privacyText}>
              🔒 Your notes are stored locally on your device only
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

function createStyles(colors: any) {
  return StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 10,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  icon: {
    fontSize: 48,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  instructionsBox: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  instructionsText: {
    fontSize: 13,
    color: colors.smartRemindersButton,
    lineHeight: 20,
  },
  inputContainer: {
    backgroundColor: colors.surface,
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    elevation: 2,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  textInput: {
    fontSize: 15,
    color: colors.textPrimary,
    minHeight: 200,
    maxHeight: 300,
    lineHeight: 22,
  },
  charCount: {
    fontSize: 12,
    color: colors.textTertiary,
    textAlign: 'right',
    marginTop: 10,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  clearButton: {
    backgroundColor: colors.border,
  },
  clearButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: colors.primary,
  },
  saveButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  privacyNote: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  privacyText: {
    fontSize: 12,
    color: colors.smartRemindersButton,
    textAlign: 'center',
  },
});
}
