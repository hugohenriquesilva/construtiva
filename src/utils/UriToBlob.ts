// Lê uma URI local (file://, content://) como Blob para enviar ao Firebase Storage.
// Usa XMLHttpRequest porque fetch(uri).blob() gera blobs inválidos/vazios no React Native recente.
export function uriToBlob(uri: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = () => resolve(xhr.response as Blob);
    xhr.onerror = () => reject(new Error(`Não foi possível ler a imagem local (uri: ${uri})`));
    xhr.responseType = 'blob';
    xhr.open('GET', uri, true);
    xhr.send(null);
  });
}
