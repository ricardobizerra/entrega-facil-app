import React, { Dispatch, PropsWithChildren, SetStateAction } from "react";
import { Modal, StyleSheet, TouchableOpacity, View } from "react-native";
import AntDesignIcon from "@expo/vector-icons/AntDesign";

interface BaseModalProps {
  visible: boolean;
  setVisible: Dispatch<SetStateAction<boolean>>;
}

export function BaseModal({
  children,
  visible,
  setVisible,
}: PropsWithChildren<BaseModalProps>) {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={() => setVisible(false)}
    >
      <View style={styles.modal}>
        <View style={styles.modalContent}>
          <View style={styles.modalCloseContainer}>
            <TouchableOpacity
              onPress={()=> setVisible(false)}
            >
              <AntDesignIcon name="close" size={24} color="black" />
            </TouchableOpacity>
          </View>

          <View style={styles.modalMainContent}>
            {children}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: {
    flex: 1,
    backgroundColor: 'rgba(196, 196, 196, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  modalContent: {
    position: 'relative',
    padding: 24,
    width: '100%',
    height: 'auto',
    backgroundColor: '#fff',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    display: 'flex',
  },
  modalCloseContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    width: '100%',
  },
  modalMainContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    marginTop: 16,
  },
});