import { StyleSheet } from 'react-native';

export const LoginStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#eee",  
    justifyContent: "center",
    padding: 20,
    display: "flex",
    
  },

  logo: {
    width: 150,
    height: 150,
    marginBottom: 10,
  },

  title: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 30,
    color: "#555",
    
  },

  forgot: {
     width: "100%",
  textAlign: "right",
  paddingRight: 10,
    marginBottom: 20,
    color: "#777",
    fontSize: 13,
    textDecorationLine: "underline",
     
  },

  register: {
    marginTop: 15,
    fontSize: 15,
    color: "#555",
  },

  link: {
    color: "#5B6CFF",
    fontWeight: "bold",
  },

  hero:{
    alignItems: "center",
  },

  divider: {
  flexDirection: "row",
  alignItems: "center",
  marginVertical: 20,
},

line: {
  flex: 1,
  height: 1,
  backgroundColor: "#ccc",
},

text: {
  marginHorizontal: 10,
  color: "#777",
  fontSize: 12,
},

ContainerRegister: {
  alignItems:"center",
  justifyContent: "center",
  marginTop: 160,
}
});




