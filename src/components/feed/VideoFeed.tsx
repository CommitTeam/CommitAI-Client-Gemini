import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FlatList, ListRenderItemInfo, Text, View } from "react-native";
import { VideoView, useVideoPlayer } from "expo-video";
import { Trophy } from "lucide-react-native";

type VideoItem = {
  signedUrl: string;
  challenger: string;
  workout:string;
  targetRepCount:string;
  winner:string;

};

type FeedItem = VideoItem & { __spacer?: boolean };

const RENDER_BATCH_SIZE = 4;
const STAGGER_OFFSET = 40;
const SPACER_URL = "__SPACER__";

type VideoTileProps = {
  item: VideoItem;
  index: number;
  isPlaying: boolean;
};

const VideoTile = React.memo(({ item, index, isPlaying }: VideoTileProps) => {
  const isRightColumn = index % 2 === 1;
  const offset = isRightColumn ? STAGGER_OFFSET : 0;

  const player = useVideoPlayer(item.signedUrl, (p) => {
    p.loop = true;
    p.muted = true;
  });

  const last = useRef<boolean | null>(null);
  useEffect(() => {
    if (last.current === isPlaying) return;
    last.current = isPlaying;

    if (isPlaying) player.play();
    else player.pause();
  }, [isPlaying, player]);

  return (
    <View className="flex-1 mb-3" style={{ transform: [{ translateY: offset }] }}>

      <View className="w-full rounded-2xl bg-black overflow-hidden" style={{ aspectRatio: 9 / 16 }}>
        <VideoView
          player={player}
          style={{ width: "100%", height: "100%", opacity: 0.68 }}
          contentFit="cover"
          allowsFullscreen={false}
          allowsPictureInPicture={false}
        />
      <View className="absolute top-6 left-3 flex-row items-center gap-1">
        {item.winner === "challenger" && (
          <>
            <Trophy size={12} color="#FACC15" />
            <Text className="text-yellow-400 text-[10px] font-bold">
              WINNER
            </Text>
          </>
        )}
      </View>

        <View
          pointerEvents="box-none"
          style={{ position: "absolute", left: 0, right: 0, bottom: 10, padding: 10 }}
        >
          <Text className="text-[15px] text-white font-bold mb-1">{item.challenger}</Text>
          <View className="flex-row justify-between w-full">
            <Text className="text-gray-300 text-[10px] font-bold">
              {item.workout.toUpperCase()}
            </Text>

            <Text className="text-yellow-400 text-[10px] font-bold">
              {item.targetRepCount}/{item.targetRepCount}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
});

const VideoFeed = ({ allVideos }: { allVideos: VideoItem[] }) => {
  const [renderCount, setRenderCount] = useState(RENDER_BATCH_SIZE);
  const [playingIndices, setPlayingIndices] = useState<Set<number>>(() => new Set());
  const loadingRef = useRef(false);

  const visibleVideos: FeedItem[] = useMemo(() => {
    const sliced = allVideos.slice(0, renderCount);
    const data: FeedItem[] = [...sliced];

    if (data.length % 2 === 1) {
      data.push({ signedUrl: SPACER_URL, challenger: "", workout:"", targetRepCount:"", winner:"", __spacer: true });
    }

    return data;
  }, [allVideos, renderCount]);

  const showMoreVideos = useCallback(() => {
    if (loadingRef.current) return;
    if (renderCount >= allVideos.length) return;

    loadingRef.current = true;
    setRenderCount((c) => Math.min(c + RENDER_BATCH_SIZE, allVideos.length));

    requestAnimationFrame(() => {
      loadingRef.current = false;
    });
  }, [renderCount, allVideos.length]);

  const viewabilityConfig = useRef({
    viewAreaCoveragePercentThreshold: 20,
    minimumViewTime: 0,
    waitForInteraction: false,
  }).current;

  const onViewableItemsChanged = useRef(
    ({
      viewableItems,
    }: {
      viewableItems: Array<{ index: number | null; isViewable?: boolean }>;
    }) => {
      const next = new Set<number>();
      for (const v of viewableItems) {
        if (v.isViewable && v.index != null) next.add(v.index);
      }
      setPlayingIndices(next);
    }
  ).current;

  const renderItem = useCallback(
    ({ item, index }: ListRenderItemInfo<FeedItem>) => {
      const isRightColumn = index % 2 === 1;
      const offset = isRightColumn ? STAGGER_OFFSET : 0;

      if (item.__spacer) {
        return (
          <View
            className="flex-1 mb-3"
            style={{ opacity: 0, transform: [{ translateY: offset }] }}
            pointerEvents="none"
          />
        );
      }

      return <VideoTile item={item} index={index} isPlaying={playingIndices.has(index)} />;
    },
    [playingIndices]
  );

  return (
    <View className="flex-1 mt-2">
      <View className="pl-4 mb-2">
        <Text className="text-[21px]">Arena</Text>
      </View>

      <FlatList
        data={visibleVideos}
        numColumns={2}
        keyExtractor={(item, index) => (item.__spacer ? `spacer-${index}` : `video-${index}`)}
        columnWrapperStyle={{ gap: 25, paddingHorizontal: 12 }}
        contentContainerStyle={{ paddingBottom: STAGGER_OFFSET + 12 }}
        renderItem={renderItem}
        onEndReachedThreshold={0.4}
        onEndReached={showMoreVideos}
        initialNumToRender={RENDER_BATCH_SIZE}
        removeClippedSubviews
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
      />
    </View>
  );
};

export default VideoFeed;
