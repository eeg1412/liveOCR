export default function (api) {
  return {
    register (data) {
      return api.post('/register', data)
    },
    login (data) {
      return api.post('/login', data)
    },
    ocr (data) {
      return api.post('https://gameocr.cognitiveservices.azure.com/vision/v3.2/ocr?language=ja', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Ocp-Apim-Subscription-Key': ''
        }
      })
    },
    trans (data) {
      return api.post('https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&to=zh-Hans', data, {
        headers: {
          'Ocp-Apim-Subscription-Key': '',
          'Ocp-Apim-Subscription-Region': ''
        }
      })
    }
  }
}
