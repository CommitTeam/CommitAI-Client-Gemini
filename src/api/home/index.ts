import axiosInstance from '@/utils/refresh';

export const createPost = async (workout:string, level:string, targetRepCount:string, timeLimit:string, challengeType:string, coins:number, challenger:string) => {
  try {
    const response = await axiosInstance.get(`/api/post/createPost`)
    console.log('Create Post Data:', response.data)
    return response.data.primaryPostData
  } catch (error) {
    console.log('Login error:', error);
    throw error;
  }
}

export const getPost = async (username:string) => {

  try {
    const response = await axiosInstance.get(`/api/post/getPost`, {
      params: { username }
    })
    console.log('User Feed:', response.data)
    return response.data
  } catch (error) {
    console.log('UserFeed error', error)
    throw error
  }
}
