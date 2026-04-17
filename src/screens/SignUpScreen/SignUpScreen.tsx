import { SafeAreaView } from "react-native-safe-area-context";
import { useForm, Controller } from "react-hook-form";
import {
  TextInput,
  TouchableOpacity,
  Text,
  ScrollView,
  ImageSourcePropType,
  Image,
  View,
} from "react-native";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { signUp } from "@/src/services/authService";
import { Button } from "../../components/TouchableOpacityButton";
import { globalStyles } from "./SignUpScreen.styles";
import logo from "@/assets/images/logoConstrutiva.png";
import { cpfMask } from "@/src/utils/CpfMask";
import { PhoneMask } from "@/src/utils/PhoneMask";
import { useState } from "react";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { AppAlert } from "@/src/components/AppAlert";

export function SignUpScreen() {
  type FormData = {
    fullName: string;
    CPF: string;
    birthday: string;
    phoneNumber: string;
    email: string;
    password: string;
  };

  const [isLoading, setIsLoading] = useState(false);
  //Verificação para saber onde está focado o input
  const [isFocused, setIsFocused] = useState<string | null>(null);

  //alerta
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{
    title: string;
    subTitle: string | null;
    messages: string[] | null;
    character: ImageSourcePropType | null;
  }>({
    title: "",
    subTitle: null,
    messages: null,
    character: null,
  });

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
      .transform((value) => value.replace(/\D/g, ""))
      .length(11, "O CPF deve ter 11 dígitos"),
    birthday: yup.string().required("A data é obrigatória"),
    email: yup
      .string()
      .email("E-mail inválido")
      .required("O e-mail é obrigatório"),
    phoneNumber: yup
      .string()
      .transform((value) => value.replace(/\D/g, ""))
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
    reset,
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

  function showAlert(
    title: string,
    subTitle: string,
    messages: string[] = [],
    character: ImageSourcePropType,
  ) {
    setAlertConfig({ title, subTitle, messages, character });
    setAlertVisible(true);
  }

  //chamando a função service para envio para o authenticator do firebase
  async function handleSignUp(data: FormData) {
    setIsLoading(true);
    try {
      await signUp(data);
      showAlert(
        "Agora, você faz parte da Construtiva",
        "Algumas dicas",
        [
          "Vasculhe todo o app",
          "Mantenha as atualizações em dia",
          "Se atente aos novos serviços",
        ],
        require("@/assets/images/deuCerto.png"),
      );
      reset();
    } catch (error: any) {
      if (error.code === "auth/email-already-in-use") {
        showAlert(
          "Este e-mail já possui um cadastro",
          "Tente acessar pela tela de Login",
          [],
          require("@/assets/images/erroFacil.png"),
        );
      } else {
        showAlert(
          "Erro interno no sistema",
          "O que fazer agora:",
          [
            "Feche o app e limpe a memória cachê",
            "Aguarde algumas horas e tente novamente",
            "Caso ainda não funcione, contate o suporte",
          ],
          require("@/assets/images/erroGrave.png"),
        );
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <KeyboardAwareScrollView
      contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
      enableOnAndroid={true}
    >
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
                onFocus={() => setIsFocused("fullName")}
                onBlur={() => setIsFocused(null)}
                value={value}
                placeholder="Digite seu nome completo"
                style={[
                  globalStyles.input,
                  { borderColor: isFocused === "fullName" ? "blue" : "gray" },
                ]}
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
                onChangeText={(text) => onChange(cpfMask(text))}
                onFocus={() => setIsFocused("CPF")}
                onBlur={() => setIsFocused(null)}
                value={value}
                placeholder="Digite seu CPF aqui"
                keyboardType="numeric"
                style={[
                  globalStyles.input,
                  { borderColor: isFocused === "CPF" ? "blue" : "gray" },
                ]}
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
                onFocus={() => setIsFocused("birthday")}
                onBlur={() => setIsFocused(null)}
                value={value}
                placeholder="Coloque sua data de nascimento"
                keyboardType="numeric"
                style={[
                  globalStyles.input,
                  { borderColor: isFocused === "birthday" ? "blue" : "gray" },
                ]}
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
                onChangeText={(text) => onChange(PhoneMask(text))}
                onFocus={() => setIsFocused("phoneNumber")}
                onBlur={() => setIsFocused(null)}
                value={value}
                placeholder="Insira seu telefone"
                keyboardType="numeric"
                style={[
                  globalStyles.input,
                  {
                    borderColor: isFocused === "phoneNumber" ? "blue" : "gray",
                  },
                ]}
              />
            )}
          />

          {errors.phoneNumber && (
            <Text style={globalStyles.error}>
              {errors.phoneNumber?.message}
            </Text>
          )}

          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                onChangeText={onChange}
                onFocus={() => setIsFocused("email")}
                onBlur={() => setIsFocused(null)}
                value={value}
                placeholder="Insira seu e-mail"
                style={[
                  globalStyles.input,
                  { borderColor: isFocused === "email" ? "blue" : "gray" },
                ]}
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
                onFocus={() => setIsFocused("password")}
                onBlur={() => setIsFocused(null)}
                value={value}
                secureTextEntry={true}
                placeholder="Digite sua senha"
                style={[
                  globalStyles.input,
                  { borderColor: isFocused === "password" ? "blue" : "gray" },
                ]}
              />
            )}
          />

          {errors.password && (
            <Text style={globalStyles.error}>{errors.password?.message}</Text>
          )}

          <Button
            title="Cadastrar"
            onPress={handleSubmit(handleSignUp)}
            loading={isLoading}
            loadingTitle="Cadastrando..."
          />
        </ScrollView>

        {/* alerta */}
        <AppAlert
          visible={alertVisible}
          character={alertConfig.character}
          title={alertConfig.title}
          subTitle={alertConfig.subTitle}
          messages={alertConfig.messages}
          buttonLabel="OK"
          onClose={() => setAlertVisible(false)}
        />
      </SafeAreaView>
    </KeyboardAwareScrollView>
  );
}
