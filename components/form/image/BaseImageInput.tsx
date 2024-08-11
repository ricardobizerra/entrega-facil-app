import { Dispatch, SetStateAction, useState } from 'react';
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ImageInputModal } from './ImageInputModal';

interface ImageInputProps {
  value: string | undefined;
  onChange: Dispatch<SetStateAction<string | undefined>>;
  placeholder: string;
}

export function ImageInput({
  value,
  onChange,
  placeholder,
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
        title="Envie uma foto da frente de sua CNH"
        description="Nossa equipe verificará sua habilitação para validar seu cadastro em nosso time de colaboradores"
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
    width: '80%',
    height: 40,
  },
  input: {
    flex: 1,
    paddingLeft: 10,
    color: '#000',
  },
});