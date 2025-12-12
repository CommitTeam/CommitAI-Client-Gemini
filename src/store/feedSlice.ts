import { createSlice, PayloadAction } from "@reduxjs/toolkit";
interface FeedState {
    uid: number;
    live: boolean;
    postId: string;
    challenger: string;
}

const initialState:FeedState={
    uid:0,
    live: false,
    postId:'',
    challenger: '',
};

const feedSlice = createSlice({
    name: "feed",
    initialState,
    reducers: {
        setUid: (state, action:PayloadAction<number>) => {
            state.uid = action.payload;
        },
        setLive: (state, action:PayloadAction<boolean>) => {
            state.live = action.payload;
        },
        setPostId: (state, action:PayloadAction<string>) => {
            state.postId = action.payload;
        },
        setChallenger:(state, action:PayloadAction<string>) => {
            state.challenger = action.payload;
        },
        resetFeed: () => initialState,
    }
})

export const { setUid, setLive, setPostId, setChallenger, resetFeed} = feedSlice.actions;
export default feedSlice.reducer;