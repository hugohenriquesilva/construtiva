import { TextInput, StyleSheet } from "react-native";
import { useState } from "react";

interface InputPatternProps {
  name: string;
  placeholder: string;
  value: string;
  onChange: (text: string) => void;
}

export function InputPattern({
  name,
  placeholder,
  value,
  onChange,
}: InputPatternProps) {
  const [isFocused, setIsFocused] = useState<string | null>(null);
  return (
    <TextInput
      onChangeText={onChange}
      onFocus={() => setIsFocused(name)}
      onBlur={() => setIsFocused(null)}
      value={value}
      placeholder={placeholder}
      style={[
        style.input,
        { borderColor: isFocused === "fullName" ? "blue" : "gray" },
      ]}
    />
  );
}

const style = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    marginBottom: 15,
  },
});
