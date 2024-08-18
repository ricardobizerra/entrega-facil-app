import { GestureResponderEvent, StyleProp, StyleSheet, Text, TouchableOpacity, ViewStyle } from "react-native";

interface NextButtonProps {
  text: string;
  disabled?: boolean;
  onPress?: ((event: GestureResponderEvent) => void) | undefined;
  style?: StyleProp<ViewStyle>;
}

export function NextButton({
  text,
  disabled,
  onPress,
  style,
}: NextButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[styles.nextButton, style, !!disabled && styles.nextButtonDisabled]}
    >
      <Text style={styles.nextButtonText}>
        {text}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  nextButton: {
    backgroundColor: '#ffa500',
    padding: 16,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
    width: '100%',
  },
  nextButtonDisabled: {
    backgroundColor: '#ccc',
  },
  nextButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '700',
  },
});