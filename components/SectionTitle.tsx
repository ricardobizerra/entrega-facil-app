import { StyleProp, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from "react-native";
import ArrowLeft from '@/assets/images/ArrowLeft.svg';
import { useRouter } from "expo-router";

interface SectionTitleProps {
  title: string;
  style?: StyleProp<ViewStyle>;
}

export function SectionTitle({ title, style }: SectionTitleProps) {
  const router = useRouter();

  return (
    <View style={[styles.titleContainer, style]}>
      <TouchableOpacity onPress={() => router.back()}>
        <ArrowLeft />
      </TouchableOpacity>
      <Text style={styles.title}>
        {title}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    color: '#000',
  },
});