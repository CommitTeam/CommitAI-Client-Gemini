import React, { useEffect } from 'react';
import { Alert, Platform } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Camera } from 'expo-camera';
import {
  ChannelProfileType,
  ClientRoleType,
  VideoCodecType,
  RtcConnection,
  createAgoraRtcEngine,
  IRtcEngineEx,
} from 'react-native-agora';
import { FeedStackParamList } from '@/navigation/FeedStackParamList';
import { getToken } from '@/api/live';
import TransitionScreen from '@/components/shared/TransitionScreen';
import { getUsername } from '@/store/secureStore';
import { appId } from '@/utils/apiConfig';

let broadcasterEngine: IRtcEngineEx | null = null;

type WorkoutTransitionRouteProp = RouteProp<FeedStackParamList, 'WorkoutTransition'>;
type WorkoutTransitionNavigationProp = NativeStackNavigationProp<FeedStackParamList, 'WorkoutTransition'>;

const WorkoutTransition: React.FC = () => {
  const navigation = useNavigation<WorkoutTransitionNavigationProp>();
  const route = useRoute<WorkoutTransitionRouteProp>();
  const { exerciseType, target, duration } = route.params;

  const requestPermissions = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      const camStatus = await Camera.getCameraPermissionsAsync?.();
      let camGranted = camStatus?.status === 'granted';

      if (!camGranted) {
        const { status: camReq } = await Camera.requestCameraPermissionsAsync();
        camGranted = camReq === 'granted';
      }

      if (!camGranted) {
        Alert.alert('Permissions needed', 'Camera access is required.');
        return false;
      }
      return true;
    } else {
      const { status: camStatus } = await Camera.requestCameraPermissionsAsync();
      if (camStatus !== 'granted') {
        Alert.alert('Permissions needed', 'Camera access is required.');
        return false;
      }
      return true;
    }
  };

  const setupBroadcasterEventHandlers = (engine: IRtcEngineEx, channelId: string, uid: number) => {
    engine.addListener('onJoinChannelSuccess', (connection: RtcConnection) => {
      if (connection.channelId === channelId && connection.localUid === uid) {
        console.log(`[WorkoutTransition] Successfully joined channel: ${channelId} with UID: ${uid}`);
      }
    });

    engine.addListener('onFirstLocalVideoFrame', (source: any, width: number, height: number, elapsed: number) => {
      console.log(`[WorkoutTransition] First local video frame: ${width}x${height}`);
    });

    engine.addListener('onLocalVideoStateChanged', (source: any, state: any, error: any) => {
      console.log(`[WorkoutTransition] Local video state changed: state=${state}, error=${error}`);
    });

    engine.addListener('onUserJoined', (connection: RtcConnection, uid: number) => {
      console.log(`[WorkoutTransition] User joined channel ${connection.channelId}: ${uid}`);
    });

    engine.addListener('onError', (err: number, msg: string) => {
      console.error(`[WorkoutTransition] Agora error: ${err} - ${msg}`);
    });

    engine.addListener('onConnectionStateChanged', (connection: RtcConnection, state: any, reason: any) => {
      console.log(`[WorkoutTransition] Connection state changed: ${state}, reason: ${reason}`);
    });
  };

  const setupWorkout = async () => {
    try {
      console.log('[WorkoutTransition] Starting workout setup...');

      if (!appId) {
        throw new Error('Missing Agora App ID.');
      }

      const granted = await requestPermissions();
      if (!granted) {
        throw new Error('Camera permissions denied.');
      }

      const getChannelId = (exercise: string): string => {
        const lowerExercise = exercise.toLowerCase();
        if (lowerExercise.includes('push')) return 'pushUp';
        if (lowerExercise.includes('jump')) return 'jumpingJack';
        if (lowerExercise.includes('squat')) return 'squat';
        return exercise.replace(/\s+/g, '');
      };

      const channelId = getChannelId(exerciseType);
      const username = await getUsername();

      if (!username) {
        throw new Error('Username not found');
      }

      const tokenData = await getToken(channelId, username, 'broadcaster');
      console.log('[WorkoutTransition] Got token:', tokenData);

      if (!tokenData?.token || !tokenData?.uid) {
        throw new Error('Failed to get valid token or UID from backend');
      }

      const numericUid = Number(tokenData.uid);
      if (isNaN(numericUid) || numericUid <= 0) {
        throw new Error(`Invalid UID received: ${tokenData.uid}`);
      }

      if (broadcasterEngine) {
        try {
          broadcasterEngine.removeAllListeners();
          await broadcasterEngine.leaveChannel();
          broadcasterEngine.release();
          console.log('[WorkoutTransition] Cleaned up existing broadcaster engine');
        } catch (error) {
          console.error('[WorkoutTransition] Error cleaning up existing engine:', error);
        }
      }

      broadcasterEngine = createAgoraRtcEngine() as IRtcEngineEx;
      broadcasterEngine.initialize({ appId });
      setupBroadcasterEventHandlers(broadcasterEngine, channelId, numericUid);

      broadcasterEngine.enableVideo();
      broadcasterEngine.enableLocalVideo(true);
      broadcasterEngine.setChannelProfile(ChannelProfileType.ChannelProfileLiveBroadcasting);
      broadcasterEngine.setClientRole(ClientRoleType.ClientRoleBroadcaster);

      broadcasterEngine.setVideoEncoderConfiguration({
        codecType: VideoCodecType.VideoCodecVp8,
        dimensions: { width: 720, height: 900 },
        frameRate: 15,
        bitrate: 600,
        orientationMode: 2,
      });

      broadcasterEngine.startPreview();
      broadcasterEngine.muteLocalVideoStream(false);
      broadcasterEngine.muteAllRemoteAudioStreams(false);

      console.log('[WorkoutTransition] Broadcaster engine initialized with event handlers');

    
      try {
        await broadcasterEngine.leaveChannel();
        console.log('[WorkoutTransition] Left previous channel before joining new one');
      } catch (leaveErr) {
        console.warn('[WorkoutTransition] Error leaving previous channel (may be safe to ignore):', leaveErr);
      }

      const result = await broadcasterEngine.joinChannel(
        tokenData.token,
        channelId,
        numericUid,
        {
          channelProfile: ChannelProfileType.ChannelProfileLiveBroadcasting,
          clientRoleType: ClientRoleType.ClientRoleBroadcaster,
          publishMicrophoneTrack: false,
          publishCameraTrack: true,
          autoSubscribeAudio: false,
          autoSubscribeVideo: true,
        }
      );

      if (result !== 0) {
        throw new Error(`Failed to join channel: ${result}`);
      }

      console.log('[WorkoutTransition] Successfully joined channel as broadcaster');

      await new Promise(resolve => setTimeout(resolve, 1000));
      await broadcasterEngine.enableLocalVideo(true);
      await broadcasterEngine.muteLocalVideoStream(false);
      await broadcasterEngine.startPreview();

      console.log('[WorkoutTransition] Local video preview started');

      navigation.replace('LiveWorkout', {
        exerciseType,
        target,
        duration,
      });
    } catch (err: any) {
      console.error('[WorkoutTransition] error:', err);
      Alert.alert('Error setting up workout', err.message || 'Please try again.');
      navigation.goBack();
    }
  };

  useEffect(() => {
    setupWorkout();
  }, []);

  return <TransitionScreen message="to start your workout" />;
};

export default WorkoutTransition;
