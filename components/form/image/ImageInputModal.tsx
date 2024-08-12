import { BaseModal } from "@/components/BaseModal";
import { Dispatch, SetStateAction } from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker';

interface ImageInputModalProps {
  visible: boolean;
  setVisible: Dispatch<SetStateAction<boolean>>;
  onChange: Dispatch<SetStateAction<string | undefined>>;
  title: string;
  description: string;
}

export function ImageInputModal({
  visible,
  setVisible,
  onChange,
  title,
  description,
}: ImageInputModalProps) {
  const pickImage = async (mode: 'library' | 'camera') => {
    let result;
    if (mode === 'library') {
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        quality: 1,
      });
    } else if (mode === 'camera') {
      result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        quality: 1,
      });
    }

    if (!result) return;

    if (!result.canceled) {
      onChange(result.assets[0].uri);
      setVisible(false);
    }
  };

  return (
    <BaseModal
      visible={visible}
      setVisible={() => setVisible(false)}
    >
      <Text style={styles.title}>
        {title}
      </Text>

      <Text style={styles.description}>
        {description}
      </Text>

      <TouchableOpacity style={styles.selectFromGalleryButton} onPress={() => pickImage('library')}>
        <MaterialCommunityIcons name="image-multiple-outline" size={28} color="#3a3a3a" />
        <Text style={styles.buttonText}>
          Selecione arquivo de seu dispositivo
        </Text>
      </TouchableOpacity>

      <Text>
        ou
      </Text>

      <TouchableOpacity style={styles.takePhotoButton} onPress={() => pickImage('camera')}>
        <MaterialCommunityIcons name="camera" size={28} color="#3a3a3a" />
        <Text style={styles.buttonText}>
          Tire uma foto
        </Text>
      </TouchableOpacity>
    </BaseModal>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#3a3a3a',
    marginBottom: 32,
  },
  selectFromGalleryButton: {
    backgroundColor: '#e7e7e7',
    borderWidth: 2,
    borderColor: '#f2af2a',
    padding: 16,
    borderRadius: 30,
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3a3a3a',
    textAlign: 'center',
  },
  takePhotoButton: {
    backgroundColor: '#ffe7b7',
    padding: 8,
    borderRadius: 50,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
  },
});