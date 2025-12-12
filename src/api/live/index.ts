import axiosInstance from "@/utils/refresh";

export const getStatus = async (status:string) => {
    try {
        const { data } = await axiosInstance.get(`/api/liveWorkout/getStatus`, {
        params: { status },
        });

        console.log("Get Status:", data);
        return data;

    } catch (error) {
        console.error("Get Status Error:", error);
        throw error;
    }
};

export const setStatus = async (postId:string) => {
try {
    const { data } = await axiosInstance.post(`/api/liveWorkout/setStatus`, {
    postId
    })
    console.log ("Set Status:", data)
} catch (error) {
    console.error("Set Status Error", error)
    throw error

}
}