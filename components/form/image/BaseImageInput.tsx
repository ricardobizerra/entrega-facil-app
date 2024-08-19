import { Dispatch, SetStateAction, useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { ImageInputModal } from './ImageInputModal';

interface ImageInputProps {
  value: string | undefined;
  onChange: Dispatch<SetStateAction<string | undefined>>;
  placeholder: string;
  modalTitle: string;
  modalDescription: string;
}

export function ImageInput({
  value,
  onChange,
  placeholder,
  modalTitle,
  modalDescription,
}: ImageInputProps) {
  const [openModal, setOpenModal] = useState(false);

  return (
    <>
      <TouchableOpacity style={styles.inputContainer} onPress={() => setOpenModal(true)}>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#aaa"
          value={value}
          editable={false}
        />
      </TouchableOpacity>

      <ImageInputModal
        visible={openModal}
        setVisible={setOpenModal}
        onChange={onChange}
        title={modalTitle}
        description={modalDescription}
      />
    </>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 12,
    paddingHorizontal: 8,
    backgroundColor: '#fff',
    width: '100%',
    height: 40,
  },
  input: {
    flex: 1,
    paddingLeft: 10,
    color: '#000',
  },
});