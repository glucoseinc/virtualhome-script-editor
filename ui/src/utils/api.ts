import axios from 'axios'

export const API_ENDPOINT = process.env.NEXT_PUBLIC_API_URL ?? 'http://kgrc4si.ml:7200'

export const generateVideo = async (sceneId: string, script: string[]) => {
  const sceneNum = Number(sceneId.replace('scene', '')) - 1
  return axios.post<{ ok: boolean; video_path: string | undefined; message: string | undefined }>(
    `${API_ENDPOINT}/api/generate_video`,
    JSON.stringify({
      scene: sceneNum,
      script: script,
    }),
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  )
}

export const deleteVideo = async (videoName: string) => {
  return axios.delete(`${API_ENDPOINT}/api/videos/${videoName}`)
}
