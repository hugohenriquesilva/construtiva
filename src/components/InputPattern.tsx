import { TextInput, StyleSheet, ImageSourcePropType,View, Image} from "react-native";
import { useState } from "react";
import iconEmail from "../../assets/images/IconEmail.png";
import iconSenha from "../../assets/images/IconSenha.png";
import { TouchableOpacity } from "react-native";
import EyeOpen from "../../assets/images/EyeOpen.png";
import EyeClose from "../../assets/images/EyeClose.png";


interface InputPatternProps {
  name: string;
  placeholder: string;
  value: string;
  onChange: (text: string) => void;
    icon?: ImageSourcePropType;
       secureTextEntry?: boolean,

}

export function InputPattern({
  name,
  placeholder,
  value,
  onChange,
  icon, 
secureTextEntry,

}: InputPatternProps) {
  const [isFocused, setIsFocused] = useState<string | null>(null);
 const [showPassword, setShowPassword] = useState(false);
  return (

    <View
    style={[
      style.container,
      { borderColor: isFocused === name ? "blue" : "gray" },
    ]}
  >
    {icon && <Image source={icon} style={style.icon}  resizeMode="contain"/>}
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
  secureTextEntry={secureTextEntry && !showPassword}

    />
 {secureTextEntry && (
  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
    <Image
      source={showPassword ? EyeOpen : EyeClose}
      style={style.eyeIcon}
      resizeMode="contain"
    />
  </TouchableOpacity>
)}
    </View>
  );
}

const style = StyleSheet.create({
container: {
  flexDirection: "row",
  alignItems: "center",
  borderWidth: 1,
  borderRadius: 10,
  backgroundColor: "#fff",
  paddingHorizontal: 10,
  marginBottom: 15,
  width: "100%",

  // sombra
  elevation: 3, // Android
  shadowColor: "#000",
  shadowOpacity: 0.1,
  shadowRadius: 5,
  shadowOffset: { width: 0, height: 2 },
},

  input: {
    flex: 1,
    padding: 15,
    fontSize: 16,
  },

  icon: {
    width: 25,
    height: 25,
    marginRight: 2,
  },
 eyeIcon: {
  width: 25,
  height: 25,
  marginLeft: 10,
}
  
});
