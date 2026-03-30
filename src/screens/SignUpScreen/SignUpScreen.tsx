import { SafeAreaView } from "react-native-safe-area-context";
import { useForm, Controller } from "react-hook-form";
import {
  TextInput,
  TouchableOpacity,
  Text,
  Alert,
  ScrollView,
  Image,
  View,
} from "react-native";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { signUp } from "@/src/services/authService";
import { Button } from "../../components/TouchableOpacityButton";
import { globalStyles } from "./SignUpScreen.styles";
import logo from "@/assets/images/logoConstrutiva.png";

export default function SignUpScreen() {
  type FormData = {
    fullName: string;
    CPF: string;
    birthday: string;
    phoneNumber: string;
    email: string;
    password: string;
  };

  //aqui eu estou criando um esquema, que basicamente é a maneira como vou receber os meus dados, eles certas regras. O formulário é um objeto com vários campos, o yup vai validar se esses objetos batem com as regras que eu criei
  const schema = yup.object({
    fullName: yup
      .string()
      .required("O nome completo é obrigatório")
      .min(10, "Deve ter ao menos 10 caracteres")
      .matches(/^[^\d]*$/, "Não pode conter números"),
    CPF: yup
      .string()
      .required("O CPF é obrigatório")
      .length(11, "CPF deve ter 11 dígitos"),
    birthday: yup.string().required("A data é obrigatória"),
    email: yup
      .string()
      .email("E-mail inválido")
      .required("O e-mail é obrigatório"),
    phoneNumber: yup
      .string()
      .required("Telefone obrigatório")
      .matches(/^[1-9]{2}9\d{8}$/, "Número de celular inválido"),
    password: yup
      .string()
      .min(8, "Mínimo 8 caracteres")
      .matches(/[0-9]/, "Precisa de um número")
      .matches(/[\W_]/, "Precisa de um caractere especial")
      .required("Senha obrigatória"),
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema), //aqui estou passando os dados do meu form pelas regras do yup
    defaultValues: {
      fullName: "",
      CPF: "",
      birthday: "",
      phoneNumber: "",
      email: "",
      password: "",
    },
  });

  async function handleSignUp(data: FormData) {
    try {
      await signUp(data);

      console.log("dados enviados:", data);
      alert("Usuário cadastrado com sucesso");
    } catch (error) {
      console.error(error);
      alert("Erro ao cadastrar usuário");
    }
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          padding: 20,
          paddingBottom: 20,
        }}
      >
        <View style={globalStyles.logoContainer}>
          <Image source={logo} style={globalStyles.logo} />
        </View>
        <Text style={globalStyles.title}>Criar minha conta</Text>
        <Text style={globalStyles.paragraph}>
          Insira seus dados para se cadastrar na plataforma
        </Text>
        <Controller
          control={control}
          name="fullName"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
              placeholder="Digite seu nome completo"
              style={globalStyles.input}
            />
          )}
        />

        {errors.fullName && (
          <Text style={globalStyles.error}>{errors.fullName?.message}</Text>
        )}

        <Controller
          control={control}
          name="CPF"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
              placeholder="Digite seu CPF aqui"
              keyboardType="numeric"
              style={globalStyles.input}
            />
          )}
        />

        {errors.CPF && (
          <Text style={globalStyles.error}>{errors.CPF?.message}</Text>
        )}

        <Controller
          control={control}
          name="birthday"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
              placeholder="Coloque sua data de nascimento"
              keyboardType="numeric"
              style={globalStyles.input}
            />
          )}
        />

        {errors.birthday && (
          <Text style={globalStyles.error}>{errors.birthday?.message}</Text>
        )}

        <Controller
          control={control}
          name="phoneNumber"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
              placeholder="Insira seu telefone"
              keyboardType="numeric"
              style={globalStyles.input}
            />
          )}
        />

        {errors.phoneNumber && (
          <Text style={globalStyles.error}>{errors.phoneNumber?.message}</Text>
        )}

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
              placeholder="Insira seu e-mail"
              style={globalStyles.input}
            />
          )}
        />

        {errors.email && (
          <Text style={globalStyles.error}>{errors.email?.message}</Text>
        )}

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
              secureTextEntry={true}
              placeholder="Digite sua senha"
              style={globalStyles.input}
            />
          )}
        />

        {errors.password && (
          <Text style={globalStyles.error}>{errors.password?.message}</Text>
        )}

        <Button title="Cadastrar" onPress={handleSubmit(handleSignUp)} />
      </ScrollView>
    </SafeAreaView>
  );
}
