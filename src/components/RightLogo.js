// Exemplo: src/components/RightLogo.js
import { Image, StyleSheet, TouchableOpacity } from 'react-native';

const RightLogo = ({ onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      {/* Substitua 'require' pelo caminho real da sua imagem do logo */}
      <Image
        source={require('../../assets/images/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingRight: 15, // Adiciona espaço à direita
  },
  logo: {
    width: 30, // Ajuste o tamanho conforme necessário
    height: 30,
  },
});

export default RightLogo;