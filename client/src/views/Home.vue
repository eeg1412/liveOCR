<template>
  <div>
    <img :src="imgUrl" class="obs-img" />
    <div>
      <ul>
        <li v-for="(ocr, index) in ocrText" :key="index">
          {{ ocr.text }}
        </li>
      </ul>
    </div>
    <div>
      <ul>
        <li v-for="(trans, index) in transText" :key="index">
          {{ trans.translations[0].text }}
        </li>
      </ul>
    </div>
    <button @click="getShot">点击翻译</button>
  </div>
</template>
<script>
import OBSWebSocket from 'obs-websocket-js'
import { ref } from 'vue'
import { authApi } from '@/api'
export default {
  setup() {
    console.log(OBSWebSocket)
    const obs = new OBSWebSocket()
    obs
      .connect({
        address: 'localhost:4444',
        password: '123456',
      })
      .then(() => {
        console.log(`Success! We're connected & authenticated.`)
      })
      .then((data) => {
        console.log(`${data.scenes.length} Available Scenes!`)
      })
      .catch((err) => {
        // Promise convention dicates you have a catch on every chain.
        console.log(err)
      })

    obs.on('SwitchScenes', (data) => {
      console.log(`New Active Scene: ${data.sceneName}`)
    })

    // You must add this handler to avoid uncaught exceptions.
    obs.on('error', (err) => {
      console.error('socket error:', err)
    })
    // obs.on('TakeSourceScreenshot', (data) => {
    //   console.log(data)
    // })
    const imgUrl = ref('')
    const getShot = () => {
      console.log('sceneName')
      obs
        .send('TakeSourceScreenshot', {
          sourceName: 'test',
          embedPictureFormat: 'jpg',
        })
        .then((res) => {
          console.log(res)
          imgUrl.value = res.img
          const file = DataURIToBlob(res.img)
          const formData = new FormData()
          formData.append('webmasterfile', file)
          authApi.ocr(formData).then((ocrRes) => {
            ocrResCheck(ocrRes.data)
          })
        })
    }
    const DataURIToBlob = (dataURI) => {
      const splitDataURI = dataURI.split(',')
      const byteString =
        splitDataURI[0].indexOf('base64') >= 0
          ? atob(splitDataURI[1])
          : decodeURI(splitDataURI[1])
      const mimeString = splitDataURI[0].split(':')[1].split(';')[0]

      const ia = new Uint8Array(byteString.length)
      for (let i = 0; i < byteString.length; i++)
        ia[i] = byteString.charCodeAt(i)

      return new Blob([ia], { type: mimeString })
    }

    const ocrText = ref([])
    const ocrResCheck = (ocrRes) => {
      const textList = []
      ocrRes.regions.forEach((region) => {
        region.lines.forEach((line) => {
          let lineText = ''
          line.words.forEach((word) => {
            lineText = lineText + word.text
          })
          textList.push({ text: lineText })
        })
      })
      ocrText.value = textList
      authApi
        .trans(textList)
        .then((res) => {
          transText.value = res.data
        })
        .catch(() => {
          transText.value = []
        })
    }

    const transText = ref([])
    return { getShot, imgUrl, ocrText, transText }
  },
}
</script>
<style scoped>
.obs-img {
  max-width: 100%;
  height: auto;
}
</style>
